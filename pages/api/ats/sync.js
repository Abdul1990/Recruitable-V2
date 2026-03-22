// POST /api/ats/sync
// Pulls jobs from the connected ATS, parses them with Claude, and upserts
// them into the /jobs Firestore collection.
//
// Body: { connectionId: string }
//
// Can be called:
//   - Manually from the client portal ("Sync Now" button)
//   - On a Vercel cron schedule (vercel.json cron)
//   - Via the webhook route when the ATS sends a new-job event

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { fetchGreenhouseJobs } from '../../../lib/ats/adapters/greenhouse'
import { fetchLeverJobs } from '../../../lib/ats/adapters/lever'
import { fetchWorkdayJobs } from '../../../lib/ats/adapters/workday'
import { fetchGenericJobs } from '../../../lib/ats/adapters/generic'

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { connectionId, syncType = 'manual' } = req.body
  if (!connectionId || typeof connectionId !== 'string') {
    return res.status(400).json({ error: 'connectionId is required' })
  }

  const db = getAdminDb()

  // ── Load connection ─────────────────────────────────────────────────────────
  const connDoc = await db.collection('ats_connections').doc(connectionId).get()
  if (!connDoc.exists) {
    return res.status(404).json({ error: 'ATS connection not found' })
  }

  const conn = connDoc.data()
  if (conn.status === 'paused') {
    return res.status(403).json({ error: 'This ATS connection is paused' })
  }

  // ── Create sync log ─────────────────────────────────────────────────────────
  const logRef = await db.collection('ats_sync_logs').add({
    connectionId,
    syncType,
    status: 'running',
    jobsFound: 0,
    jobsCreated: 0,
    jobsUpdated: 0,
    jobsDeactivated: 0,
    errors: [],
    startedAt: FieldValue.serverTimestamp(),
    completedAt: null,
  })

  console.log(`[ats/sync] Starting ${conn.atsType} sync for ${conn.companyName} (log: ${logRef.id})`)

  try {
    // ── Fetch jobs from ATS ───────────────────────────────────────────────────
    const parsedJobs = await fetchFromAts(conn)

    console.log(`[ats/sync] Fetched ${parsedJobs.length} jobs from ${conn.atsType}`)

    // ── Get existing ATS job IDs in Firestore (for deactivation detection) ────
    const existingSnapshot = await db.collection('jobs')
      .where('atsConnectionId', '==', connectionId)
      .where('isActive', '==', true)
      .get()

    const existingByAtsId = new Map(
      existingSnapshot.docs.map((doc) => [doc.data().atsJobId, doc.id])
    )

    // ── Upsert jobs into Firestore ─────────────────────────────────────────────
    let jobsCreated = 0
    let jobsUpdated = 0
    const seenAtsIds = new Set()
    const errors = []

    const batch = db.batch()

    for (const job of parsedJobs) {
      try {
        if (!job.title || !job.atsJobId) continue

        seenAtsIds.add(job.atsJobId)
        const firestoreId = existingByAtsId.get(job.atsJobId)

        const jobDoc = {
          ...job,
          atsConnectionId: connectionId,
          companyName: conn.companyName,
          isActive: true,
          posted: formatPostedDate(job.postedAt),
          updatedAt: FieldValue.serverTimestamp(),
        }

        if (firestoreId) {
          // Update existing job
          batch.update(db.collection('jobs').doc(firestoreId), jobDoc)
          jobsUpdated++
        } else {
          // Create new job
          jobDoc.createdAt = FieldValue.serverTimestamp()
          batch.set(db.collection('jobs').doc(), jobDoc)
          jobsCreated++
        }
      } catch (err) {
        errors.push(`Job ${job.atsJobId}: ${err.message}`)
      }
    }

    // ── Deactivate jobs no longer in ATS ──────────────────────────────────────
    let jobsDeactivated = 0
    for (const [atsJobId, firestoreDocId] of existingByAtsId) {
      if (!seenAtsIds.has(atsJobId)) {
        batch.update(db.collection('jobs').doc(firestoreDocId), {
          isActive: false,
          deactivatedAt: FieldValue.serverTimestamp(),
        })
        jobsDeactivated++
      }
    }

    await batch.commit()

    // ── Update connection + log ────────────────────────────────────────────────
    await db.collection('ats_connections').doc(connectionId).update({
      lastSyncAt: FieldValue.serverTimestamp(),
      jobCount: jobsCreated + jobsUpdated,
      status: errors.length > 0 ? 'warning' : 'active',
      updatedAt: FieldValue.serverTimestamp(),
    })

    await logRef.update({
      status: 'completed',
      jobsFound: parsedJobs.length,
      jobsCreated,
      jobsUpdated,
      jobsDeactivated,
      errors,
      completedAt: FieldValue.serverTimestamp(),
    })

    console.log(`[ats/sync] Done: +${jobsCreated} created, ~${jobsUpdated} updated, -${jobsDeactivated} deactivated`)

    return res.status(200).json({
      syncLogId: logRef.id,
      jobsFound: parsedJobs.length,
      jobsCreated,
      jobsUpdated,
      jobsDeactivated,
      errors,
    })
  } catch (err) {
    console.error('[ats/sync] Fatal error:', err)

    await db.collection('ats_connections').doc(connectionId).update({
      status: 'error',
      updatedAt: FieldValue.serverTimestamp(),
    })

    await logRef.update({
      status: 'failed',
      errors: [err.message],
      completedAt: FieldValue.serverTimestamp(),
    })

    return res.status(500).json({ error: `Sync failed: ${err.message}`, syncLogId: logRef.id })
  }
}

// ─── ATS dispatcher ───────────────────────────────────────────────────────────

async function fetchFromAts(conn) {
  const { atsType, identifier, companyName } = conn

  switch (atsType) {
    case 'greenhouse':
      return fetchGreenhouseJobs(identifier, companyName)
    case 'lever':
      return fetchLeverJobs(identifier, companyName)
    case 'workday':
      return fetchWorkdayJobs(identifier, companyName)
    case 'bamboohr':
    case 'smartrecruiters':
    case 'ashby':
    case 'jobvite':
    case 'generic':
      return fetchGenericJobs(identifier, companyName)
    default:
      throw new Error(`Unknown ATS type: ${atsType}`)
  }
}

function formatPostedDate(date) {
  if (!date) return 'Recently'
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}
