// GET /api/interviews/remind
// Vercel Cron — runs every 30 minutes.
// Scans accepted interviews and sends push reminders at:
//   - 24 hours before
//   - 1 hour before
//   - 10 minutes before
// Each reminder is sent exactly once (tracked in interview.remindersSent).

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import {
  sendToUser,
  interviewReminder24h,
  interviewReminder1h,
  interviewReminder10min,
} from '../../../lib/interviews/notifications'
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
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db = getAdminDb()
  const now = new Date()

  // Fetch all accepted interviews in the next 25 hours
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const snapshot = await db
    .collection('interviews')
    .where('status', '==', 'accepted')
    .where('scheduledAt', '>=', Timestamp.fromDate(now))
    .where('scheduledAt', '<=', Timestamp.fromDate(windowEnd))
    .get()

  if (snapshot.empty) {
    return res.status(200).json({ message: 'No upcoming interviews', sent: 0 })
  }

  let totalSent = 0

  for (const doc of snapshot.docs) {
    const interview = doc.data()
    const scheduledAt = interview.scheduledAt.toDate()
    const remindersSent = interview.remindersSent ?? []
    const minutesUntil = (scheduledAt.getTime() - now.getTime()) / 60_000
    const platform = interview.platform === 'zoom' ? 'Zoom' : 'Google Meet'
    const newReminders = []

    // ── 24h reminder ─────────────────────────────────────────────────────────
    if (!remindersSent.includes('24h') && minutesUntil <= 24 * 60 && minutesUntil > 60) {
      const timeStr = format(scheduledAt, "h:mm a 'tomorrow'")
      await sendToUser(interview.candidateId, interviewReminder24h(interview.company, timeStr))
      newReminders.push('24h')
      totalSent++
    }

    // ── 1h reminder ──────────────────────────────────────────────────────────
    if (!remindersSent.includes('1h') && minutesUntil <= 65 && minutesUntil > 15) {
      const timeStr = format(scheduledAt, 'h:mm a')
      await sendToUser(interview.candidateId, interviewReminder1h(interview.company, platform, timeStr))
      newReminders.push('1h')
      totalSent++
    }

    // ── 10min reminder ───────────────────────────────────────────────────────
    if (!remindersSent.includes('10min') && minutesUntil <= 15 && minutesUntil > 0) {
      await sendToUser(interview.candidateId, interviewReminder10min(interview.company, platform))
      newReminders.push('10min')
      totalSent++
    }

    // ── Persist which reminders were sent ─────────────────────────────────────
    if (newReminders.length > 0) {
      await doc.ref.update({
        remindersSent: FieldValue.arrayUnion(...newReminders),
        updatedAt: FieldValue.serverTimestamp(),
      })
      console.log(`[remind] Sent [${newReminders.join(', ')}] for interview ${doc.id} (${interview.company})`)
    }
  }

  return res.status(200).json({
    checked: snapshot.size,
    sent: totalSent,
  })
}
