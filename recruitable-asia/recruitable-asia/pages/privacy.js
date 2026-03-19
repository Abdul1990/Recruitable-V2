import Head from 'next/head'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Recruitable</title>
        <meta name="description" content="Privacy Policy for Recruitable Asia — how we collect, use, and protect your personal data across APAC, Europe, and the US." />
        <meta name="robots" content="noindex" />
      </Head>

      <style>{`
        .privacy-page { max-width: 760px; margin: 0 auto; padding: 72px 24px 96px; }
        .privacy-eyebrow { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .14em; color: var(--cyan); margin-bottom: 12px; font-family: var(--font-h); }
        .privacy-h1 { font-family: var(--font-h); font-size: clamp(28px,4vw,42px); font-weight: 900; color: var(--charcoal); margin-bottom: 10px; line-height: 1.15; }
        .privacy-date { font-size: 13px; color: var(--muted); font-weight: 500; margin-bottom: 48px; padding-bottom: 24px; border-bottom: 1px solid var(--slate-d); }
        .privacy-section { margin-bottom: 40px; }
        .privacy-h2 { font-family: var(--font-h); font-size: 18px; font-weight: 800; color: var(--charcoal); margin-bottom: 12px; }
        .privacy-p { font-size: 15px; color: var(--charcoal-soft); line-height: 1.75; margin-bottom: 14px; }
        .privacy-ul { margin: 0 0 14px 0; padding-left: 20px; }
        .privacy-ul li { font-size: 15px; color: var(--charcoal-soft); line-height: 1.75; margin-bottom: 6px; }
        .privacy-contact-box { background: var(--slate); border: 1.5px solid var(--slate-d); border-radius: 14px; padding: 24px 28px; margin-top: 48px; }
        .privacy-contact-box p { font-size: 14.5px; color: var(--charcoal-soft); line-height: 1.7; margin: 0; }
        .privacy-contact-box a { color: var(--pink); font-weight: 700; }
      `}</style>

      <div className="privacy-page">
        <div className="privacy-eyebrow">Legal</div>
        <h1 className="privacy-h1">Privacy Policy</h1>
        <p className="privacy-date">Last updated: March 2026 &nbsp;·&nbsp; Recruitable Asia Sdn Bhd</p>

        <div className="privacy-section">
          <h2 className="privacy-h2">1. Who We Are</h2>
          <p className="privacy-p">Recruitable Asia ("we", "us", "our") is a specialist technology recruitment firm operating from Kuala Lumpur, Malaysia, with client operations in New York City and London. We can be contacted at <a href="mailto:info@recruitable.asia" style={{color:'var(--pink)',fontWeight:700}}>info@recruitable.asia</a>.</p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-h2">2. Data We Collect</h2>
          <p className="privacy-p">We collect personal data only when you actively provide it through our website:</p>
          <ul className="privacy-ul">
            <li><strong>Contact enquiries</strong> — name, company name, and your message when you submit our contact form.</li>
            <li><strong>Job applications</strong> — name, email address, CV/resume filename, and any notes you provide when applying for a role.</li>
            <li><strong>Shortlist requests</strong> — name, company, email, phone number (optional), and hiring timeline when you use the Client Portal.</li>
          </ul>
          <p className="privacy-p">We do not use cookies beyond what is strictly necessary to operate the website, and we do not use third-party tracking cookies or advertising pixels.</p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-h2">3. How We Use Your Data</h2>
          <p className="privacy-p">We use the personal data you provide solely to:</p>
          <ul className="privacy-ul">
            <li>Respond to your enquiries and provide recruitment services</li>
            <li>Match candidates to relevant roles within our active mandates</li>
            <li>Share anonymised candidate profiles with hiring companies (with your consent)</li>
            <li>Communicate with you about the recruitment process</li>
          </ul>
          <p className="privacy-p">We do not sell, rent, or share your personal data with any third party for marketing purposes.</p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-h2">4. Legal Basis for Processing</h2>
          <p className="privacy-p">For users in the European Economic Area (EEA) and United Kingdom, our legal basis for processing personal data is:</p>
          <ul className="privacy-ul">
            <li><strong>Contractual necessity</strong> — to fulfil recruitment services you have requested</li>
            <li><strong>Legitimate interests</strong> — to operate our recruitment business and respond to enquiries</li>
            <li><strong>Consent</strong> — where you have explicitly agreed to us sharing your profile with specific hiring companies</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-h2">5. Data Sharing</h2>
          <p className="privacy-p">We may share your data with:</p>
          <ul className="privacy-ul">
            <li><strong>Hiring companies</strong> — anonymised candidate profiles are shared with clients only after your agreement</li>
            <li><strong>Resend</strong> — our transactional email provider, used to deliver form confirmations (data processed under their privacy policy)</li>
          </ul>
          <p className="privacy-p">All data transfers are conducted under appropriate safeguards in compliance with applicable data protection law.</p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-h2">6. Data Retention</h2>
          <p className="privacy-p">We retain candidate and client data for up to 2 years from the date of last contact, after which it is securely deleted. You may request deletion at any time (see Section 7).</p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-h2">7. Your Rights</h2>
          <p className="privacy-p">Depending on your location, you have the following rights regarding your personal data:</p>
          <ul className="privacy-ul">
            <li><strong>Access</strong> — request a copy of the data we hold about you</li>
            <li><strong>Rectification</strong> — request correction of inaccurate data</li>
            <li><strong>Erasure</strong> — request deletion of your data ("right to be forgotten")</li>
            <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
            <li><strong>Objection</strong> — object to processing based on legitimate interests</li>
            <li><strong>Restriction</strong> — request we limit how we use your data</li>
          </ul>
          <p className="privacy-p">To exercise any of these rights, email us at <a href="mailto:info@recruitable.asia" style={{color:'var(--pink)',fontWeight:700}}>info@recruitable.asia</a>. We will respond within 30 days.</p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-h2">8. Security</h2>
          <p className="privacy-p">We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure. Our website is served over HTTPS and form submissions are encrypted in transit.</p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-h2">9. International Transfers</h2>
          <p className="privacy-p">As a global business with operations in Malaysia, the US, and the UK, your data may be processed in multiple jurisdictions. Where we transfer data outside the EEA, we ensure appropriate safeguards are in place (such as Standard Contractual Clauses) in compliance with GDPR.</p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-h2">10. Changes to This Policy</h2>
          <p className="privacy-p">We may update this Privacy Policy from time to time. Material changes will be noted with a revised "Last updated" date at the top of this page.</p>
        </div>

        <div className="privacy-contact-box">
          <p>
            <strong>Questions about your privacy?</strong> Contact our data team at{' '}
            <a href="mailto:info@recruitable.asia">info@recruitable.asia</a>.{' '}
            If you are based in the EEA and believe we have not handled your data correctly, you have the right to lodge a complaint with your local supervisory authority.
          </p>
        </div>
      </div>
    </>
  )
}
