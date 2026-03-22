// Firebase Cloud Messaging — push notifications for interview events.
// Sends to the candidate's FCM device token stored in Firestore.

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminServices() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return { messaging: getMessaging(), db: getFirestore() }
}

/**
 * Send a push notification to a specific user by their Firebase UID.
 * Silently skips if the user has no FCM token registered.
 */
export async function sendToUser(uid, { title, body, data = {} }) {
  const { messaging, db } = getAdminServices()

  const userDoc = await db.collection('users').doc(uid).get()
  const fcmToken = userDoc.data()?.fcmToken
  if (!fcmToken) return // User hasn't granted push notification permission

  try {
    await messaging.send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'interviews' },
      },
    })
  } catch (err) {
    // Invalid token — remove it from Firestore so we don't keep trying
    if (err.code === 'messaging/registration-token-not-registered') {
      await db.collection('users').doc(uid).update({ fcmToken: null })
    } else {
      console.error(`[notifications] FCM error for ${uid}:`, err.message)
    }
  }
}

// ─── Pre-built notification templates ────────────────────────────────────────

export function interviewRequestNotification(company, jobTitle) {
  return {
    title: `Interview request from ${company}`,
    body: `You've been invited to interview for ${jobTitle}. Tap to accept or decline.`,
    data: { type: 'interview_request' },
  }
}

export function interviewConfirmedNotification(company, formattedDate) {
  return {
    title: '✅ Interview confirmed',
    body: `Your interview with ${company} is confirmed for ${formattedDate}.`,
    data: { type: 'interview_confirmed' },
  }
}

export function interviewReminder24h(company, formattedTime) {
  return {
    title: `Interview tomorrow — ${company}`,
    body: `Your interview is at ${formattedTime}. Don't forget to prepare!`,
    data: { type: 'interview_reminder_24h' },
  }
}

export function interviewReminder1h(company, platform, formattedTime) {
  return {
    title: `Interview in 1 hour — ${company}`,
    body: `Your ${platform} interview starts at ${formattedTime}. Join link is ready.`,
    data: { type: 'interview_reminder_1h' },
  }
}

export function interviewReminder10min(company, platform) {
  return {
    title: `⏱ Starting soon — ${company}`,
    body: `Your ${platform} interview is in 10 minutes. Tap to join.`,
    data: { type: 'interview_reminder_10min' },
  }
}
