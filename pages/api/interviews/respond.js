// POST /api/interviews/respond
// Candidate accepts or declines an interview request.
// On accept: sends confirmation notification + pushes ATS note.
// On decline: notifies recruiter + pushes ATS note.

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { sendToUser, interviewConfirmedNotification } from '../../../lib/interviews/notifications'
import { pushInterviewNote } from '../../../lib/interviews/ats-notes'
import { format } from 'date-fns'

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

  const { interviewId, response } = req.body

  if (!interviewId || !['accepted', 'declined'].includes(response)) {
    return res.status(400).json({ error: 'interviewId and response (accepted|declined) are required' })
  }

  const db = getAdminDb()
  const ref = db.collection('interviews').doc(interviewId)
  const doc = await ref.get()

  if (!doc.exists) return res.status(404).json({ error: 'Interview not found' })

  const interview = doc.data()

  if (interview.status !== 'pending') {
    return res.status(409).json({ error: `Interview is already ${interview.status}` })
  }

  // ── Update status ──────────────────────────────────────────────────────────
  await ref.update({
    status: response,
    updatedAt: FieldValue.serverTimestamp(),
  })

  // ── Load ATS connection for note ───────────────────────────────────────────
  let atsConnection = null
  if (interview.atsConnectionId) {
    const connDoc = await db.collection('ats_connections').doc(interview.atsConnectionId).get()
    if (connDoc.exists) atsConnection = connDoc.data()
  }

  // ── Post-accept actions ────────────────────────────────────────────────────
  if (response === 'accepted') {
    const scheduledAt = interview.scheduledAt?.toDate?.() ?? new Date(interview.scheduledAt)
    const formattedDate = format(scheduledAt, "EEE d MMM 'at' h:mm a")

    // Confirm notification back to candidate
    await sendToUser(
      interview.candidateId,
      interviewConfirmedNotification(interview.company, formattedDate)
    )

    // Push ATS note
    await pushInterviewNote(atsConnection, { ...interview, id: interviewId }, 'accepted')
      .catch((err) => console.warn('[interviews/respond] ATS note failed:', err.message))
  }

  if (response === 'declined') {
    await pushInterviewNote(atsConnection, { ...interview, id: interviewId }, 'declined')
      .catch((err) => console.warn('[interviews/respond] ATS note failed:', err.message))
  }

  console.log(`[interviews/respond] Interview ${interviewId} — ${response}`)
  return res.status(200).json({ status: response })
}
