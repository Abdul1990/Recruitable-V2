import Head from 'next/head'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Recruitable Asia</title>
        <meta name="description" content="Privacy policy for Recruitable Asia — how we collect, use, and protect your data." />
      </Head>

      <style>{`
        .privacy-page { background: #F4F6FB; min-height: 100vh; padding: 64px 0; }
        .privacy-inner { max-width: 760px; margin: 0 auto; padding: 0 24px; }
        .privacy-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: #29B6D8; margin-bottom: 12px; font-family: 'Nunito', sans-serif; }
        .privacy-h1 { font-family: 'Nunito', sans-serif; font-size: clamp(28px, 4vw, 42px); font-weight: 900; color: #2D2D3A; margin-bottom: 8px; line-height: 1.15; }
        .privacy-updated { font-size: 13px; color: #8A8A9E; font-weight: 500; margin-bottom: 48px; }
        .privacy-section { margin-bottom: 40px; }
        .privacy-section h2 { font-family: 'Nunito', sans-serif; font-size: 20px; font-weight: 800; color: #2D2D3A; margin-bottom: 12px; }
        .privacy-section p { font-size: 15px; color: #3D3D4E; line-height: 1.75; margin-bottom: 12px; }
        .privacy-section ul { padding-left: 20px; margin-bottom: 12px; }
        .privacy-section li { font-size: 15px; color: #3D3D4E; line-height: 1.75; margin-bottom: 6px; }
        .privacy-section a { color: #29B6D8; font-weight: 600; }
        .privacy-section a:hover { color: #E8235A; }
        .privacy-divider { height: 1px; background: rgba(45,45,58,0.1); margin: 32px 0; }
      `}</style>

      <div className="privacy-page">
        <div className="privacy-inner">
          <div className="privacy-label">Legal</div>
          <h1 className="privacy-h1">Privacy Policy</h1>
          <p className="privacy-updated">Last updated: March 2026</p>

          <div className="privacy-section">
            <h2>1. Who We Are</h2>
            <p>
              Recruitable Asia (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a specialist technology recruitment firm
              operating across APAC, with hubs in Kuala Lumpur, New York City, and London.
              We connect top-tier technology talent with leading companies across the region.
            </p>
            <p>
              Our primary contact is <a href="mailto:info@recruitable.asia">info@recruitable.asia</a>.
            </p>
          </div>

          <div className="privacy-divider" />

          <div className="privacy-section">
            <h2>2. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>Name, email address, and contact details submitted via our contact or application forms</li>
              <li>CV and resume files uploaded through our job application portal</li>
              <li>Company name and hiring requirements submitted through the client portal</li>
              <li>Job description content submitted for our Neural Match engine</li>
            </ul>
            <p>
              We do not collect any data automatically beyond standard server logs
              (IP address, browser type, pages visited) which are retained for 30 days.
            </p>
          </div>

          <div className="privacy-divider" />

          <div className="privacy-section">
            <h2>3. How We Use Your Information</h2>
            <p>Information you submit is used solely to:</p>
            <ul>
              <li>Respond to your hiring or job enquiry</li>
              <li>Match candidates to relevant roles within our network</li>
              <li>Send you a shortlist of pre-vetted candidates (client portal requests)</li>
              <li>Communicate with you about your application or search mandate</li>
            </ul>
            <p>
              We do not sell, rent, or share your personal information with third parties
              for marketing purposes. We do not use your data for automated decision-making.
            </p>
          </div>

          <div className="privacy-divider" />

          <div className="privacy-section">
            <h2>4. CV and Resume Data</h2>
            <p>
              CVs submitted through our jobs portal are shared only with the specific hiring
              company relevant to the role you applied for. We retain CV data for a maximum
              of 12 months from the date of submission, after which it is securely deleted
              unless you have given us explicit permission to retain it for future opportunities.
            </p>
          </div>

          <div className="privacy-divider" />

          <div className="privacy-section">
            <h2>5. Data Retention</h2>
            <p>
              Contact form submissions are retained for 24 months to allow us to follow up
              on enquiries. You may request deletion of your data at any time by emailing
              us at <a href="mailto:info@recruitable.asia">info@recruitable.asia</a>.
            </p>
          </div>

          <div className="privacy-divider" />

          <div className="privacy-section">
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a href="mailto:info@recruitable.asia">info@recruitable.asia</a> and
              we will respond within 5 business days.
            </p>
          </div>

          <div className="privacy-divider" />

          <div className="privacy-section">
            <h2>7. Cookies</h2>
            <p>
              This website does not use tracking cookies or analytics cookies. We do not
              use Google Analytics, Meta Pixel, or any third-party tracking services.
              The only cookies present are those required for the site to function.
            </p>
          </div>

          <div className="privacy-divider" />

          <div className="privacy-section">
            <h2>8. Security</h2>
            <p>
              All data is transmitted over HTTPS. Form submissions are processed via
              Vercel&apos;s secure serverless infrastructure. We do not store payment
              information of any kind.
            </p>
          </div>

          <div className="privacy-divider" />

          <div className="privacy-section">
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. When we do, we will update
              the &quot;Last updated&quot; date at the top of this page. Continued use of
              the site after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          <div className="privacy-divider" />

          <div className="privacy-section">
            <h2>10. Contact</h2>
            <p>
              For any privacy-related questions, contact us at:{' '}
              <a href="mailto:info@recruitable.asia">info@recruitable.asia</a>
            </p>
            <p>Recruitable Asia &mdash; KL &middot; NYC &middot; LON</p>
          </div>
        </div>
      </div>
    </>
  )
}
