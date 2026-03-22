// Zoom Meeting Creator
// Uses Zoom Server-to-Server OAuth (recommended over JWT which is deprecated).
// Docs: https://developers.zoom.us/docs/api/meetings/#tag/meetings/POST/users/{userId}/meetings
//
// Required env vars:
//   ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET

let _zoomToken = null
let _zoomTokenExpiry = 0

async function getZoomToken() {
  if (_zoomToken && Date.now() < _zoomTokenExpiry - 30_000) {
    return _zoomToken
  }

  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env
  if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
    throw new Error('Zoom credentials not configured (ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET)')
  }

  const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}` },
    }
  )

  if (!res.ok) {
    throw new Error(`Zoom token error: ${await res.text()}`)
  }

  const data = await res.json()
  _zoomToken = data.access_token
  _zoomTokenExpiry = Date.now() + data.expires_in * 1000
  return _zoomToken
}

/**
 * Create a Zoom meeting and return join/host URLs.
 * @param {object} opts
 * @param {string} opts.topic       — Meeting title
 * @param {Date}   opts.startTime   — Scheduled start
 * @param {number} opts.duration    — Duration in minutes
 * @param {string} opts.timezone    — IANA timezone, e.g. 'Asia/Kuala_Lumpur'
 * @param {string} opts.agenda      — Optional agenda text
 * @returns {Promise<{ meetingId, joinUrl, hostUrl, password }>}
 */
async function createZoomMeeting({ topic, startTime, duration, timezone = 'Asia/Kuala_Lumpur', agenda = '' }) {
  const token = await getZoomToken()

  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime.toISOString().replace('.000Z', 'Z'),
      duration,
      timezone,
      agenda: agenda.slice(0, 2000),
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        waiting_room: true,
        auto_recording: 'none',
        meeting_authentication: false,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Zoom meeting creation failed: ${err}`)
  }

  const meeting = await res.json()

  return {
    meetingId: String(meeting.id),
    joinUrl: meeting.join_url,
    hostUrl: meeting.start_url,
    password: meeting.password ?? '',
  }
}

/**
 * Delete a Zoom meeting (called when interview is cancelled).
 */
async function deleteZoomMeeting(meetingId) {
  const token = await getZoomToken()
  await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

module.exports = { createZoomMeeting, deleteZoomMeeting }
