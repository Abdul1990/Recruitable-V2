# ATS Integration Guide

Connect your Applicant Tracking System to Recruitable Asia so your jobs automatically appear in the candidate swipe feed.

---

## How It Works

```
Your ATS
   │
   ├─ Webhook (real-time push)     → POST /api/ats/webhook/{connectionId}
   │                                        │
   └─ Scheduled pull (every 6h)   → POST /api/ats/sync
                                            │
                                   Claude parses each job:
                                   title · company · location · region
                                   salary · stack · seniority · type
                                            │
                                   Firestore /jobs collection
                                            │
                                   Candidate swipe feed (mobile app)
```

---

## Step 1 — Register your ATS connection

```bash
POST https://recruitable.asia/api/ats/connect
Content-Type: application/json

{
  "companyName": "Your Company",
  "atsType": "greenhouse",
  "identifier": "your-board-token",
  "clientId": "<your-firebase-uid>"
}
```

### `atsType` values and what to put in `identifier`

| atsType | identifier | Where to find it |
|---|---|---|
| `greenhouse` | Board token, e.g. `acmecorp` | Greenhouse → Settings → Job Board → Board Token |
| `lever` | Company slug, e.g. `acmecorp` | Lever → Settings → Integrations → Postings API |
| `workday` | Full careers URL | Your Workday careers page URL |
| `ashby` | Company ID, e.g. `acmecorp` | Ashby → Settings → Job Board URL |
| `bamboohr` | Subdomain, e.g. `acmecorp` | The part before `.bamboohr.com` |
| `smartrecruiters` | Company ID | Your SmartRecruiters careers page URL |
| `jobvite` | Company key | Your Jobvite careers page URL |
| `generic` | Full careers page URL | Any URL — we'll scrape it |

### Response

```json
{
  "connectionId": "abc123xyz",
  "jobCount": 47,
  "webhookUrl": "https://recruitable.asia/api/ats/webhook/abc123xyz",
  "webhookSecret": "a1b2c3d4e5f6...",
  "message": "Connected to Your Company's greenhouse account. Found 47 active jobs."
}
```

Save the `connectionId`, `webhookUrl`, and `webhookSecret` — you'll need them in Step 2.

---

## Step 2 — Configure your ATS webhook (optional but recommended)

Webhooks give you real-time syncing whenever a job is published or closed. Without webhooks, jobs sync every 6 hours via cron.

### Greenhouse

1. In Greenhouse: **Settings → Dev Centre → Web Hooks → New Web Hook**
2. Endpoint URL: `https://recruitable.asia/api/ats/webhook/{connectionId}`
3. Secret Key: paste your `webhookSecret`
4. Events to subscribe: `Job Created`, `Job Updated`, `Job Deleted`

### Lever

1. In Lever: **Settings → Integrations → Webhooks → Add webhook**
2. URL: `https://recruitable.asia/api/ats/webhook/{connectionId}`
3. Secret: paste your `webhookSecret`
4. Events: `posting_published`, `posting_closed`

### Ashby

1. In Ashby: **Settings → Integrations → Webhooks → New Webhook**
2. Webhook URL: `https://recruitable.asia/api/ats/webhook/{connectionId}`
3. Secret: paste your `webhookSecret`

### Other ATS systems

Most ATS systems support webhooks in a similar way. Use:
- URL: `https://recruitable.asia/api/ats/webhook/{connectionId}`
- Method: `POST`
- Signature header: `X-Webhook-Secret` with your `webhookSecret`

---

## Step 3 — Trigger a manual sync (optional)

```bash
POST https://recruitable.asia/api/ats/sync
Content-Type: application/json

{ "connectionId": "abc123xyz" }
```

Response:
```json
{
  "jobsFound": 47,
  "jobsCreated": 12,
  "jobsUpdated": 35,
  "jobsDeactivated": 2,
  "errors": []
}
```

---

## What Gets Extracted

Every job description is passed through Claude, which extracts:

| Field | Type | Example |
|---|---|---|
| `title` | string | Senior Full Stack Engineer |
| `company` | string | Grab |
| `location` | string | Kuala Lumpur |
| `locationFull` | string | Kuala Lumpur, Malaysia |
| `region` | string | `MY` |
| `salary` | string | MYR 12,000–18,000/mo |
| `salaryMin` | number | 12000 |
| `salaryMax` | number | 18000 |
| `salaryCurrency` | string | MYR |
| `stack` | string[] | `["React", "Go", "Kubernetes", "Postgres"]` |
| `type` | string | Engineering |
| `seniority` | string | Senior |
| `description` | string | Cleaned 600-char summary |
| `color` | string | `#03A9F4` — brand colour per type |

### Region codes

| Code | Country |
|---|---|
| `MY` | Malaysia |
| `SG` | Singapore |
| `AU` | Australia |
| `VN` | Vietnam |
| `ID` | Indonesia |
| `TH` | Thailand |
| `US` | United States |
| `London` | United Kingdom |
| `EU` | Europe (other) |
| `Remote` | Remote |

### Seniority levels

`Internship` · `Junior` · `Mid` · `Senior` · `Lead` · `Principal` · `Director` · `C-Level`

### Job type categories

`AI / ML` · `Engineering` · `Data` · `Product` · `Design` · `Management`

---

## Sync behaviour

- **New jobs** in the ATS → created in Firestore, appear in swipe feed
- **Updated jobs** in the ATS → updated in Firestore
- **Closed / removed jobs** in the ATS → marked `isActive: false` in Firestore (hidden from feed, swipe history preserved)
- **Duplicate detection**: jobs are matched by `atsJobId` — updating a job never creates a duplicate

---

## Sync logs

Every sync creates a log document in `/ats_sync_logs`:

```json
{
  "connectionId": "abc123xyz",
  "syncType": "scheduled",
  "status": "completed",
  "jobsFound": 47,
  "jobsCreated": 3,
  "jobsUpdated": 44,
  "jobsDeactivated": 1,
  "errors": [],
  "startedAt": "2026-03-22T06:00:00Z",
  "completedAt": "2026-03-22T06:01:23Z"
}
```

---

## Connection status

Your connection can be in one of these states:

| Status | Meaning |
|---|---|
| `active` | Last sync completed with no errors |
| `warning` | Last sync completed but some jobs failed to parse |
| `error` | Last sync failed entirely — check logs |
| `paused` | Manually paused — no syncs will run |

---

## Rate limiting

To be respectful to ATS systems, jobs are parsed in batches of 5 concurrently. Workday fetches include an 800ms pause between batches. If your ATS has strict rate limits, contact us to configure a longer interval.
