/**
 * API Route: /api/apply
 * Handles job application form submissions.
 * CV file name is captured; for actual file storage add S3/Cloudflare R2.
 * Requires RESEND_API_KEY in environment variables to send real emails.
 */
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, note, jobTitle, jobCompany, fileName } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  console.log('=== NEW JOB APPLICATION ===')
  console.log(`Applicant: ${name} <${email}> | Role: ${jobTitle} at ${jobCompany}`)
  console.log(`Time: ${new Date().toISOString()}`)

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)

      // Notify internal team
      await resend.emails.send({
        from: 'applications@recruitable.asia',
        to: 'info@recruitable.asia',
        replyTo: `${name} <${email}>`,
        subject: `New Application — ${jobTitle} at ${jobCompany} | ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4f6fb;border-radius:12px;">
            <div style="background:#2D2D3A;padding:20px 28px;border-radius:8px 8px 0 0;">
              <p style="color:#F5A623;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin:0 0 4px;">New Job Application</p>
              <h2 style="color:white;margin:0;font-size:22px;">${name}</h2>
            </div>
            <div style="background:white;padding:28px;border-radius:0 0 8px 8px;border:1px solid #e8ecf4;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;width:130px;">Applicant</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#2D2D3A;font-weight:600;">${name}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;"><a href="mailto:${email}" style="color:#29B6D8;font-weight:600;">${email}</a></td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">Role</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#2D2D3A;font-weight:600;">${jobTitle}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">Company</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#2D2D3A;font-weight:600;">${jobCompany}</td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;">CV File</td><td style="padding:10px 0;border-bottom:1px solid #e8ecf4;color:#2D2D3A;">${fileName || 'Not provided'}</td></tr>
                <tr><td style="padding:10px 0;color:#8A8A9E;font-size:12px;font-weight:700;text-transform:uppercase;vertical-align:top;padding-top:14px;">Note</td><td style="padding:10px 0;color:#2D2D3A;line-height:1.6;padding-top:14px;">${note ? note.replace(/\n/g, '<br/>') : '—'}</td></tr>
              </table>
              <div style="margin-top:24px;padding:16px;background:#fff8f0;border-radius:8px;font-size:13px;color:#2D2D3A;border-left:3px solid #F5A623;">
                <strong>Next step:</strong> Reply directly to this email to reach the applicant, or contact <a href="mailto:${email}" style="color:#F5A623;">${email}</a>.
              </div>
              <div style="margin-top:12px;padding:12px;background:#f4f6fb;border-radius:8px;font-size:12px;color:#8A8A9E;">
                Submitted ${new Date().toUTCString()} via recruitable.asia jobs board
              </div>
            </div>
          </div>
        `,
      })

      // Auto-confirm to applicant
      await resend.emails.send({
        from: 'applications@recruitable.asia',
        to: email,
        subject: `Application received — ${jobTitle} at ${jobCompany}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f4f6fb;border-radius:12px;">
            <div style="background:#2D2D3A;padding:20px 28px;border-radius:8px 8px 0 0;">
              <p style="color:#29B6D8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin:0 0 4px;">RecruitABLE</p>
              <h2 style="color:white;margin:0;font-size:22px;">Application Received</h2>
            </div>
            <div style="background:white;padding:28px;border-radius:0 0 8px 8px;border:1px solid #e8ecf4;">
              <p style="color:#2D2D3A;line-height:1.7;">Hi ${name},</p>
              <p style="color:#2D2D3A;line-height:1.7;">We've received your application for <strong>${jobTitle}</strong> at ${jobCompany}. Our team reviews every CV personally — you'll hear from us within 2 business days.</p>
              <p style="color:#2D2D3A;line-height:1.7;">In the meantime, feel free to reach out at <a href="mailto:info@recruitable.asia" style="color:#E8235A;font-weight:700;">info@recruitable.asia</a> if you have any questions.</p>
              <p style="color:#8A8A9E;font-size:13px;margin-top:24px;">— The RecruitABLE Team<br/>KL · NYC · LON</p>
            </div>
          </div>
        `,
      })
    } catch (err) {
      console.error('Resend error (apply):', err)
      return res.status(500).json({ error: 'Failed to send email' })
    }
  } else {
    console.warn('RESEND_API_KEY not set — email not sent. Add it to your environment variables.')
  }

  return res.status(200).json({ success: true })
}
