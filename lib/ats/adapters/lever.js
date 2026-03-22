// Lever ATS Adapter
// Docs: https://hire.lever.co/developer/postings
//
// Lever exposes a public postings API — no auth needed for published roles.
// The client provides their Lever "site" (subdomain / company identifier).
//
// Endpoint: GET https://api.lever.co/v0/postings/{site}?mode=json&state=published

const { parseJobDescription } = require('../parser')

const BASE_URL = 'https://api.lever.co/v0/postings'

/**
 * Fetch all published postings from a Lever site and return parsed job objects.
 * @param {string} site         — Lever site identifier (e.g. 'acmecorp')
 * @param {string} companyName  — Company name for display
 * @returns {Promise<Array>}
 */
async function fetchLeverJobs(site, companyName) {
  const url = `${BASE_URL}/${encodeURIComponent(site)}?mode=json&state=published`

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Lever site '${site}' not found. Check your Lever company identifier.`)
    }
    throw new Error(`Lever API returned ${res.status}: ${await res.text()}`)
  }

  const postings = await res.json()
  if (!Array.isArray(postings) || postings.length === 0) return []

  return batchParse(postings, (posting) => parseLeverJob(posting, companyName))
}

async function parseLeverJob(posting, companyName) {
  // Lever postings have a structured lists array with sections
  const rawText = buildLeverText(posting)

  const parsed = await parseJobDescription(rawText, {
    companyHint: companyName,
    titleHint: posting.text ?? '',
  })

  return {
    ...parsed,
    title: posting.text ?? parsed.title,
    company: companyName,
    location: posting.categories?.location ?? parsed.location,
    locationFull: posting.categories?.location ?? parsed.locationFull,
    atsJobId: posting.id,
    atsSource: 'lever',
    externalUrl: posting.hostedUrl ?? null,
    postedAt: posting.createdAt ? new Date(posting.createdAt) : new Date(),
    isActive: true,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildLeverText(posting) {
  const parts = []

  if (posting.text) parts.push(posting.text)
  if (posting.categories?.team) parts.push(`Team: ${posting.categories.team}`)
  if (posting.categories?.location) parts.push(`Location: ${posting.categories.location}`)
  if (posting.categories?.commitment) parts.push(`Type: ${posting.categories.commitment}`)

  // Lists is an array of sections: { text: 'About the Role', content: 'html...' }
  if (Array.isArray(posting.lists)) {
    for (const section of posting.lists) {
      if (section.text) parts.push(`\n${section.text}`)
      if (section.content) parts.push(stripHtml(section.content))
    }
  }

  if (posting.description) parts.push(stripHtml(posting.description))
  if (posting.additional) parts.push(stripHtml(posting.additional))

  return parts.join('\n\n')
}

async function batchParse(items, parseFn, batchSize = 5) {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const settled = await Promise.allSettled(batch.map(parseFn))
    for (const result of settled) {
      if (result.status === 'fulfilled') results.push(result.value)
      else console.warn('[lever] Parse error:', result.reason?.message)
    }
  }
  return results
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

module.exports = { fetchLeverJobs }
