// GET /api/ats/sync-all
// Called by Vercel Cron every 6 hours.
// Iterates all active ATS connections and triggers a sync for each one.
// Protected by the CRON_SECRET env var which Vercel sets automatically.

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

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
  // Verify this is a legitimate Vercel Cron invocation
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getAdminDb()

  const connectionsSnap = await db
    .collection('ats_connections')
    .where('status', 'in', ['active', 'warning'])
    .get()

  if (connectionsSnap.empty) {
    return res.status(200).json({ message: 'No active connections', synced: 0 })
  }

  const connectionIds = connectionsSnap.docs.map((doc) => doc.id)
  console.log(`[ats/sync-all] Syncing ${connectionIds.length} connections`)

  // Fire syncs concurrently — each sync is independently logged and fault-tolerant
  const results = await Promise.allSettled(
    connectionIds.map((connectionId) =>
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ats/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, syncType: 'scheduled' }),
      }).then((r) => r.json())
    )
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  console.log(`[ats/sync-all] Done: ${succeeded} succeeded, ${failed} failed`)

  return res.status(200).json({
    total: connectionIds.length,
    succeeded,
    failed,
  })
}
