/**
 * API Route: /api/contact
 * Handles homepage contact form with server-side validation.
 * Wire up Resend to actually send emails (see below).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, company, domain, message } = req.body

  // Server-side validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide your full name' })
  }
  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide your company name' })
  }
  if (!domain) {
    return res.status(400).json({ error: 'Please select a specialisation' })
  }
  if (!message || typeof message !== 'string' || message.trim().length < 20) {
    return res.status(400).json({ error: 'Please provide more detail about the role (min 20 characters)' })
  }

  console.log('=== NEW CONTACT ENQUIRY ===')
  console.log(`Name: ${name.trim()}`)
  console.log(`Company: ${company.trim()}`)
  console.log(`Domain: ${domain}`)
  console.log(`Message: ${message.trim()}`)
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('===========================')

  // ── OPTIONAL: Wire up Resend ──────────────────────────────────────────────
  // 1. npm install resend
  // 2. Add RESEND_API_KEY to Vercel environment variables
  // 3. Uncomment below:
  //
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'website@recruitable.asia',
  //   to: 'info@recruitable.asia',
  //   replyTo: email,
  //   subject: `New Enquiry: ${domain} from ${name} at ${company}`,
  //   html: `
  //     <h2>New Contact Enquiry</h2>
  //     <p><b>Name:</b> ${name}</p>
  //     <p><b>Company:</b> ${company}</p>
  //     <p><b>Domain:</b> ${domain}</p>
  //     <p><b>Message:</b></p><p>${message}</p>
  //   `,
  // })
  // ─────────────────────────────────────────────────────────────────────────

  return res.status(200).json({ success: true })
}
