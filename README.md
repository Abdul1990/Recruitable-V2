# Recruitable Asia — Full-Stack Platform

> Swipe-to-match recruitment for APAC tech talent.
> AI-powered job matching · ATS integration · In-app messaging · Mobile + Web

---

## What This Is

Recruitable Asia is a full-stack recruitment platform built for the APAC tech market. It connects developers to positions using swipe-based matching (like Tinder for jobs), with AI-powered scoring, LinkedIn sign-in, and real-time messaging once both sides match.

**Primary markets:** Malaysia · Singapore · Australia · Vietnam · Indonesia · Thailand

---

## Repository Structure

```
recruitable-asia/
│
├── pages/                      # Next.js pages & API routes
│   ├── index.js                # Marketing homepage
│   ├── jobs.js                 # Job listings (web)
│   ├── portal.js               # Client portal / neural match engine
│   └── api/
│       ├── contact.js          # Contact form
│       ├── apply.js            # Job application + CV upload
│       ├── match-score.js      # Claude AI job match scorer
│       ├── summarise-profile.js# Claude profile summariser
│       ├── cv-upload.js        # PDF → sanitised PNG converter
│       ├── auth/
│       │   └── linkedin.js     # LinkedIn OAuth token exchange
│       └── ats/
│           ├── connect.js      # Register ATS connection
│           ├── sync.js         # Pull + parse jobs from ATS
│           ├── sync-all.js     # Cron: sync all connections every 6h
│           └── webhook/
│               └── [connectionId].js  # Real-time ATS webhook receiver
│
├── lib/
│   └── ats/
│       ├── parser.js           # Claude-powered job description parser
│       └── adapters/
│           ├── greenhouse.js   # Greenhouse ATS adapter
│           ├── lever.js        # Lever ATS adapter
│           ├── workday.js      # Workday ATS adapter
│           └── generic.js      # Ashby · BambooHR · SmartRecruiters · Jobvite · HTML fallback
│
├── mobile/                     # Flutter app (iOS · Android · Web)
│   └── lib/
│       ├── main.dart           # App entry point, routing, splash screen
│       ├── config/
│       │   └── app_config.dart # Constants, endpoints, APAC region codes
│       ├── data/
│       │   └── specialisms.dart# Skill → specialism mapping + resolver
│       ├── models/             # UserProfile, Job, Match, Message, SwipeDecision
│       ├── services/
│       │   ├── auth_service.dart       # LinkedIn OAuth → Firebase custom token
│       │   ├── firestore_service.dart  # All Firestore read/write operations
│       │   ├── matching_service.dart   # AI match scoring via /api/match-score
│       │   └── cv_service.dart         # CV upload + Firebase Storage
│       └── screens/
│           ├── onboarding/     # LinkedIn auth WebView, skill selection
│           ├── swipe/          # Swipe feed + job card widget
│           ├── messages/       # Real-time chat screen
│           └── (profile, matches in main.dart)
│
├── firestore/
│   ├── firestore.rules         # Security rules for all collections
│   └── firestore.indexes.json  # Composite indexes
│
├── components/                 # Shared Next.js components (Layout, Navbar)
├── public/                     # Static assets
├── .env.local.example          # Environment variable template
└── vercel.json                 # Vercel config + cron schedule
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web frontend | Next.js 15 · React 19 · Vercel |
| Mobile | Flutter 3 (iOS · Android · Web) |
| Database | Firebase Firestore |
| Auth | Firebase Auth · LinkedIn OAuth2 |
| Storage | Firebase Storage |
| Push notifications | Firebase Cloud Messaging |
| AI | Claude API (Anthropic) — Haiku for scoring/parsing, Sonnet for summaries |
| ATS Integration | Greenhouse · Lever · Workday · Ashby · BambooHR · SmartRecruiters · Jobvite |
| Deployment | Vercel (web) · App Store / Play Store (mobile) |

---

## Local Development

### Prerequisites

- Node.js 20+
- Flutter 3.3+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

### 1. Clone and install

```bash
git clone https://github.com/Abdul1990/Recruitable-V2.git
cd recruitable-asia
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Fill in all values — see Environment Variables section below
```

### 3. Run the web app

```bash
npm run dev
# → http://localhost:3000
```

### 4. Run the Flutter app

```bash
cd mobile
flutter pub get
# Configure Firebase (one-time):
dart pub global activate flutterfire_cli
flutterfire configure
# Run:
flutter run
```

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `LINKEDIN_CLIENT_ID` | [linkedin.com/developers](https://www.linkedin.com/developers/apps) → Create App |
| `LINKEDIN_CLIENT_SECRET` | Same LinkedIn app |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate Key |
| `FIREBASE_PRIVATE_KEY` | Same service account JSON |
| `FIREBASE_STORAGE_BUCKET` | Firebase Console → Storage |
| `NEXT_PUBLIC_BASE_URL` | `https://recruitable.asia` (or `http://localhost:3000` locally) |
| `CRON_SECRET` | Set automatically by Vercel in production; any random string locally |

---

## Firebase Setup

### 1. Create a Firebase project

Go to [console.firebase.google.com](https://console.firebase.google.com), create a project named `recruitable-asia`, and enable:
- **Authentication** → Sign-in method → Custom (for LinkedIn OAuth)
- **Firestore Database** → Production mode
- **Storage** → Default bucket

### 2. Deploy Firestore rules and indexes

```bash
firebase login
firebase use --add   # select your project
firebase deploy --only firestore:rules,firestore:indexes
```

### 3. Configure Flutter

```bash
cd mobile
flutterfire configure
# Select your Firebase project → generates lib/firebase_options.dart
```

---

## Mobile App — Feature Guide

### Onboarding Flow

```
1. Splash screen  →  "Continue with LinkedIn"
2. LinkedIn OAuth WebView  →  profile pulled automatically
3. Skill selection  →  pick top 5 skills from grid
        → App predicts your specialism in real time
4. Location picker  →  select your APAC base country
5. Feed ready  →  swipe on AI-scored job cards
```

### Specialism Mapping

The app maps your 5 selected skills to one of 16 specialisms across 4 categories:

| Category | Specialisms |
|---|---|
| AI & ML | AI Engineer · AI Product Engineer · Solution Engineer · Forward Deployment Engineer · AI Product Manager |
| Software Engineering | Back-end · Full Stack · Front End · Mobile · Engineering Manager |
| Data | ML Engineering · Data Engineering · Data Scientist |
| Product | Product Manager · Product Designer · Product Engineering |

### Swipe Feed

- Cards are scored against your skills + specialism using Claude
- Cards below **60%** match are filtered out
- Cards above **85%** show a **Strong Match** badge
- Swipe right = interested → creates a Match + unlocks messaging
- Swipe left = pass
- Your own country's jobs appear first; other APAC markets follow; US/London at the end

### Match & Messaging

- When you swipe right on a job, a Match is created instantly
- The in-app chat opens a real-time Firestore message thread
- No phone numbers or email addresses are ever exchanged in-app

### CV Upload

- Upload a PDF or DOCX
- Page 1 is rendered as a PNG image server-side
- Phone numbers and email addresses are automatically redacted before the image is stored
- The raw CV file is never persisted — only the sanitised image

---

## ATS Integration

Companies can connect their ATS so jobs are automatically imported, parsed, and made available in the swipe feed.

### Supported ATS Systems

| ATS | Auth method | Notes |
|---|---|---|
| **Greenhouse** | Public board token | No API key needed |
| **Lever** | Public site slug | No API key needed |
| **Workday** | Public careers URL | Fetches via internal JSON endpoint |
| **Ashby** | Public company ID | No API key needed |
| **BambooHR** | Subdomain | No API key needed |
| **SmartRecruiters** | Company ID | No API key needed |
| **Jobvite** | Company key | No API key needed |
| **Generic** | Careers page URL | Falls back to Claude HTML scraper |

### Connect an ATS

```bash
POST /api/ats/connect
Content-Type: application/json

{
  "companyName": "Grab",
  "atsType": "greenhouse",
  "identifier": "grab",
  "clientId": "<firebase-uid>"
}
```

**Response:**

```json
{
  "connectionId": "abc123xyz",
  "jobCount": 47,
  "webhookUrl": "https://recruitable.asia/api/ats/webhook/abc123xyz",
  "webhookSecret": "xxxxxxxxxxxxxxxx",
  "message": "Connected to Grab's greenhouse account. Found 47 active jobs."
}
```

Paste the `webhookUrl` and `webhookSecret` into your ATS webhook settings so new jobs sync in real time.

### What Gets Extracted Per Job

Claude parses every job description and extracts:

| Field | Example |
|---|---|
| `title` | Senior Full Stack Engineer |
| `company` | Grab |
| `location` | Kuala Lumpur |
| `region` | MY |
| `salary` | MYR 12,000–18,000/mo |
| `salaryMin` | 12000 |
| `salaryMax` | 18000 |
| `salaryCurrency` | MYR |
| `stack` | React, Go, Kubernetes, Postgres |
| `type` | Engineering |
| `seniority` | Senior |
| `description` | Cleaned 600-char summary (no PII) |

### Sync Schedule

Jobs sync automatically every **6 hours** via Vercel Cron. You can also trigger a manual sync:

```bash
POST /api/ats/sync
{ "connectionId": "abc123xyz" }
```

Jobs removed from the ATS are automatically **deactivated** (not deleted) in Firestore so swipe history remains intact.

---

## API Reference

### `POST /api/match-score`

Scores a candidate against a job using Claude. Called by the Flutter app — API key never leaves the server.

**Request:**
```json
{
  "candidate": {
    "specialism": "Full Stack Development",
    "skills": ["React", "Next.js", "TypeScript", "NodeJS", "Postgres"],
    "summary": "5 years building SaaS products...",
    "location": "MY"
  },
  "job": {
    "title": "Senior Full Stack Engineer",
    "company": "Grab",
    "region": "MY",
    "type": "Engineering",
    "stack": ["React", "Go", "Kubernetes"],
    "description": "..."
  }
}
```

**Response:**
```json
{ "score": 78, "reason": "Strong React/TypeScript overlap; candidate lacks Go experience required for backend services." }
```

---

### `POST /api/auth/linkedin`

Exchanges a LinkedIn OAuth2 code for a Firebase custom auth token.

**Request:** `{ "code": "<oauth-code>" }`

**Response:** `{ "firebaseToken": "...", "accessToken": "...", "profile": { ... } }`

---

### `POST /api/cv-upload`

Accepts a base64-encoded PDF, renders page 1 as a PNG, strips PII, uploads to Firebase Storage.

**Request:** `{ "uid": "...", "fileName": "cv.pdf", "fileData": "<base64>", "fileType": "pdf" }`

**Response:** `{ "cvImageURL": "https://storage.googleapis.com/..." }`

---

### `POST /api/summarise-profile`

Generates a PII-free 3-sentence bio from LinkedIn work history using Claude.

**Request:** `{ "uid": "<firebase-uid>" }`

**Response:** `{ "summary": "An experienced backend engineer specialising in distributed systems..." }`

---

## Firestore Data Model

```
/users/{uid}
  displayName       string
  photoURL          string        LinkedIn profile photo
  specialism        string        e.g. 'fullstack'
  specialismTitle   string        e.g. 'Full Stack Development'
  topSkills         string[5]
  summary           string        AI-generated, PII-free
  cvImageURL        string?       Firebase Storage URL
  location          string        e.g. 'MY', 'SG'
  createdAt         timestamp
  updatedAt         timestamp

/jobs/{jobId}
  title, company, location, locationFull
  region            string        MY | SG | AU | VN | ID | TH | US | London
  type              string        AI / ML | Engineering | Data | Product
  seniority         string        Junior | Mid | Senior | Lead | Principal
  salary, salaryNote, salaryMin, salaryMax, salaryCurrency
  stack             string[]
  description       string
  color             string        hex — brand colour per type
  isActive          boolean
  atsConnectionId   string?       links to ATS connection
  atsJobId          string?       external ID in ATS
  atsSource         string?       greenhouse | lever | workday | ...
  postedAt          timestamp

/swipes/{uid}/decisions/{jobId}
  direction         'right' | 'left'
  matchScore        int           0–100
  matchReason       string
  decidedAt         timestamp

/matches/{matchId}
  candidateId, jobId, company, jobTitle
  matchScore        int
  hasUnreadMessages boolean
  unlockedAt        timestamp

/messages/{matchId}/thread/{msgId}
  senderId, text
  sentAt            timestamp
  isRead            boolean

/ats_connections/{connectionId}
  clientId          string        Firebase UID of client
  companyName, atsType, identifier
  webhookSecret     string        HMAC secret for webhook verification
  status            'active' | 'error' | 'warning' | 'paused'
  lastSyncAt        timestamp
  jobCount          int

/ats_sync_logs/{logId}
  connectionId, syncType
  jobsFound, jobsCreated, jobsUpdated, jobsDeactivated
  errors            string[]
  startedAt, completedAt timestamp
```

---

## Security

- **PII policy:** Phone numbers and email addresses are stripped at every boundary — LinkedIn pull, Claude summarisation, CV rendering, and Firestore rules all enforce this independently
- **No raw CV storage:** Only a sanitised PNG of page 1 is stored; the original file is discarded server-side
- **API keys:** Claude, Firebase Admin, and LinkedIn secrets are server-side only — never in the Flutter app or client JS
- **Firestore rules:** Users can only read/write their own documents. ATS connections and sync logs are Admin SDK-only writes. Message senders are verified against `auth.uid`
- **Webhook verification:** All ATS webhooks are verified with HMAC-SHA256 before processing

---

## Deployment

### Web (Vercel)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local.example`
4. Deploy — Vercel auto-detects Next.js

Vercel Cron runs `POST /api/ats/sync-all` every 6 hours automatically.

### Firebase

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### Mobile — iOS

```bash
cd mobile
flutter build ios --release
# Open mobile/ios/Runner.xcworkspace in Xcode → Archive → App Store Connect
```

### Mobile — Android

```bash
cd mobile
flutter build appbundle --release
# Upload mobile/build/app/outputs/bundle/release/app-release.aab to Play Console
```

---

## Roadmap

- [ ] Recruiter-side dashboard (post jobs, view candidate swipes, initiate messages)
- [ ] Push notifications for new matches and messages
- [ ] Profile screen with CV image viewer and specialism badge
- [ ] DOCX → PDF → image rendering (currently PDF only)
- [ ] In-app salary negotiation signals (candidate sets min; shown to recruiter only)
- [ ] Admin dashboard for managing ATS connections and sync health
- [ ] Stripe subscription for client companies (per-seat or per-hire)

---

## Contributing

This is a private repository. For access or collaboration enquiries, contact [info@recruitable.asia](mailto:info@recruitable.asia).

---

## License

Private and confidential. All rights reserved — Recruitable Asia.
