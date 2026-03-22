// Generic ATS / Careers Page Adapter
// For ATS systems without dedicated adapters (BambooHR, SmartRecruiters, Ashby,
// Jobvite, custom career pages, etc.).
//
// Strategy:
//   1. Try each ATS's known JSON endpoint pattern
//   2. If none match, use Claude to scrape job listings from the careers page HTML
//   3. Parse each found job description through the standard parser

const { parseJobDescription } = require('../parser')

// Known JSON endpoint patterns for common ATS systems
const ATS_PATTERNS = [
  {
    name: 'ashby',
    test: (url) => url.includes('ashbyhq.com') || url.includes('jobs.ashbyhq'),
    fetchJobs: fetchAshbyJobs,
  },
  {
    name: 'bamboohr',
    test: (url) => url.includes('bamboohr.com'),
    fetchJobs: fetchBambooHrJobs,
  },
  {
    name: 'smartrecruiters',
    test: (url) => url.includes('smartrecruiters.com'),
    fetchJobs: fetchSmartRecruitersJobs,
  },
  {
    name: 'jobvite',
    test: (url) => url.includes('jobvite.com'),
    fetchJobs: fetchJobviteJobs,
  },
]

/**
 * Fetch jobs from any careers URL using pattern matching + fallback HTML scraping.
 * @param {string} careersUrl   — The company's careers page URL
 * @param {string} companyName
 * @returns {Promise<Array>}
 */
async function fetchGenericJobs(careersUrl, companyName) {
  // Try known ATS patterns first
  const pattern = ATS_PATTERNS.find((p) => p.test(careersUrl))
  if (pattern) {
    console.log(`[generic] Detected ${pattern.name} — using structured adapter`)
    return pattern.fetchJobs(careersUrl, companyName)
  }

  // Fall back to HTML scraping + Claude extraction
  console.log(`[generic] No pattern match for ${careersUrl} — using HTML scraper`)
  return fetchByHtmlScraping(careersUrl, companyName)
}

// ─── Ashby ────────────────────────────────────────────────────────────────────

async function fetchAshbyJobs(url, companyName) {
  // Ashby: https://api.ashbyhq.com/posting-api/job-board/{id}
  const companyId = url.match(/ashbyhq\.com\/([^/?]+)/)?.[1] ?? ''
  if (!companyId) throw new Error('Could not extract Ashby company ID from URL')

  const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${companyId}`, {
    headers: { 'Accept': 'application/json' },
  })
  if (!res.ok) throw new Error(`Ashby API returned ${res.status}`)

  const data = await res.json()
  const jobs = data.jobPostings ?? []

  return batchParse(jobs, async (job) => {
    const text = [job.title, job.locationName, stripHtml(job.descriptionHtml ?? '')].join('\n\n')
    const parsed = await parseJobDescription(text, { companyHint: companyName, titleHint: job.title })
    return {
      ...parsed,
      title: job.title ?? parsed.title,
      company: companyName,
      location: job.locationName ?? parsed.location,
      atsJobId: job.id,
      atsSource: 'ashby',
      externalUrl: job.applyUrl ?? null,
      postedAt: job.publishedDate ? new Date(job.publishedDate) : new Date(),
      isActive: !job.isListed === false,
    }
  })
}

// ─── BambooHR ─────────────────────────────────────────────────────────────────

async function fetchBambooHrJobs(url, companyName) {
  // BambooHR: https://{company}.bamboohr.com/jobs/
  // JSON API: https://{company}.bamboohr.com/jobs/embed2/json/?version=1.0.0
  const match = url.match(/https?:\/\/([^.]+)\.bamboohr\.com/)
  const subdomain = match?.[1]
  if (!subdomain) throw new Error('Could not extract BambooHR subdomain')

  const res = await fetch(
    `https://${subdomain}.bamboohr.com/jobs/embed2/json/?version=1.0.0`,
    { headers: { 'Accept': 'application/json' } }
  )
  if (!res.ok) throw new Error(`BambooHR API returned ${res.status}`)

  const data = await res.json()
  const departments = data.result ?? []
  const jobs = departments.flatMap((dept) => dept.jobOpenings ?? [])

  return batchParse(jobs, async (job) => {
    const text = [job.jobOpeningName, job.location, stripHtml(job.description ?? '')].join('\n\n')
    const parsed = await parseJobDescription(text, { companyHint: companyName, titleHint: job.jobOpeningName })
    return {
      ...parsed,
      title: job.jobOpeningName ?? parsed.title,
      company: companyName,
      location: job.location ?? parsed.location,
      atsJobId: String(job.id),
      atsSource: 'bamboohr',
      externalUrl: `https://${subdomain}.bamboohr.com/jobs/view.php?id=${job.id}`,
      postedAt: new Date(),
      isActive: true,
    }
  })
}

// ─── SmartRecruiters ──────────────────────────────────────────────────────────

async function fetchSmartRecruitersJobs(url, companyName) {
  const companyId = url.match(/smartrecruiters\.com\/([^/?]+)/)?.[1] ?? ''
  if (!companyId) throw new Error('Could not extract SmartRecruiters company ID')

  const res = await fetch(
    `https://api.smartrecruiters.com/v1/companies/${companyId}/postings?status=PUBLIC&limit=100`,
    { headers: { 'Accept': 'application/json' } }
  )
  if (!res.ok) throw new Error(`SmartRecruiters API returned ${res.status}`)

  const data = await res.json()
  const jobs = data.content ?? []

  return batchParse(jobs, async (job) => {
    const location = [job.location?.city, job.location?.country].filter(Boolean).join(', ')
    const text = [job.name, location, stripHtml(job.jobAd?.sections?.companyDescription?.text ?? ''), stripHtml(job.jobAd?.sections?.jobDescription?.text ?? '')].join('\n\n')
    const parsed = await parseJobDescription(text, { companyHint: companyName, titleHint: job.name })
    return {
      ...parsed,
      title: job.name ?? parsed.title,
      company: companyName,
      location: job.location?.city ?? parsed.location,
      locationFull: location || parsed.locationFull,
      atsJobId: job.id,
      atsSource: 'smartrecruiters',
      externalUrl: `https://jobs.smartrecruiters.com/${companyId}/${job.id}`,
      postedAt: job.releasedDate ? new Date(job.releasedDate) : new Date(),
      isActive: true,
    }
  })
}

// ─── Jobvite ──────────────────────────────────────────────────────────────────

async function fetchJobviteJobs(url, companyName) {
  // Jobvite's public feed endpoint
  const companyKey = url.match(/jobvite\.com\/([^/?]+)/)?.[1] ?? ''
  if (!companyKey) throw new Error('Could not extract Jobvite company key')

  const res = await fetch(
    `https://jobs.jobvite.com/api/jobs?c=${companyKey}&d=json`,
    { headers: { 'Accept': 'application/json' } }
  )
  if (!res.ok) throw new Error(`Jobvite API returned ${res.status}`)

  const data = await res.json()
  const jobs = data.jobs ?? []

  return batchParse(jobs, async (job) => {
    const text = [job.title, job.location, stripHtml(job.description ?? '')].join('\n\n')
    const parsed = await parseJobDescription(text, { companyHint: companyName, titleHint: job.title })
    return {
      ...parsed,
      title: job.title ?? parsed.title,
      company: companyName,
      location: job.location ?? parsed.location,
      atsJobId: job.reqId ?? job.id,
      atsSource: 'jobvite',
      externalUrl: job.applyUrl ?? null,
      postedAt: job.date ? new Date(job.date) : new Date(),
      isActive: true,
    }
  })
}

// ─── HTML fallback scraper ────────────────────────────────────────────────────
// For fully custom careers pages with no known JSON API.
// Fetches HTML and asks Claude to identify and extract job listings.

async function fetchByHtmlScraping(url, companyName) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RecruitableBot/1.0; +https://recruitable.asia)',
      'Accept': 'text/html',
    },
  })

  if (!res.ok) throw new Error(`Failed to fetch careers page: ${res.status}`)

  const html = await res.text()
  const text = stripHtml(html).slice(0, 6000) // Truncate for Claude token budget

  // Ask Claude to extract job listings from the page text
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Extract job listings from this careers page text.
Company: ${companyName}
Page URL: ${url}

PAGE TEXT:
${text}

Reply with ONLY a JSON array of job objects. Each object must have:
{ "title": string, "location": string, "description": string (max 400 chars) }

If no jobs are found, reply with an empty array [].`,
      }],
    }),
  })

  if (!response.ok) return []

  const data = await response.json()
  const raw = data.content?.[0]?.text ?? ''
  let listings = []
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    listings = JSON.parse(cleaned)
  } catch { return [] }

  if (!Array.isArray(listings)) return []

  return batchParse(listings, async (listing) => {
    const parsed = await parseJobDescription(
      [listing.title, listing.location, listing.description].join('\n'),
      { companyHint: companyName, titleHint: listing.title }
    )
    return {
      ...parsed,
      title: listing.title ?? parsed.title,
      company: companyName,
      location: listing.location ?? parsed.location,
      atsJobId: `scraped_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      atsSource: 'generic',
      externalUrl: url,
      postedAt: new Date(),
      isActive: true,
    }
  })
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function batchParse(items, parseFn, batchSize = 5) {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const settled = await Promise.allSettled(batch.map(parseFn))
    for (const result of settled) {
      if (result.status === 'fulfilled') results.push(result.value)
      else console.warn('[generic] Parse error:', result.reason?.message)
    }
  }
  return results
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
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

module.exports = { fetchGenericJobs }
