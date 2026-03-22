// POST /api/match-score
// Called by the Flutter app to score a candidate against a job.
// Claude API key stays server-side — never exposed to the client.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { candidate, job } = req.body

  if (!candidate || !job) {
    return res.status(400).json({ error: 'candidate and job are required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[match-score] ANTHROPIC_API_KEY not set')
    return res.status(500).json({ error: 'Scoring service unavailable' })
  }

  // Build a structured prompt — keep it tight to minimise token cost
  const prompt = buildPrompt(candidate, job)

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // Fast + cheap for real-time scoring
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[match-score] Claude API error:', err)
      return res.status(502).json({ error: 'Scoring service error' })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''

    // Parse JSON from Claude's response — it is instructed to reply with only JSON
    const parsed = parseClaudeResponse(text)
    if (!parsed) {
      console.error('[match-score] Failed to parse Claude response:', text)
      return res.status(200).json({ score: 50, reason: 'Match scored' }) // safe fallback
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('[match-score] Unexpected error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(candidate, job) {
  return `You are a technical recruiter scoring how well a candidate matches a job.

CANDIDATE:
- Specialism: ${candidate.specialism}
- Skills: ${(candidate.skills ?? []).join(', ')}
- Summary: ${candidate.summary || 'Not provided'}
- Location: ${candidate.location}

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Region: ${job.region}
- Type: ${job.type}
- Required stack: ${(job.stack ?? []).join(', ')}
- Description: ${job.description?.slice(0, 600) ?? ''}

Score the candidate's fit from 0 to 100, where:
  90–100 = exceptional fit (skills + experience align almost perfectly)
  75–89  = strong fit (most key requirements met)
  60–74  = good fit (solid overlap, some gaps)
  40–59  = partial fit (relevant background but missing key skills)
  0–39   = poor fit (significant mismatch)

IMPORTANT: Reply with ONLY valid JSON in this exact format, nothing else:
{"score": <number 0-100>, "reason": "<one sentence explaining the match score>"}`
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseClaudeResponse(text) {
  try {
    // Claude should return pure JSON, but strip any markdown fences just in case
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    if (typeof parsed.score !== 'number' || typeof parsed.reason !== 'string') {
      return null
    }

    // Clamp score to valid range
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      reason: parsed.reason.slice(0, 200), // guard against runaway text
    }
  } catch {
    return null
  }
}
