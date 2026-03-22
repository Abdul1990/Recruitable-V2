// Workday ATS Adapter
// Workday does not offer a public API — jobs are surfaced via their careers
// page. We use their internal /jobs REST endpoint that the careers site itself
// calls.
//
// Format: GET https://{tenant}.wd{n}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs
// The client provides their full Workday careers base URL.

const { parseJobDescription } = require('../parser')

/**
 * Fetch published jobs from a Workday careers site.
 * @param {string} careersUrl  — Base URL, e.g. 'https://acme.wd1.myworkdayjobs.com/en-US/Careers'
 * @param {string} companyName
 * @returns {Promise<Array>}
 */
async function fetchWorkdayJobs(careersUrl, companyName) {
  const apiUrl = resolveWorkdayApiUrl(careersUrl)

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      appliedFacets: {},
      limit: 100,
      offset: 0,
      searchText: '',
    }),
  })

  if (!res.ok) {
    throw new Error(`Workday API returned ${res.status}. Check the careers URL is correct.`)
  }

  const data = await res.json()
  const jobs = data.jobPostings ?? []
  if (jobs.length === 0) return []

  // Workday's listing endpoint doesn't include full descriptions.
  // We fetch each job detail individually, in batches of 3 to be respectful.
  return batchFetchAndParse(jobs, careersUrl, companyName, 3)
}

async function batchFetchAndParse(listings, baseUrl, companyName, batchSize) {
  const results = []
  for (let i = 0; i < listings.length; i += batchSize) {
    const batch = listings.slice(i, i + batchSize)
    const settled = await Promise.allSettled(
      batch.map((listing) => fetchAndParseDetail(listing, baseUrl, companyName))
    )
    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value) results.push(result.value)
      else console.warn('[workday] Parse error:', result.reason?.message)
    }
    // Brief pause between batches to avoid rate-limiting the careers page
    if (i + batchSize < listings.length) {
      await new Promise((r) => setTimeout(r, 800))
    }
  }
  return results
}

async function fetchAndParseDetail(listing, baseUrl, companyName) {
  const detailUrl = `${baseUrl}/${listing.externalPath}`

  // Some Workday setups expose a JSON detail endpoint
  const jsonDetailUrl = detailUrl.replace('/en-US/', '/wday/cxs/').replace(/\/$/, '') + '/jobPostingInfo'

  let rawText = ''
  try {
    const res = await fetch(jsonDetailUrl, { headers: { 'Accept': 'application/json' } })
    if (res.ok) {
      const detail = await res.json()
      rawText = stripHtml(detail.jobPostingInfo?.jobDescription ?? '')
    }
  } catch {
    // Fall back to the listing summary if detail fetch fails
  }

  if (!rawText) {
    rawText = [
      listing.title,
      listing.locationsText,
      listing.postedOnText,
    ].filter(Boolean).join('\n')
  }

  const parsed = await parseJobDescription(rawText, {
    companyHint: companyName,
    titleHint: listing.title ?? '',
  })

  return {
    ...parsed,
    title: listing.title ?? parsed.title,
    company: companyName,
    location: listing.locationsText?.split(',')?.[0]?.trim() ?? parsed.location,
    locationFull: listing.locationsText ?? parsed.locationFull,
    atsJobId: listing.bulletFields?.[0] ?? listing.externalPath,
    atsSource: 'workday',
    externalUrl: detailUrl,
    postedAt: new Date(),
    isActive: true,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveWorkdayApiUrl(careersUrl) {
  // Transform: https://acme.wd1.myworkdayjobs.com/en-US/Careers
  // Into:      https://acme.wd1.myworkdayjobs.com/wday/cxs/acme/Careers/jobs
  try {
    const url = new URL(careersUrl)
    const host = url.hostname // acme.wd1.myworkdayjobs.com
    const tenant = host.split('.')[0] // acme
    const pathParts = url.pathname.replace(/^\//, '').split('/').filter(Boolean)
    // Drop locale segment (en-US, etc.) if present
    const siteParts = pathParts.filter((p) => !/^[a-z]{2}(-[A-Z]{2})?$/.test(p))
    const site = siteParts.join('/') || 'Careers'
    return `${url.origin}/wday/cxs/${tenant}/${site}/jobs`
  } catch {
    throw new Error(`Invalid Workday careers URL: ${careersUrl}`)
  }
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

module.exports = { fetchWorkdayJobs }
