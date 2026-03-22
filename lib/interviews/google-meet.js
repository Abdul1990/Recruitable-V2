// Google Meet Creator
// Uses the Google Calendar API to create an event with a Meet conference link.
// A Calendar event with conferenceData is the only public way to generate a
// Google Meet link programmatically.
//
// Docs: https://developers.google.com/calendar/api/v3/reference/events/insert
//
// Required env vars:
//   GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID
//
// Setup: Create a Google Cloud service account, enable the Calendar API,
// share your calendar with the service account email (Make changes to events).

const { JWT } = require('google-auth-library')
const { google } = require('googleapis')

function getCalendarClient() {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID } = process.env
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google credentials not configured (GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY)')
  }

  const auth = new JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  return {
    calendar: google.calendar({ version: 'v3', auth }),
    calendarId: GOOGLE_CALENDAR_ID || 'primary',
  }
}

/**
 * Create a Google Calendar event with a Meet link.
 * @param {object} opts
 * @param {string} opts.title           — Event title
 * @param {Date}   opts.startTime       — Start datetime
 * @param {number} opts.durationMinutes
 * @param {string} opts.description     — Event description / agenda
 * @param {string} opts.attendeeEmail   — Candidate email (optional — added as attendee)
 * @param {string} opts.timezone        — IANA timezone
 * @returns {Promise<{ eventId, meetUrl, htmlLink }>}
 */
async function createGoogleMeet({
  title,
  startTime,
  durationMinutes,
  description = '',
  attendeeEmail = null,
  timezone = 'Asia/Kuala_Lumpur',
}) {
  const { calendar, calendarId } = getCalendarClient()

  const endTime = new Date(startTime.getTime() + durationMinutes * 60_000)

  const event = {
    summary: title,
    description: description.slice(0, 8000),
    start: { dateTime: startTime.toISOString(), timeZone: timezone },
    end: { dateTime: endTime.toISOString(), timeZone: timezone },
    conferenceData: {
      createRequest: {
        requestId: `recruitable-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 10 },
      ],
    },
    ...(attendeeEmail ? { attendees: [{ email: attendeeEmail }] } : {}),
  }

  const res = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: 1,
    sendUpdates: attendeeEmail ? 'all' : 'none',
    requestBody: event,
  })

  const created = res.data
  const meetEntry = created.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')

  if (!meetEntry?.uri) {
    throw new Error('Google Calendar event created but no Meet link was returned')
  }

  return {
    eventId: created.id,
    meetUrl: meetEntry.uri,
    htmlLink: created.htmlLink, // Link to the calendar event itself
  }
}

/**
 * Delete a Google Calendar event (called when interview is cancelled).
 */
async function deleteGoogleMeetEvent(eventId) {
  const { calendar, calendarId } = getCalendarClient()
  await calendar.events.delete({ calendarId, eventId, sendUpdates: 'all' })
}

module.exports = { createGoogleMeet, deleteGoogleMeetEvent }
