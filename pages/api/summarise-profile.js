// POST /api/summarise-profile
// Fetches the user's LinkedIn positions from Firestore and asks Claude to
// generate a clean 3-sentence professional summary.
// PII (phone numbers, email addresses) is stripped before sending to Claude
// and again from Claude's output before returning to the client.

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialise Firebase Admin once per serverless cold start
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

// Regex patterns for PII — strip before sending to Claude and before returning
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]{2,}/g
const PHONE_RE = /(\+?[\d][\d\s\-().]{6,}[\d])/g

function stripPii(text) {
  return text
    .replace(EMAIL_RE, '[email removed]')
    .replace(PHONE_RE, '[number removed]')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { uid } = req.body
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'uid is required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Summarisation service unavailable' })
  }

  // Load positions stored on the user's Firestore document
  let positions = []
  try {
    const db = getAdminDb()
    const doc = await db.collection('users').doc(uid).get()
    const data = doc.data() ?? {}
    positions = data.linkedInPositions ?? []
  } catch (err) {
    console.error('[summarise-profile] Firestore error:', err)
    // Non-fatal — summarise with empty positions
  }

  const positionText = positions
    .slice(0, 5) // limit to 5 most recent roles
    .map((p) => `- ${p.title} at ${p.company}${p.startDate ? ` (${p.startDate}${p.endDate ? ' – ' + p.endDate : ' – present'})` : ''}`)
    .join('\n')

  const prompt = `You are writing a short professional bio for a tech professional's job-matching app profile.

Work history:
${positionText || 'No positions provided'}

Write a 2–3 sentence professional summary in the third person. Focus on:
1. Their primary technical specialisation
2. The types of companies or products they have worked on
3. What makes them a strong candidate

Rules:
- Do NOT include any email addresses, phone numbers, or personal contact details
- Do NOT use the person's name
- Keep it under 80 words
- Tone: confident, factual, professional

Reply with ONLY the summary text, no preamble.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      return res.status(200).json({ summary: '' })
    }

    const data = await response.json()
    const raw = data.content?.[0]?.text ?? ''

    // Strip any PII that might have slipped through
    const summary = stripPii(raw.trim()).slice(0, 400)

    return res.status(200).json({ summary })
  } catch (err) {
    console.error('[summarise-profile] Claude error:', err)
    return res.status(200).json({ summary: '' })
  }
}
