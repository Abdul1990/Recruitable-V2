// POST /api/ats/connect
// Registers a new ATS connection for a client company.
// Validates that the connection is reachable before saving.
//
// Body:
//   companyName  string   — Display name for the company
//   atsType      string   — 'greenhouse' | 'lever' | 'workday' | 'bamboohr' |
//                           'smartrecruiters' | 'ashby' | 'jobvite' | 'generic'
//   identifier   string   — ATS-specific: board token, site slug, or full URL
//   apiKey       string?  — Optional API key (for private/authenticated ATS endpoints)
//   clientId     string   — Firebase UID of the client account making this request

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import crypto from 'crypto'

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

const VALID_ATS_TYPES = [
  'greenhouse', 'lever', 'workday', 'bamboohr',
  'smartrecruiters', 'ashby', 'jobvite', 'generic',
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { companyName, atsType, identifier, apiKey, clientId } = req.body

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
    return res.status(400).json({ error: 'companyName is required (min 2 characters)' })
  }
  if (!VALID_ATS_TYPES.includes(atsType)) {
    return res.status(400).json({ error: `atsType must be one of: ${VALID_ATS_TYPES.join(', ')}` })
  }
  if (!identifier || typeof identifier !== 'string' || identifier.trim().length < 2) {
    return res.status(400).json({ error: 'identifier is required' })
  }
  if (!clientId || typeof clientId !== 'string') {
    return res.status(400).json({ error: 'clientId is required' })
  }

  // ── Test connectivity before saving ────────────────────────────────────────
  const testResult = await testConnection(atsType, identifier.trim())
  if (!testResult.ok) {
    return res.status(422).json({
      error: `Could not reach your ${atsType} account: ${testResult.reason}`,
      hint: getConnectionHint(atsType),
    })
  }

  // ── Persist connection ─────────────────────────────────────────────────────
  const db = getAdminDb()

  // Check if this client already has a connection for this identifier
  const existing = await db.collection('ats_connections')
    .where('clientId', '==', clientId)
    .where('identifier', '==', identifier.trim())
    .limit(1)
    .get()

  if (!existing.empty) {
    return res.status(409).json({
      error: 'A connection for this identifier already exists.',
      connectionId: existing.docs[0].id,
    })
  }

  const connectionDoc = {
    clientId,
    companyName: companyName.trim(),
    atsType,
    identifier: identifier.trim(),
    // Encrypt API key at rest — never store plaintext secrets in Firestore.
    // In production, replace this with Google Cloud Secret Manager.
    apiKeyHash: apiKey ? crypto.createHash('sha256').update(apiKey).digest('hex') : null,
    webhookSecret: crypto.randomBytes(32).toString('hex'),
    status: 'active',
    lastSyncAt: null,
    jobCount: testResult.jobCount ?? 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }

  const ref = await db.collection('ats_connections').add(connectionDoc)

  console.log(`[ats/connect] New connection: ${atsType} for ${companyName} (${ref.id})`)

  return res.status(201).json({
    connectionId: ref.id,
    webhookSecret: connectionDoc.webhookSecret,
    jobCount: testResult.jobCount,
    message: `Connected to ${companyName}'s ${atsType} account. Found ${testResult.jobCount} active jobs.`,
    webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ats/webhook/${ref.id}`,
  })
}

// ─── Test connectivity ────────────────────────────────────────────────────────

async function testConnection(atsType, identifier) {
  try {
    let testUrl

    switch (atsType) {
      case 'greenhouse':
        testUrl = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(identifier)}/jobs`
        break
      case 'lever':
        testUrl = `https://api.lever.co/v0/postings/${encodeURIComponent(identifier)}?limit=1&state=published`
        break
      case 'ashby':
        testUrl = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(identifier)}`
        break
      case 'bamboohr': {
        const sub = identifier.replace(/\.bamboohr\.com.*/, '')
        testUrl = `https://${sub}.bamboohr.com/jobs/embed2/json/?version=1.0.0`
        break
      }
      case 'smartrecruiters':
        testUrl = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(identifier)}/postings?status=PUBLIC&limit=1`
        break
      case 'workday':
      case 'jobvite':
      case 'generic':
        // For these, just verify the URL is reachable
        testUrl = identifier.startsWith('http') ? identifier : `https://${identifier}`
        break
      default:
        return { ok: false, reason: 'Unknown ATS type' }
    }

    const res = await fetch(testUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000), // 8s timeout
    })

    if (!res.ok) {
      return { ok: false, reason: `${res.status} response from ${atsType}` }
    }

    // Try to count jobs from the response
    let jobCount = 0
    try {
      const data = await res.json()
      jobCount = data.jobs?.length
        ?? data.jobPostings?.length
        ?? (Array.isArray(data) ? data.length : 0)
        ?? data.content?.length
        ?? 0
    } catch { /* non-JSON response is fine for generic */ }

    return { ok: true, jobCount }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}

function getConnectionHint(atsType) {
  const hints = {
    greenhouse: 'Find your board token in Greenhouse: Settings → Job Board → Board Token',
    lever: 'Find your site identifier in Lever: Settings → Integrations → Postings API',
    ashby: 'Find your company ID in Ashby: Settings → Job Board → Job Board URL',
    bamboohr: 'Enter your BambooHR subdomain (the part before .bamboohr.com)',
    smartrecruiters: 'Enter your SmartRecruiters company ID from your careers page URL',
    workday: 'Enter your full Workday careers page URL',
    jobvite: 'Enter your Jobvite company key from your careers page URL',
    generic: 'Enter the full URL of your careers page',
  }
  return hints[atsType] ?? 'Check your ATS settings for the correct identifier'
}
