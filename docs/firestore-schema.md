# Firestore Schema

All collections, fields, types, and security rules.

---

## Collections

### `/users/{uid}`

One document per registered user. `uid` matches their Firebase Auth UID.

| Field | Type | Description |
|---|---|---|
| `displayName` | string | Full name from LinkedIn |
| `photoURL` | string | LinkedIn profile photo URL |
| `specialism` | string | Specialism ID, e.g. `fullstack`, `ai-eng` |
| `specialismTitle` | string | Display name, e.g. `Full Stack Development` |
| `topSkills` | string[5] | Exactly 5 skills selected during onboarding |
| `summary` | string | AI-generated PII-free bio (max 400 chars) |
| `cvImageURL` | string? | Firebase Storage URL of sanitised CV PNG |
| `location` | string | Region code: `MY`, `SG`, `AU`, `VN`, `ID`, `TH`, `OTHER` |
| `linkedInPositions` | array? | Raw work history used for bio generation (server-side only) |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

**Security:** Users can only read and write their own document. The `email`, `phone`, `emailAddress`, and `phoneNumber` fields are blocked at the rule level — they can never be stored.

---

### `/jobs/{jobId}`

All job listings — both manually entered and ATS-imported.

| Field | Type | Description |
|---|---|---|
| `title` | string | Job title |
| `company` | string | Company name |
| `location` | string | City, e.g. `Kuala Lumpur` |
| `locationFull` | string | Full location, e.g. `Kuala Lumpur, Malaysia` |
| `region` | string | `MY`, `SG`, `AU`, `VN`, `ID`, `TH`, `US`, `London`, `EU`, `Remote` |
| `type` | string | `AI / ML`, `Engineering`, `Data`, `Product`, `Design`, `Management` |
| `seniority` | string | `Junior`, `Mid`, `Senior`, `Lead`, `Principal`, `Director` |
| `salary` | string | Display string, e.g. `MYR 12,000–18,000/mo` |
| `salaryNote` | string | Currency/period note |
| `salaryMin` | number? | Minimum salary value (no currency) |
| `salaryMax` | number? | Maximum salary value |
| `salaryCurrency` | string? | ISO 4217: `MYR`, `SGD`, `AUD`, `USD`, `GBP` |
| `stack` | string[] | Technologies, max 10 |
| `description` | string | Cleaned description, max 600 chars |
| `color` | string | Hex colour matching job type |
| `badge` | string? | e.g. `Hot`, `New` |
| `isActive` | boolean | `false` when removed from ATS |
| `atsConnectionId` | string? | Links to `/ats_connections` |
| `atsJobId` | string? | External ID in the ATS |
| `atsSource` | string? | `greenhouse`, `lever`, `workday`, etc. |
| `externalUrl` | string? | Direct link to apply on ATS |
| `posted` | string | Human-readable, e.g. `3 days ago` |
| `postedAt` | timestamp | Machine-readable post date |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

**Security:** Read by any authenticated user. Write by Admin SDK only (ATS sync + manual entry scripts).

---

### `/swipes/{uid}/decisions/{jobId}`

One document per user per job. Records the swipe direction and AI score at time of decision.

| Field | Type | Description |
|---|---|---|
| `jobId` | string | Matches the document ID |
| `direction` | string | `right` or `left` |
| `matchScore` | int | 0–100 — Claude score at time of swipe |
| `matchReason` | string | 1-sentence explanation |
| `decidedAt` | timestamp | |

**Security:** Users can only read/write their own swipe decisions. Documents are immutable once created.

---

### `/matches/{matchId}`

Created when a candidate swipes right on a job. Unlocks the chat thread.

| Field | Type | Description |
|---|---|---|
| `candidateId` | string | Firebase UID |
| `jobId` | string | |
| `company` | string | Denormalised for display |
| `jobTitle` | string | Denormalised for display |
| `matchScore` | int | Score at time of match |
| `hasUnreadMessages` | boolean | Drives notification badge |
| `unlockedAt` | timestamp | |

**Security:** Readable by the candidate named in `candidateId`. Candidates can only update `hasUnreadMessages`. Creation/deletion by Admin SDK only.

---

### `/messages/{matchId}/thread/{msgId}`

Real-time message thread per match.

| Field | Type | Description |
|---|---|---|
| `matchId` | string | Parent match |
| `senderId` | string | Firebase UID of sender |
| `text` | string | Message body, max 2000 chars |
| `sentAt` | timestamp | |
| `isRead` | boolean | |

**Security:** Readable/writable only by the candidate on the parent match. `senderId` must equal `auth.uid`. Messages are immutable once sent.

---

### `/ats_connections/{connectionId}`

One document per connected ATS integration.

| Field | Type | Description |
|---|---|---|
| `clientId` | string | Firebase UID of the client company |
| `companyName` | string | Display name |
| `atsType` | string | `greenhouse`, `lever`, `workday`, etc. |
| `identifier` | string | Board token, slug, or URL |
| `apiKeyHash` | string? | SHA-256 hash of API key (never plaintext) |
| `webhookSecret` | string | HMAC secret for webhook verification |
| `status` | string | `active`, `error`, `warning`, `paused` |
| `lastSyncAt` | timestamp? | |
| `jobCount` | int | Number of active jobs from this connection |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

**Security:** Readable by the owning client (`clientId == auth.uid`). All writes via Admin SDK only.

---

### `/ats_sync_logs/{logId}`

Audit trail for every ATS sync run.

| Field | Type | Description |
|---|---|---|
| `connectionId` | string | |
| `syncType` | string | `manual`, `scheduled`, `webhook` |
| `status` | string | `running`, `completed`, `failed` |
| `jobsFound` | int | |
| `jobsCreated` | int | |
| `jobsUpdated` | int | |
| `jobsDeactivated` | int | |
| `errors` | string[] | Per-job error messages |
| `startedAt` | timestamp | |
| `completedAt` | timestamp? | |

**Security:** Readable by the client who owns the connection. Admin SDK writes only.

---

## Indexes

Composite indexes defined in `firestore/firestore.indexes.json`:

| Collection | Fields | Used for |
|---|---|---|
| `jobs` | `region` + `postedAt DESC` | APAC feed queries |
| `jobs` | `type` + `postedAt DESC` | Type-filtered feed |
| `jobs` | `region` + `type` + `postedAt DESC` | Combined filter |
| `jobs` | `atsConnectionId` + `isActive` | ATS deactivation detection |
| `jobs` | `atsConnectionId` + `isActive` + `postedAt DESC` | ATS job listing |
| `jobs` | `seniority` + `region` + `postedAt DESC` | Seniority filter (future) |
| `matches` | `candidateId` + `unlockedAt DESC` | Matches screen |
| `thread` | `matchId` + `sentAt ASC` | Chat history |
| `decisions` | `direction` + `decidedAt DESC` | Swipe analytics (future) |
| `ats_connections` | `clientId` + `createdAt DESC` | Client connection list |
| `ats_sync_logs` | `connectionId` + `startedAt DESC` | Sync log view |
