// POST /api/ats/webhook/[connectionId]
// Receives real-time webhook events from ATS systems when jobs are
// created, updated, or closed. Triggers an incremental sync immediately.
//
// Supported ATS webhook formats:
//   - Greenhouse: HMAC-SHA256 signed in Signature header
//   - Lever: HMAC-SHA256 signed in X-Lever-Signature header
//   - Ashby: HMAC-SHA256 signed in X-Ashby-Webhook-Secret header
//   - Generic: Payload includes webhookSecret field for verification

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import crypto from 'crypto'

export const config = {
  api: { bodyParser: false }, // Must read raw body for HMAC verification
}

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

  const { connectionId } = req.query

  // ── Read raw body for HMAC verification ────────────────────────────────────
  const rawBody = await readRawBody(req)
  const db = getAdminDb()

  // ── Load connection to get webhook secret ──────────────────────────────────
  const connDoc = await db.collection('ats_connections').doc(connectionId).get()
  if (!connDoc.exists) {
    return res.status(404).json({ error: 'Connection not found' })
  }

  const conn = connDoc.data()

  // ── Verify signature ────────────────────────────────────────────────────────
  const signatureHeader =
    req.headers['signature'] ||
    req.headers['x-lever-signature'] ||
    req.headers['x-ashby-webhook-secret'] ||
    req.headers['x-webhook-secret']

  if (signatureHeader && conn.webhookSecret) {
    const isValid = verifySignature(rawBody, signatureHeader, conn.webhookSecret, conn.atsType)
    if (!isValid) {
      console.warn(`[ats/webhook] Invalid signature for connection ${connectionId}`)
      return res.status(401).json({ error: 'Invalid webhook signature' })
    }
  }

  // ── Parse event ─────────────────────────────────────────────────────────────
  let payload
  try {
    payload = JSON.parse(rawBody.toString())
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' })
  }

  const event = normaliseEvent(payload, conn.atsType)
  console.log(`[ats/webhook] ${conn.atsType} event '${event.type}' for ${conn.companyName}`)

  // ── Respond immediately (ATS systems time out if we don't respond fast) ────
  res.status(200).json({ received: true })

  // ── Trigger sync in background ─────────────────────────────────────────────
  // We call our own sync endpoint rather than inlining the logic so that the
  // sync runs with the full 60-second Vercel function timeout.
  try {
    const syncRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ats/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId, syncType: 'webhook' }),
    })
    const result = await syncRes.json()
    console.log(`[ats/webhook] Sync triggered: +${result.jobsCreated} created, ~${result.jobsUpdated} updated`)
  } catch (err) {
    console.error('[ats/webhook] Failed to trigger sync:', err.message)
  }
}

// ─── Signature verification ───────────────────────────────────────────────────

function verifySignature(rawBody, signature, secret, atsType) {
  try {
    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    // Some ATS systems prefix the signature with 'sha256='
    const clean = signature.replace(/^sha256=/, '')

    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(clean, 'hex')
    )
  } catch {
    return false
  }
}

// ─── Normalise event types across ATS systems ─────────────────────────────────

function normaliseEvent(payload, atsType) {
  switch (atsType) {
    case 'greenhouse':
      return {
        type: payload.action ?? 'unknown',
        jobId: payload.payload?.job?.id,
      }
    case 'lever':
      return {
        type: payload.event ?? 'unknown',
        jobId: payload.data?.posting?.id,
      }
    case 'ashby':
      return {
        type: payload.eventType ?? 'unknown',
        jobId: payload.data?.jobPosting?.id,
      }
    default:
      return { type: payload.event ?? payload.action ?? 'sync', jobId: null }
  }
}

// ─── Raw body reader ──────────────────────────────────────────────────────────

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}
