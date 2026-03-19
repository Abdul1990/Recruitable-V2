/**
 * API Route: /api/contact
 * Handles the homepage contact form submission.
 * Currently logs to console + returns success.
 * To wire up real email: add RESEND_API_KEY or SENDGRID_API_KEY to Vercel env vars
 * and uncomment the relevant section below.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, company, domain, message } = req.body

  if (!name || !company || !domain || !message) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  // Log submission (always works, visible in Vercel logs)
  console.log('=== NEW CONTACT ENQUIRY ===')
  console.log(`Name: ${name}`)
  console.log(`Company: ${company}`)
  console.log(`Domain: ${domain}`)
  console.log(`Message: ${message}`)
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('===========================')

  // ── OPTIONAL: Wire up Resend (recommended) ──────────────────────────────
  // 1. npm install resend
  // 2. Add RESEND_API_KEY to Vercel environment variables
  // 3. Uncomment below:
  //
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'website@recruitable.asia',
  //   to: 'info@recruitable.asia',
  //   subject: `New Enquiry from ${name} at ${company}`,
  //   html: `<p><b>Name:</b> ${name}</p><p><b>Company:</b> ${company}</p><p><b>Domain:</b> ${domain}</p><p><b>Message:</b> ${message}</p>`
  // })
  // ────────────────────────────────────────────────────────────────────────

  return res.status(200).json({ success: true })
}
