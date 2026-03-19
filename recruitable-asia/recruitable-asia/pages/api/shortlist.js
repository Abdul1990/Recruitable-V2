/**
 * API Route: /api/shortlist
 * Handles client portal shortlist request submissions.
 * Requires RESEND_API_KEY in environment variables to send real emails.
 */
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, company, email, phone, timeline } = req.body

  if (!name || !company || !email || !timeline) {
    return res.status(400).json({ error: 'Required fields missing' })
  }

  console.log('=== NEW SHORTLIST REQUEST ===')
  console.log(`Name: ${name} | Company: ${company} | Timeline: ${timeline}`)
  console.log(`Time: ${new Date().toISOString()}`)

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)

      // Notify internal team
      await resend.emails.send({
        from: 'portal@recruitable.asia',
        to: 'info@recruitable.asia',
        replyTo: `${name} <${email}>`,
        subject: `New Shortlist Request — ${company} | ${timeline}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4f6fb;border-radius:12px;">
            <div style="background:#2D2D3A;padding:20px 28px;border-radius:8px 8px 0 0;">
              <p style="color:#5B4B8A;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin:0 0 4px;">Neural Match — Shortlist Request</p>
              <h2 style="color:white;margin:0;font-size:22px;">${name} · ${company}</h2>
            </div>
            <div style="background:white;padding:28px;border-radius:0 0 8px 8px;border:1px solid #e8ecf4;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;width:130px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#2D2D3A;font-weight:600;">${name}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">Company</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#2D2D3A;font-weight:600;">${company}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;"><a href="mailto:${email}" style="color:#29B6D8;font-weight:600;">${email}</a></td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#2D2D3A;">${phone || 'Not provided'}</td></tr>
                <tr><td style="padding:10px 0;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">Timeline</td><td style="padding:10px 0;"><span style="background:#5B4B8A18;color:#5B4B8A;font-size:12px;font-weight:700;padding:4px 10px;border-radius:8px;">${timeline}</span></td></tr>
              </table>
              <div style="margin-top:24px;padding:16px;background:#f0f4ff;border-radius:8px;font-size:13px;color:#2D2D3A;border-left:3px solid #5B4B8A;">
                <strong>Action required:</strong> Review their JD against the top 5% database and respond within 4 hours. Reply to <a href="mailto:${email}" style="color:#5B4B8A;">${email}</a>${phone ? ` or call/WhatsApp ${phone}` : ''}.
              </div>
              <div style="margin-top:12px;padding:12px;background:#f4f6fb;border-radius:8px;font-size:12px;color:#8A8A9E;">
                Submitted ${new Date().toUTCString()} via recruitable.asia Neural Match portal
              </div>
            </div>
          </div>
        `,
      })

      // Auto-confirm to client
      await resend.emails.send({
        from: 'portal@recruitable.asia',
        to: email,
        subject: `Shortlist request confirmed — we're on it`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4f6fb;border-radius:12px;">
            <div style="background:#2D2D3A;padding:20px 28px;border-radius:8px 8px 0 0;">
              <p style="color:#29B6D8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin:0 0 4px;">RecruitABLE · Neural Match</p>
              <h2 style="color:white;margin:0;font-size:22px;">Request Confirmed</h2>
            </div>
            <div style="background:white;padding:28px;border-radius:0 0 8px 8px;border:1px solid #e8ecf4;">
              <p style="color:#2D2D3A;line-height:1.7;">Hi ${name},</p>
              <p style="color:#2D2D3A;line-height:1.7;">Your shortlist request for <strong>${company}</strong> has been received. Here's what happens next:</p>
              <div style="margin:20px 0;padding:20px;background:#f4f6fb;border-radius:10px;">
                <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
                  <span style="background:#29B6D818;color:#29B6D8;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">1</span>
                  <span style="color:#2D2D3A;font-size:14px;line-height:1.6;">Within <strong>4 hours</strong> — a consultant will reach out to confirm your requirements.</span>
                </div>
                <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
                  <span style="background:#E8235A18;color:#E8235A;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">2</span>
                  <span style="color:#2D2D3A;font-size:14px;line-height:1.6;">Within <strong>48 hours</strong> — anonymised candidate profiles shared for your review.</span>
                </div>
                <div style="display:flex;align-items:flex-start;gap:12px;">
                  <span style="background:#5B4B8A18;color:#5B4B8A;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">3</span>
                  <span style="color:#2D2D3A;font-size:14px;line-height:1.6;">Within <strong>7 days</strong> — interviews scheduled with your confirmed shortlist.</span>
                </div>
              </div>
              <p style="color:#2D2D3A;line-height:1.7;">Questions? Email us directly at <a href="mailto:info@recruitable.asia" style="color:#E8235A;font-weight:700;">info@recruitable.asia</a>.</p>
              <p style="color:#8A8A9E;font-size:13px;margin-top:24px;">— The RecruitABLE Team<br/>KL · NYC · LON</p>
            </div>
          </div>
        `,
      })
    } catch (err) {
      console.error('Resend error (shortlist):', err)
      return res.status(500).json({ error: 'Failed to send email' })
    }
  } else {
    console.warn('RESEND_API_KEY not set — email not sent. Add it to your environment variables.')
  }

  return res.status(200).json({ success: true })
}
