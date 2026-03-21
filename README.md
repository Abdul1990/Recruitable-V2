# RecruitABLE Asia — Next.js / Vercel

Production-ready single-page application for recruitable.asia.

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy to Vercel (3 steps)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit — RecruitABLE Asia"
git remote add origin https://github.com/YOUR_USERNAME/recruitable-asia.git
git push -u origin main
```

### 2. Import to Vercel
- Go to https://vercel.com/new
- Click "Import Git Repository"
- Select your `recruitable-asia` repo
- Framework: **Next.js** (auto-detected)
- Click **Deploy**

### 3. Connect your domain
- In Vercel Dashboard → Settings → Domains
- Add `recruitable.asia` and `www.recruitable.asia`
- Point your DNS to Vercel's nameservers (provided in dashboard)

## Features Built In
- ✅ Radar chart — Top 5% technical vetting benchmark
- ✅ Forward Deployment Engineering — highlighted bridge role card
- ✅ Global hubs — KL (Engine Room) · NYC · LON (Strategic Frontiers)
- ✅ Top bar — hubs + info@recruitable.asia consistent throughout
- ✅ Contact form — domain selector includes all 6 specialisations
- ✅ Market Insights — 3 editorial cards
- ✅ Fully responsive — mobile nav burger menu
- ✅ Zero dependencies beyond Next.js + React

## Connecting a Real Form Backend
The contact form currently simulates a submission. To make it live:

### Option A — Formspree (easiest, free tier available)
```bash
# In pages/index.js, replace handleSubmit with:
const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formState),
})
```

### Option B — Vercel API Route + Resend email
Create `pages/api/contact.js`:
```js
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  const { name, company, domain, message } = req.body
  await resend.emails.send({
    from: 'noreply@recruitable.asia',
    to: 'info@recruitable.asia',
    subject: `New enquiry — ${domain} — ${company}`,
    html: `<p><b>${name}</b> from <b>${company}</b></p><p>${message}</p>`
  })
  res.json({ ok: true })
}
```
Then set `RESEND_API_KEY` in Vercel → Settings → Environment Variables.
