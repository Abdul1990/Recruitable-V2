// ATS Job Description Parser
// Uses Claude to extract structured fields from any raw job description text.
// Called by every ATS adapter before writing to Firestore.
//
// Output schema:
//   title, company, location, locationFull, region, salary, salaryNote,
//   salaryMin, salaryMax, salaryCurrency, stack, type, seniority, description

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

// APAC city → region code mapping used to guide Claude's region classification
const APAC_LOCATION_MAP = {
  // Malaysia
  'kuala lumpur': 'MY', 'kl': 'MY', 'petaling jaya': 'MY', 'cyberjaya': 'MY',
  'penang': 'MY', 'johor bahru': 'MY', 'malaysia': 'MY',
  // Singapore
  'singapore': 'SG',
  // Australia
  'sydney': 'AU', 'melbourne': 'AU', 'brisbane': 'AU', 'perth': 'AU',
  'adelaide': 'AU', 'australia': 'AU',
  // Vietnam
  'ho chi minh': 'VN', 'hcmc': 'VN', 'hanoi': 'VN', 'vietnam': 'VN',
  // Indonesia
  'jakarta': 'ID', 'bali': 'ID', 'bandung': 'ID', 'indonesia': 'ID',
  // Thailand
  'bangkok': 'TH', 'thailand': 'TH', 'chiang mai': 'TH',
  // Global hubs (non-APAC still accepted)
  'san francisco': 'US', 'new york': 'US', 'austin': 'US', 'seattle': 'US',
  'london': 'London', 'berlin': 'EU', 'amsterdam': 'EU',
}

/**
 * Parse a raw job description (text or HTML-stripped) into a structured job object.
 * @param {string} rawText  — full job description text
 * @param {string} [companyHint]  — company name if already known (e.g. from ATS API)
 * @param {string} [titleHint]    — job title if already known
 * @returns {Promise<ParsedJob>}
 */
async function parseJobDescription(rawText, { companyHint = '', titleHint = '' } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const prompt = buildParserPrompt(rawText, { companyHint, titleHint })

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001', // Fast + cheap — runs on every job import
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error: ${err}`)
  }

  const data = await response.json()
  const raw = data.content?.[0]?.text ?? ''
  const parsed = extractJson(raw)

  if (!parsed) throw new Error(`Failed to parse Claude response: ${raw}`)

  return normalise(parsed)
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildParserPrompt(text, { companyHint, titleHint }) {
  return `You are a structured data extractor for a tech recruitment platform focused on APAC.
Extract the following fields from the job description below.

${companyHint ? `Known company name: ${companyHint}` : ''}
${titleHint ? `Known job title: ${titleHint}` : ''}

JOB DESCRIPTION:
---
${text.slice(0, 4000)}
---

Extract these fields and reply with ONLY valid JSON, nothing else:

{
  "title": "<job title — clean, no company name>",
  "company": "<company name>",
  "location": "<city only, e.g. 'Kuala Lumpur', 'Singapore', 'Remote'>",
  "locationFull": "<full location string, e.g. 'Kuala Lumpur, Malaysia'>",
  "region": "<one of: MY, SG, AU, VN, ID, TH, US, London, EU, Remote>",
  "salary": "<salary range string, e.g. 'MYR 8,000–15,000/mo' or 'Not specified'>",
  "salaryNote": "<currency and period note, e.g. 'MYR / month' or ''>",
  "salaryMin": <number or null — minimum salary value, no currency symbol>,
  "salaryMax": <number or null — maximum salary value, no currency symbol>,
  "salaryCurrency": "<ISO 4217 currency code: MYR, SGD, AUD, USD, GBP, or null>",
  "stack": ["<technology 1>", "<technology 2>", "..."],
  "type": "<one of: AI / ML, Engineering, Data, Product, Design, Management>",
  "seniority": "<one of: Internship, Junior, Mid, Senior, Lead, Principal, Director, C-Level>",
  "description": "<clean job description, max 600 chars, no PII, no salary details>"
}

Rules:
- region: use the city to infer the region code. If remote, use 'Remote'. If unclear, use the closest match.
- stack: list only specific technologies, frameworks, languages, tools. Max 10. No vague terms like 'experience'.
- seniority: infer from title and description. 'Senior Engineer' = Senior. 'Staff Engineer' = Lead.
- description: strip salary, contact details, equal opportunity boilerplate. Keep the role summary only.
- salary: if not mentioned, use "Not specified" for salary and null for min/max.`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractJson(text) {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    // Try to find a JSON object anywhere in the response
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try { return JSON.parse(match[0]) } catch { return null }
    }
    return null
  }
}

function normalise(parsed) {
  // Validate and clean up the parsed output
  const validRegions = ['MY', 'SG', 'AU', 'VN', 'ID', 'TH', 'US', 'London', 'EU', 'Remote']
  const validTypes = ['AI / ML', 'Engineering', 'Data', 'Product', 'Design', 'Management']
  const validSeniority = ['Internship', 'Junior', 'Mid', 'Senior', 'Lead', 'Principal', 'Director', 'C-Level']

  // Try to infer region from location if Claude got it wrong
  let region = parsed.region
  if (!validRegions.includes(region)) {
    const locationLower = (parsed.location ?? '').toLowerCase()
    region = Object.entries(APAC_LOCATION_MAP).find(([key]) => locationLower.includes(key))?.[1] ?? 'Remote'
  }

  return {
    title: String(parsed.title ?? '').slice(0, 120),
    company: String(parsed.company ?? '').slice(0, 100),
    location: String(parsed.location ?? '').slice(0, 80),
    locationFull: String(parsed.locationFull ?? '').slice(0, 120),
    region,
    salary: String(parsed.salary ?? 'Not specified').slice(0, 80),
    salaryNote: String(parsed.salaryNote ?? '').slice(0, 60),
    salaryMin: typeof parsed.salaryMin === 'number' ? parsed.salaryMin : null,
    salaryMax: typeof parsed.salaryMax === 'number' ? parsed.salaryMax : null,
    salaryCurrency: parsed.salaryCurrency ?? null,
    stack: Array.isArray(parsed.stack)
      ? parsed.stack.slice(0, 10).map((s) => String(s).slice(0, 40))
      : [],
    type: validTypes.includes(parsed.type) ? parsed.type : 'Engineering',
    seniority: validSeniority.includes(parsed.seniority) ? parsed.seniority : 'Mid',
    description: String(parsed.description ?? '').slice(0, 600),
    // Colour assigned based on type — mirrors the website's domain colours
    color: TYPE_COLORS[parsed.type] ?? '#E91E63',
  }
}

const TYPE_COLORS = {
  'AI / ML': '#E91E63',
  'Engineering': '#03A9F4',
  'Data': '#3F51B5',
  'Product': '#FF9400',
  'Design': '#00BCD4',
  'Management': '#FFC107',
}

module.exports = { parseJobDescription }
