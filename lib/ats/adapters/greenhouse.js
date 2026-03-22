// Greenhouse ATS Adapter
// Docs: https://developers.greenhouse.io/job-board.html
//
// Greenhouse exposes a public Job Board API — no secret key needed to read
// published jobs. The client provides their "board token" (found in their
// Greenhouse settings) when connecting.
//
// Endpoint: GET https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true

const { parseJobDescription } = require('../parser')

const BASE_URL = 'https://boards-api.greenhouse.io/v1/boards'

/**
 * Fetch all published jobs from a Greenhouse board and return parsed job objects.
 * @param {string} boardToken   — Greenhouse board token (e.g. 'acmecorp')
 * @param {string} companyName  — Company name for display
 * @returns {Promise<Array>}
 */
async function fetchGreenhouseJobs(boardToken, companyName) {
  const url = `${BASE_URL}/${encodeURIComponent(boardToken)}/jobs?content=true`

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Greenhouse board token '${boardToken}' not found. Check your board token in Greenhouse settings.`)
    }
    throw new Error(`Greenhouse API returned ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  const jobs = data.jobs ?? []

  if (jobs.length === 0) return []

  // Parse each job concurrently in batches of 5
  return batchParse(jobs, (job) => parseGreenhouseJob(job, companyName))
}

async function parseGreenhouseJob(job, companyName) {
  // Strip HTML from Greenhouse's content field
  const rawText = stripHtml(job.content ?? '')
  const titleHint = job.title ?? ''

  const parsed = await parseJobDescription(rawText, {
    companyHint: companyName,
    titleHint,
  })

  return {
    ...parsed,
    // Greenhouse-specific overrides — prefer the structured API data over Claude's extraction
    title: job.title ?? parsed.title,
    company: companyName,
    locationFull: job.location?.name ?? parsed.locationFull,
    location: job.location?.name?.split(',')[0]?.trim() ?? parsed.location,
    atsJobId: String(job.id),
    atsSource: 'greenhouse',
    externalUrl: job.absolute_url ?? null,
    postedAt: job.updated_at ? new Date(job.updated_at) : new Date(),
    isActive: true,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function batchParse(items, parseFn, batchSize = 5) {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const parsed = await Promise.allSettled(batch.map(parseFn))
    for (const result of parsed) {
      if (result.status === 'fulfilled') results.push(result.value)
      else console.warn('[greenhouse] Parse error:', result.reason?.message)
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
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

module.exports = { fetchGreenhouseJobs }
