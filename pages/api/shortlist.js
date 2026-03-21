/**
 * API Route: /api/shortlist
 * Handles client portal shortlist request with server-side validation.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, company, email, phone, timeline } = req.body

  // Server-side validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide your full name' })
  }
  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide your company name' })
  }
  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Please provide a valid email address' })
  }
  if (!timeline) {
    return res.status(400).json({ error: 'Please select a hiring timeline' })
  }

  console.log('=== NEW SHORTLIST REQUEST ===')
  console.log(`Name: ${name.trim()}`)
  console.log(`Company: ${company.trim()}`)
  console.log(`Email: ${email.trim()}`)
  console.log(`Phone: ${phone || 'not provided'}`)
  console.log(`Timeline: ${timeline}`)
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('=============================')

  // ── OPTIONAL: Wire up Resend ──────────────────────────────────────────────
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'portal@recruitable.asia',
  //   to: 'info@recruitable.asia',
  //   replyTo: email,
  //   subject: `New Shortlist Request: ${name} at ${company} (${timeline})`,
  //   html: `
  //     <h2>New Shortlist Request via Client Portal</h2>
  //     <p><b>Name:</b> ${name}</p>
  //     <p><b>Company:</b> ${company}</p>
  //     <p><b>Email:</b> ${email}</p>
  //     <p><b>Phone:</b> ${phone || 'not provided'}</p>
  //     <p><b>Timeline:</b> ${timeline}</p>
  //   `,
  // })
  // ─────────────────────────────────────────────────────────────────────────

  return res.status(200).json({ success: true })
}
