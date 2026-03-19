/**
 * API Route: /api/contact
 * Handles the homepage contact form submission.
 * Requires RESEND_API_KEY in environment variables to send real emails.
 */
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, company, domain, message } = req.body

  if (!name || !company || !domain || !message) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  console.log('=== NEW CONTACT ENQUIRY ===')
  console.log(`Name: ${name} | Company: ${company} | Domain: ${domain}`)
  console.log(`Time: ${new Date().toISOString()}`)

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'website@recruitable.asia',
        to: 'info@recruitable.asia',
        replyTo: `${name} <noreply@recruitable.asia>`,
        subject: `New Enquiry — ${domain} | ${name} at ${company}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4f6fb;border-radius:12px;">
            <div style="background:#2D2D3A;padding:20px 28px;border-radius:8px 8px 0 0;">
              <p style="color:#29B6D8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin:0 0 4px;">New Enquiry — recruitable.asia</p>
              <h2 style="color:white;margin:0;font-size:22px;">${name} at ${company}</h2>
            </div>
            <div style="background:white;padding:28px;border-radius:0 0 8px 8px;border:1px solid #e8ecf4;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;width:130px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#2D2D3A;font-weight:600;">${name}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">Company</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#2D2D3A;font-weight:600;">${company}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">Domain</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;"><span style="background:#E8235A18;color:#E8235A;font-size:12px;font-weight:700;padding:4px 10px;border-radius:8px;">${domain}</span></td></tr>
                <tr><td style="padding:10px 0;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;vertical-align:top;padding-top:14px;">Message</td><td style="padding:10px 0;color:#2D2D3A;line-height:1.6;padding-top:14px;">${message.replace(/\n/g, '<br/>')}</td></tr>
              </table>
              <div style="margin-top:24px;padding:16px;background:#f4f6fb;border-radius:8px;font-size:12px;color:#8A8A9E;">
                Submitted ${new Date().toUTCString()} via recruitable.asia contact form
              </div>
            </div>
          </div>
        `,
      })
    } catch (err) {
      console.error('Resend error (contact):', err)
      return res.status(500).json({ error: 'Failed to send email' })
    }
  } else {
    console.warn('RESEND_API_KEY not set — email not sent. Add it to your environment variables.')
  }

  return res.status(200).json({ success: true })
}
