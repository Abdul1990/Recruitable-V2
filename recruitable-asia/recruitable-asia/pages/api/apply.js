/**
 * API Route: /api/apply
 * Handles job application form submissions.
 * File uploads (CV) are base64 encoded from the client.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, note, jobTitle, jobCompany, fileName } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  console.log('=== NEW JOB APPLICATION ===')
  console.log(`Applicant: ${name} <${email}>`)
  console.log(`Role: ${jobTitle} at ${jobCompany}`)
  console.log(`CV File: ${fileName || 'none'}`)
  console.log(`Note: ${note || 'none'}`)
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('===========================')

  // ── OPTIONAL: Wire up Resend ─────────────────────────────────────────────
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'applications@recruitable.asia',
  //   to: 'info@recruitable.asia',
  //   subject: `New Application: ${name} for ${jobTitle}`,
  //   html: `<p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Role:</b> ${jobTitle} at ${jobCompany}</p><p><b>CV:</b> ${fileName}</p><p><b>Note:</b> ${note}</p>`
  // })
  // ────────────────────────────────────────────────────────────────────────

  return res.status(200).json({ success: true })
}
