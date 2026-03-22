// POST /api/auth/linkedin
// Exchanges a LinkedIn OAuth2 authorization code for:
//   1. LinkedIn access token
//   2. User profile (name, photo, positions)
//   3. Firebase custom auth token
//
// Required env vars:
//   LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET,
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]{2,}/g
const PHONE_RE = /(\+?[\d][\d\s\-().]{6,}[\d])/g

function stripPii(text = '') {
  return text.replace(EMAIL_RE, '').replace(PHONE_RE, '').trim()
}

function getAdminApp() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return { auth: getAuth(), db: getFirestore() }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code is required' })
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'LinkedIn credentials not configured' })
  }

  try {
    // ── Step 1: Exchange code for access token ──────────────────────────────
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('[linkedin auth] Token exchange failed:', err)
      return res.status(401).json({ error: 'LinkedIn auth failed' })
    }

    const { access_token: accessToken } = await tokenRes.json()

    // ── Step 2: Fetch OpenID Connect user info ──────────────────────────────
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!profileRes.ok) {
      return res.status(502).json({ error: 'Failed to fetch LinkedIn profile' })
    }

    const linkedInUser = await profileRes.json()

    // ── Step 3: Fetch positions (requires r_liteprofile scope) ─────────────
    const positionsRes = await fetch(
      'https://api.linkedin.com/v2/positions?projection=(elements*(title,companyName,timePeriod,description))',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    let positions = []
    if (positionsRes.ok) {
      const posData = await positionsRes.json()
      positions = (posData.elements ?? []).slice(0, 5).map((el) => ({
        title: stripPii(el.title ?? ''),
        company: stripPii(el.companyName ?? ''),
        startDate: el.timePeriod?.startDate
          ? `${el.timePeriod.startDate.year}`
          : undefined,
        endDate: el.timePeriod?.endDate
          ? `${el.timePeriod.endDate.year}`
          : undefined,
        // Strip PII from role descriptions before storing
        description: el.description ? stripPii(el.description).slice(0, 300) : undefined,
      }))
    }

    // ── Step 4: Create or update Firestore user with positions ─────────────
    const { auth, db } = getAdminApp()
    const linkedInUid = `linkedin:${linkedInUser.sub}`

    // Upsert LinkedIn positions for use by summarise-profile
    await db.collection('users').doc(linkedInUid).set(
      { linkedInPositions: positions },
      { merge: true }
    )

    // ── Step 5: Mint a Firebase custom token ───────────────────────────────
    const firebaseToken = await auth.createCustomToken(linkedInUid, {
      provider: 'linkedin',
    })

    // Build clean profile DTO — no email, no phone
    const profile = {
      sub: linkedInUser.sub,
      name: stripPii(`${linkedInUser.given_name ?? ''} ${linkedInUser.family_name ?? ''}`).trim(),
      given_name: stripPii(linkedInUser.given_name ?? ''),
      family_name: stripPii(linkedInUser.family_name ?? ''),
      picture: linkedInUser.picture ?? null,    // Profile photo URL is safe
      headline: linkedInUser.headline ? stripPii(linkedInUser.headline) : null,
      positions,
    }

    return res.status(200).json({ firebaseToken, accessToken, profile })
  } catch (err) {
    console.error('[linkedin auth] Unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
