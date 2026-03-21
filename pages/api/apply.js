/**
 * API Route: /api/apply
 * Handles job application form submissions including CV file (base64 encoded).
 * To send CV as email attachment, uncomment the Resend section below.
 */

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, note, jobTitle, jobCompany, fileName, fileData, fileType } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  // Validate file type server-side
  if (fileType && !['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)) {
    return res.status(400).json({ error: 'Only PDF and Word documents are accepted' })
  }

  // Validate file size (base64 is ~33% larger than binary)
  if (fileData && fileData.length > 13_500_000) {
    return res.status(400).json({ error: 'File too large. Maximum size is 10MB' })
  }

  console.log('=== NEW JOB APPLICATION ===')
  console.log(`Applicant: ${name} <${email}>`)
  console.log(`Role: ${jobTitle} at ${jobCompany}`)
  console.log(`CV File: ${fileName || 'none'} (${fileData ? Math.round(fileData.length * 0.75 / 1024) + 'KB' : 'no file'})`)
  console.log(`Note: ${note || 'none'}`)
  console.log(`Time: ${new Date().toISOString()}`)
  console.log('===========================')

  // ── OPTIONAL: Wire up Resend with CV attachment ──────────────────────────
  // 1. npm install resend
  // 2. Add RESEND_API_KEY to Vercel environment variables
  // 3. Uncomment below:
  //
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // const attachments = fileData ? [{
  //   filename: fileName,
  //   content: fileData, // base64 string
  // }] : []
  // await resend.emails.send({
  //   from: 'applications@recruitable.asia',
  //   to: 'info@recruitable.asia',
  //   replyTo: email,
  //   subject: `New Application: ${name} for ${jobTitle} at ${jobCompany}`,
  //   html: `
  //     <h2>New Job Application</h2>
  //     <p><b>Name:</b> ${name}</p>
  //     <p><b>Email:</b> ${email}</p>
  //     <p><b>Role:</b> ${jobTitle} at ${jobCompany}</p>
  //     <p><b>CV:</b> ${fileName || 'not provided'}</p>
  //     <p><b>Note:</b> ${note || 'none'}</p>
  //   `,
  //   attachments,
  // })
  // ────────────────────────────────────────────────────────────────────────

  return res.status(200).json({ success: true })
}
