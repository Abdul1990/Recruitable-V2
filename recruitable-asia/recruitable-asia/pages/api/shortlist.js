/**
 * API Route: /api/shortlist
 * Handles client portal shortlist request submissions.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, company, email, phone, timeline } = req.body

  if (!name || !company || !email || !timeline) {
    return res.status(400).json({ error: 'Required fields missing' })
  }

  console.log('=== NEW SHORTLIST REQUEST ===')
  console.log(`Name: ${name}`)
  console.log(`Company: ${company}`)
  console.log(`Email: ${email}`)
  console.log(`Phone: ${phone || 'not provided'}`)
  console.log(`Timeline: ${timeline}`)
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('=============================')

  // ── OPTIONAL: Wire up Resend ─────────────────────────────────────────────
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'portal@recruitable.asia',
  //   to: 'info@recruitable.asia',
  //   subject: `New Shortlist Request from ${name} at ${company}`,
  //   html: `<p><b>Name:</b> ${name}</p><p><b>Company:</b> ${company}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone}</p><p><b>Timeline:</b> ${timeline}</p>`
  // })
  // ────────────────────────────────────────────────────────────────────────

  return res.status(200).json({ success: true })
}
