// ATS Note Writer
// When an interview is booked or confirmed, we push a timestamped note back
// to the client's ATS so their recruiting team has a complete audit trail
// without leaving their ATS.
//
// Supported: Greenhouse, Lever. Others log to the recruitable sync log.

/**
 * Push an interview note to the client's ATS.
 * @param {object} connection — ATS connection document from Firestore
 * @param {object} interview  — Interview document from Firestore
 * @param {string} event      — 'booked' | 'accepted' | 'declined' | 'cancelled'
 */
async function pushInterviewNote(connection, interview, event) {
  if (!connection) return

  const noteText = buildNoteText(interview, event)

  try {
    switch (connection.atsType) {
      case 'greenhouse':
        await pushGreenhouseNote(connection, interview, noteText)
        break
      case 'lever':
        await pushLeverNote(connection, interview, noteText)
        break
      default:
        // For ATS types without a notes API, log to console.
        // In production this would write to ats_sync_logs.
        console.log(`[ats-notes] ${connection.atsType} note (no API): ${noteText}`)
    }
  } catch (err) {
    // ATS note failures are non-fatal — the interview still proceeds in-app
    console.error(`[ats-notes] Failed to push note to ${connection.atsType}:`, err.message)
  }
}

// ─── Greenhouse ───────────────────────────────────────────────────────────────
// Greenhouse notes are attached to a Job via the Harvest API.
// Requires GREENHOUSE_API_KEY (On-behalf-of user email also needed).
// Docs: https://developers.greenhouse.io/harvest.html#post-add-note

async function pushGreenhouseNote(connection, interview, noteText) {
  const apiKey = process.env.GREENHOUSE_HARVEST_API_KEY
  if (!apiKey) {
    console.warn('[ats-notes] GREENHOUSE_HARVEST_API_KEY not set — skipping note')
    return
  }

  // We use the job ID stored on the interview to find the application
  const credentials = Buffer.from(`${apiKey}:`).toString('base64')

  // First, find candidates who applied to this job
  const searchRes = await fetch(
    `https://harvest.greenhouse.io/v1/applications?job_id=${interview.atsJobId}&per_page=1`,
    { headers: { Authorization: `Basic ${credentials}` } }
  )

  if (!searchRes.ok) return

  const apps = await searchRes.json()
  if (!apps.length) return

  const applicationId = apps[0].id

  // Post the note to the first application found for this job
  await fetch(`https://harvest.greenhouse.io/v1/applications/${applicationId}/activity_feed/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'On-Behalf-Of': process.env.GREENHOUSE_ON_BEHALF_OF_EMAIL ?? '',
    },
    body: JSON.stringify({
      user_id: process.env.GREENHOUSE_BOT_USER_ID ?? '',
      message: noteText,
      visibility: 'admin_only',
    }),
  })
}

// ─── Lever ────────────────────────────────────────────────────────────────────
// Lever notes are posted to an opportunity.
// Docs: https://hire.lever.co/developer/postings (basic API — notes require private API key)

async function pushLeverNote(connection, interview, noteText) {
  const apiKey = process.env.LEVER_API_KEY
  if (!apiKey) {
    console.warn('[ats-notes] LEVER_API_KEY not set — skipping note')
    return
  }

  // The Lever opportunity ID would need to be stored when a candidate applies.
  // For now, log the note to a general endpoint if we have an opportunity ID.
  const opportunityId = interview.leverOpportunityId
  if (!opportunityId) return

  const credentials = Buffer.from(`${apiKey}:`).toString('base64')

  await fetch(`https://api.lever.co/v1/opportunities/${opportunityId}/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      value: noteText,
      secret: false,
    }),
  })
}

// ─── Note text builder ────────────────────────────────────────────────────────

function buildNoteText(interview, event) {
  const dateStr = new Date(interview.scheduledAt).toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kuala_Lumpur',
  })

  const platform = interview.platform === 'zoom' ? 'Zoom' : 'Google Meet'

  const messages = {
    booked: `📅 Interview scheduled via Recruitable Asia\n\nRole: ${interview.jobTitle}\nDate: ${dateStr} (KL time)\nDuration: ${interview.durationMinutes} minutes\nPlatform: ${platform}\nMeeting link: ${interview.meetingUrl}\n\nStatus: Awaiting candidate confirmation`,
    accepted: `✅ Candidate confirmed the interview\n\nRole: ${interview.jobTitle}\nDate: ${dateStr} (KL time)\nPlatform: ${platform}\nMeeting link: ${interview.meetingUrl}`,
    declined: `❌ Candidate declined the interview request\n\nRole: ${interview.jobTitle}\nScheduled for: ${dateStr}`,
    cancelled: `🚫 Interview cancelled\n\nRole: ${interview.jobTitle}\nWas scheduled for: ${dateStr}`,
  }

  return messages[event] ?? `Interview update (${event}) — ${interview.jobTitle} — ${dateStr}`
}

module.exports = { pushInterviewNote }
