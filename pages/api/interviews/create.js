// POST /api/interviews/create
// Books an interview: generates a Zoom or Google Meet link, stores the
// interview in Firestore, sends a push notification to the candidate,
// and logs a note in the client's ATS.

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { createZoomMeeting } from '../../../lib/interviews/zoom'
import { createGoogleMeet } from '../../../lib/interviews/google-meet'
import { sendToUser, interviewRequestNotification } from '../../../lib/interviews/notifications'
import { pushInterviewNote } from '../../../lib/interviews/ats-notes'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    matchId, candidateId, jobId, company, jobTitle,
    scheduledAt, durationMinutes = 45, platform, notes,
  } = req.body

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!matchId || !candidateId || !jobId || !company || !jobTitle || !scheduledAt || !platform) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  if (!['zoom', 'googleMeet'].includes(platform)) {
    return res.status(400).json({ error: 'platform must be zoom or googleMeet' })
  }

  const startTime = new Date(scheduledAt)
  if (isNaN(startTime.getTime()) || startTime < new Date()) {
    return res.status(400).json({ error: 'scheduledAt must be a valid future datetime' })
  }

  const db = getAdminDb()

  // ── Load job to get ATS connection (for note pushing) ──────────────────────
  const jobDoc = await db.collection('jobs').doc(jobId).get()
  const job = jobDoc.data() ?? {}

  let atsConnection = null
  if (job.atsConnectionId) {
    const connDoc = await db.collection('ats_connections').doc(job.atsConnectionId).get()
    if (connDoc.exists) atsConnection = connDoc.data()
  }

  // ── Generate meeting link ──────────────────────────────────────────────────
  const meetingTitle = `Interview — ${jobTitle} at ${company}`
  let meetingData

  try {
    if (platform === 'zoom') {
      meetingData = await createZoomMeeting({
        topic: meetingTitle,
        startTime,
        duration: durationMinutes,
        agenda: notes ?? '',
      })
    } else {
      meetingData = await createGoogleMeet({
        title: meetingTitle,
        startTime,
        durationMinutes,
        description: notes ?? '',
      })
      // Normalise shape to match Zoom's response
      meetingData = {
        meetingId: meetingData.eventId,
        joinUrl: meetingData.meetUrl,
        hostUrl: meetingData.htmlLink,
        password: '',
      }
    }
  } catch (err) {
    console.error('[interviews/create] Meeting creation failed:', err.message)
    return res.status(502).json({ error: `Could not create ${platform} meeting: ${err.message}` })
  }

  // ── Save interview to Firestore ────────────────────────────────────────────
  const interviewDoc = {
    matchId,
    candidateId,
    jobId,
    company,
    jobTitle,
    scheduledAt: startTime,
    durationMinutes,
    platform,
    meetingUrl: meetingData.joinUrl,
    hostUrl: meetingData.hostUrl ?? null,
    meetingId: meetingData.meetingId ?? null,
    password: meetingData.password ?? null,
    status: 'pending',
    remindersSent: [],
    atsNoteCreated: false,
    notes: notes ?? null,
    atsJobId: job.atsJobId ?? null,
    atsConnectionId: job.atsConnectionId ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }

  const ref = await db.collection('interviews').add(interviewDoc)

  // ── Send push notification to candidate ────────────────────────────────────
  await sendToUser(candidateId, interviewRequestNotification(company, jobTitle))

  // ── Push ATS note ──────────────────────────────────────────────────────────
  try {
    const savedDoc = await ref.get()
    await pushInterviewNote(atsConnection, { ...savedDoc.data(), id: ref.id }, 'booked')
    await ref.update({ atsNoteCreated: true })
  } catch (err) {
    console.warn('[interviews/create] ATS note failed (non-fatal):', err.message)
  }

  console.log(`[interviews/create] Booked: ${jobTitle} at ${company} — ${startTime.toISOString()} via ${platform}`)

  return res.status(201).json({
    interviewId: ref.id,
    meetingUrl: meetingData.joinUrl,
    hostUrl: meetingData.hostUrl,
    platform,
  })
}
