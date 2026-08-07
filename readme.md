# MessMate — Smart Campus Dining Companion

MessMate is a production-grade, full-stack hostel mess management platform built for NIT Kurukshetra. It gives **students** a transparent way to track menus, purchases and spending; gives **accountants** AI-assisted tools to manage menus and act on student feedback; and gives **admins** full control over hostel onboarding and lifecycle management — all secured with a hardened, defense-in-depth backend.

The system is composed of three independently deployed services:

| Service | Stack | Hosting |
|---|---|---|
| **Frontend** | React 18 + Vite 7 + Tailwind CSS v4 | Vercel |
| **Backend API** | Node.js + Express 5 + MongoDB | Render |
| **Email Worker** | Node.js + Express (standalone microservice) | Render |

---

## 🚀 Demos

| # | Demo | What to capture |
|---|---|---|
| 1 | `demo/auth-flow.gif` | Signup with NITKKR email → email OTP verification → password login → OTP-based login → forgot password (send OTP → verify → reset) |
| 2 | `demo/student-menu-and-rating.gif` | Student home: today's menu, switching days/meals, rating a diet item and an extra item with stars, quick tags & suggestion |
| 3 | `demo/student-purchase-extra.gif` | Selecting date/meal, adding extras to cart, hitting the purchase-time gate, confirming purchase |
| 4 | `demo/student-spending-analytics.gif` | Range selector (7d/1m/1y/all + specific month), pie/bar/trend charts, daily/weekly/monthly grouping toggle |
| 5 | `demo/student-profile.gif` | Opening profile popup, changing hostel, changing password |
| 6 | `demo/accountant-today-menu.gif` | Updating today's menu per meal, adding/removing diet & extra items, one-click "quick price update" bolt action |
| 7 | `demo/accountant-weekly-menu-ai.gif` | Uploading a photo of the physical menu → image compression → Gemini AI extraction & autofill → manual edits → preview modal → publish |
| 8 | `demo/accountant-print-menu.gif` | Printing the full weekly menu (native browser print, print-only layout) |
| 9 | `demo/accountant-ai-review-analysis.gif` | Viewing AI-generated compliments/complaints/action-items tabs, forcing a fresh re-analysis |
| 10 | `demo/admin-hostel-onboarding.gif` | Admin dashboard search, adding a new hostel with auto-generated credentials, viewing the welcome email |
| 11 | `demo/admin-hostel-update-and-delete.gif` | Editing hostel details/regenerating credentials, then deleting a hostel via OTP confirmation |
| 12 | `demo/admin-student-management.gif` | Filtering students by hostel/course/batch/branch, batch-selecting and removing accounts via OTP |

---

## ✨ Features

### 🔐 Authentication
- **Role-based routing** — students, accountants, and admins are automatically routed to their own protected sections (`/student`, `/accountant`, `/admin`).
- **Dual login flows** — traditional password login *and* passwordless OTP login, switchable in the UI.
- **Signup restricted to official `@nitkkr.ac.in` emails**, followed by mandatory OTP email verification before account activation.
- **Forgot-password flow** — OTP-gated identity confirmation before allowing a password reset.
- **Change password** (logged-in) with automatic re-issuance of a fresh access token and a security-alert email.
- **Session persistence** across reloads via a silent `GET /me` check against the refresh cookie.

### 🎓 Student Portal
- **Menu viewer** — today's menu or any day of the week, with breakfast/lunch/dinner tabs.
- **Item rating system** — 1–5 star rating per diet/extra item, quick contextual tags (rating-dependent tag sets), and free-text improvement suggestions.
- **Extra purchases** — cart-based ordering with quantity steppers, meal-start time gating (can't log a purchase before serving begins), and a confirmation modal.
- **Spending analytics** — server-aggregated (MongoDB `$facet`) insights: total spend, average/day, meal-wise pie chart, item-wise bar chart, and a daily/weekly/monthly spending trend line, filterable by preset ranges or a specific month.
- **Profile management** — switch hostel, change password, view read-only account info.

### 🧑‍💼 Accountant Dashboard
- **Today's menu management** — per-meal editing of timings, diet items, and extras, plus a standalone "quick price update" for extras that doesn't require a full menu save.
- **Weekly menu management** — full 7-day × 3-meal editor with a review-before-publish preview modal.
- **AI menu extraction** — upload a photo of the physical mess menu; the image is client-side compressed, sent to **Gemini AI** with a structured JSON response schema, and auto-fills the entire weekly editor (translates regional names, fills sane time/price defaults, and never skips optional items).
- **Printable weekly menu** — dedicated print-only layout (hides app chrome, uses `@page`/print color-adjust rules) for physical posting.
- **AI review analysis** — Gemini aggregates the last 7 days of student ratings into: top complimented items, top complained items, items needing removal/replacement, and items needing better execution/management. Results are cached in MongoDB and can be force-refreshed on demand.

### 🛡️ Admin Panel
- **Hostel directory** with live search across name/ID/resident type.
- **Hostel onboarding** — creates the hostel record *and* its accountant account in one step, with auto-generatable secure Login ID/password, and sends a branded HTML welcome email with credentials.
- **Hostel editing** — update contact info and regenerate accountant credentials.
- **Cascading hostel deletion** — OTP-confirmed deletion that atomically removes the hostel's accountant, students, purchases, ratings, items, weekly/daily menus, cached review analysis, and all related Redis cache keys.
- **Student roster management** — filter by hostel, course, batch, admission type (normal/lateral), and branch (parsed from roll number), with OTP-gated batch account removal.

---

## 🏗️ Architecture & Engineering Highlights

### Backend design
- **DTO layer** — every route has a Zod *request* schema (validation) and a hand-written *response* DTO (shaping), keeping data leaks and silently-mismatched payloads impossible.
- **Cache-aside Redis layer** — a generic `cacheResponse` middleware wraps `res.json` transparently; writes call `invalidateKeys`/`invalidatePattern` to bust exact keys or whole prefixes (e.g. all `menu:*` for a hostel after a price change).
- **Daily-over-weekly menu merge** — a day's effective menu is the weekly template unless a `DailyMenu` override exists and is explicitly marked `updated`, letting accountants make one-off changes without touching the standing weekly menu.
- **Item catalog with soft-delete** — menu items are shared, upserted, and deactivated (`isActive`) rather than hard-deleted, preserving referential integrity for historical purchases/ratings.
- **MongoDB aggregation pipelines** (`$facet`) power the student analytics endpoint in a single round trip: totals, unique active days, meal-wise breakdown, top items (with an "Others" bucket), and a grouped trend series.
- **Async email pipeline** — mutating routes never block on SMTP; instead they call `queueEmail()`, which publishes a job to **Upstash QStash** with a caller-supplied `dedupeKey` (e.g. `hostel-creation-email-${email}`, `${email}-${otpCode}`, `password-change-email-${email}-${Date.now()}`). QStash invokes the standalone email-worker microservice over HTTPS with a signed, automatically-retried (3 retries) delivery.

### Idempotency & deduplication (two independent layers)
Because at-least-once delivery systems can redeliver a job, MessMate defends against duplicate emails at **both ends** of the pipeline:

1. **Publish-time deduplication (QStash-level)** — every `queueEmail()` call passes a semantically meaningful `deduplicationId` (the `dedupeKey`). If the *same logical job* is enqueued twice in quick succession (e.g. a user double-clicks "resend OTP"), QStash itself recognizes the duplicate `deduplicationId` and only queues it once — this prevents duplicate *sends before the job even starts*.
2. **Consumer-side idempotency lock (Redis-level, `utils/emailJobLock.js`)** — this protects against the more subtle failure mode where the worker *did* send the email successfully but the acknowledgement to QStash was lost (network blip, cold start timeout, etc.), causing QStash to legitimately retry the *same* `upstash-message-id`:
   - `acquireJob(jobId)` first checks a `email-job:done:{jobId}` Redis key. If present → the job already fully completed → respond `200 OK` immediately without resending anything.
   - Otherwise it attempts an atomic `SET NX EX 300` lock (`email-job:lock:{jobId}`). If another worker instance is *currently* processing the same job → it backs off and returns `200 OK` without re-sending (avoids a race where two concurrent workers both grab the same retry).
   - Only a request that acquires a fresh lock actually proceeds to call the Gmail API.
   - On success, `completeJob(jobId)` deletes the processing lock and writes a `done` marker with a 24-hour TTL, so any late/duplicate retries within that window are short-circuited at step one.
   - On failure, `releaseJob(jobId)` clears the lock so a *legitimate* QStash retry can try again — the job is allowed to fail and retry, but never allowed to double-send.

Together this guarantees **exactly-once effective delivery** even though the transport (QStash → worker → Gmail) only guarantees at-least-once.

### Email worker microservice — delivery implementation
- **Request authentication** — every incoming job carries an `upstash-signature` header and an `upstash-message-id`. The route is mounted with `express.raw()` (not `express.json()`) so the **exact raw request body** is available for signature verification, since QStash signs the literal bytes it sent. `@upstash/qstash`'s `Receiver` verifies the signature against both the *current* and *next* signing keys (`QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY`) to support zero-downtime key rotation. Requests with a missing/invalid signature are rejected with `401` before any business logic runs.
- **Gmail OAuth2 token management (`utils/gmailAuth.js`)** — rather than storing a long-lived password/app-password, the worker holds a Google OAuth2 **refresh token** and exchanges it for short-lived access tokens on demand:
  - **L1 cache**: an in-memory `cachedToken`/`tokenExpiresAt` pair, valid for the life of the warm serverless instance (fastest path, no network call).
  - **L2 cache**: on an L1 miss, checks a shared `gmail:accessToken` key in **Upstash Redis**, so *other* concurrently-running instances that already refreshed the token don't need to refresh it again.
  - **Refresh de-duplication**: if both caches miss, a `refreshPromise` singleton ensures that if multiple requests hit a cold instance simultaneously, only *one* actual `POST https://oauth2.googleapis.com/token` refresh call is made — all concurrent callers await the same in-flight promise instead of racing separate refreshes.
  - The new token is written back to Redis with an `ex` TTL matching Google's `expires_in`, refreshed with a 60-second safety margin before actual expiry.
- **Sending the email (`utils/sendEmail.js`)** — MessMate talks to the **Gmail REST API directly via `fetch`** (migrated off the heavier `googleapis` SDK):
  1. Builds a raw RFC 2822 MIME message by hand: `From`, `To`, `Content-Type: text/html; charset=utf-8`, `MIME-Version: 1.0`, and a `Subject` header explicitly MIME-encoded as UTF-8 base64 (`=?utf-8?B?...?=`) to safely support non-ASCII subjects.
  2. Base64-encodes the full message and converts it to Gmail's required **base64url** format (`+`→`-`, `/`→`_`, strips trailing `=` padding).
  3. `POST`s the encoded `raw` payload to `https://gmail.googleapis.com/gmail/v1/users/me/messages/send` with the OAuth2 access token as a Bearer credential.
  4. Non-OK Gmail responses throw with the API's own error message, which propagates back up through `sendEmailJob` → triggers `releaseJob` → lets QStash's built-in retry policy handle transient failures.

### Security (defense in depth)
- **JWT access + refresh rotation** — short-lived (15 min) Bearer access tokens kept in memory only (never localStorage); 7-day refresh tokens in an `httpOnly`, `secure`, `sameSite` cookie, with the *active* refresh token mirrored in Redis so a single compromised/rotated token can be invalidated server-side.
- **Silent token refresh** — a shared Axios interceptor auto-refreshes on `401`, queues concurrent requests during an in-flight refresh, and uses a `rawApi` instance with **no interceptors** to guarantee the refresh call itself can never recursively trigger another refresh.
- **CSRF protection** (`csrf-csrf`, double-submit pattern) scoped only to the handful of routes that run *before* a Bearer token exists (login, signup, OTP login, refresh), using a stable anonymous `csrfSid` cookie for otherwise-stateless JWT sessions, with automatic client-side self-healing on a stale/missing token.
- **Tiered rate limiting** — eight independently-tuned Upstash sliding-window limiters (global, credential-guessing, OTP/email sending, public reads, authenticated reads, writes, AI-heavy routes, admin writes), keyed by IP, email, or user ID depending on sensitivity.
- **NoSQL injection defense** — `@exortek/express-mongo-sanitize` on body/query plus a dedicated `paramSanitizeHandler` for route params (Express 5's read-only `req.query`/`req.params` required custom handling).
- **XSS mitigations** — a build-time script injects a strict `Content-Security-Policy` into `vercel.json` at deploy time; all interpolated email HTML and AI-generated text run through `escapeHtml`/`escapeHtmlDeep` before rendering.
- **OTP hardening** — TTL-expiring OTP documents (auto-deleted after 5 minutes via a MongoDB TTL index), a max-attempts counter that forces a fresh OTP after repeated failures, and per-email rate limiting on OTP dispatch.
- **Destructive-action confirmation** — hostel deletion and batch student removal both require a freshly-issued OTP sent to the admin's email before executing, on top of normal auth/role checks.
- **Zod validation, front and back** — a "loophole philosophy": the frontend enforces strict UX-friendly rules, while backend Zod schemas act as the permissive-but-non-negotiable safety net regardless of what the client sends.
- **Standard hardening** — Helmet security headers, strict CORS allow-list, bcrypt password hashing, and centralized error handling that maps known Mongoose/CSRF/JWT/body-parser errors to safe client-facing messages without leaking internals.

### Frontend architecture
- **Context-per-domain state management** (`AuthContext`, `StudentContext`, `AccountantContext`, `AdminContext`) with in-memory caching to avoid redundant network calls.
- **Dual Axios clients** — a credentialed `api` instance for cookie-based auth routes and a Bearer-only `apiWithoutCred` instance for everything else, both sharing the same refresh/CSRF interceptor logic.
- **Role-gated routing** with lazy-loaded route chunks (`React.lazy` + `Suspense`) and dedicated `ProtectedRoute` / `StudentRoute` / `AccountantRoute` / `AdminRoute` guards.
- **Reusable Zod-to-form-error bridge** (`validateWithZod`) used uniformly across every form in the app.
- Skeleton loaders, animated transitions, and a fully responsive, mobile-first Tailwind v4 design system throughout.

---

## 🛠️ Technology Stack

**Frontend:** React 18, Vite 7, React Router v6, Tailwind CSS v4, Zod v4, Axios, Recharts, react-hot-toast, Lottie, browser-image-compression

**Backend:** Node.js, Express 5, MongoDB + Mongoose, JWT, bcrypt, Zod v4, csrf-csrf, Helmet, `@exortek/express-mongo-sanitize`, Multer, Morgan

**Infrastructure / Platform:** Upstash Redis (caching, sessions, rate limiting, job locks), Upstash QStash (async job queue + signed webhooks), Google Gemini AI (`@google/genai`) for menu OCR-extraction and review sentiment analysis, Gmail API (OAuth2, REST)

**Email Worker:** Node.js, Express, `@upstash/qstash` (Receiver), `@upstash/redis`

---

## ⚙️ Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A MongoDB instance (local or Atlas)
- An [Upstash Redis](https://upstash.com/) database
- An [Upstash QStash](https://upstash.com/) account (for async email delivery)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A Google Cloud OAuth2 client with Gmail API access (client ID/secret + refresh token) for the email worker

### 1. Clone the repository
```bash
git clone https://github.com/mukeshkumar99422/messmate
cd messmate
```

### 2. Backend setup
```bash
cd server
npm install
```
Create a `.env` file in `server/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
CSRF_SECRET=your_csrf_secret

UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

QSTASH_TOKEN=your_qstash_token
EMAIL_WORKER_URL=http://localhost:5001

GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

### 3. Email worker setup
```bash
cd email-worker
npm install
```
Create a `.env` file in `email-worker/`:
```env
PORT=5001
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

QSTASH_CURRENT_SIGNING_KEY=your_qstash_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_qstash_next_signing_key

GMAIL_CLIENT_ID=your_gmail_oauth_client_id
GMAIL_CLIENT_SECRET=your_gmail_oauth_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_oauth_refresh_token
EMAIL_USER=your_sending_email@gmail.com
```

### 4. Frontend setup
```bash
cd client
npm install
```
Create a `.env` file in `client/`:
```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_CLIENT_URL=http://localhost:5173
VITE_GITHUB_REPO_URL=https://github.com/your-username/messmate
VITE_LINKEDIN_PROFILE_URL=https://www.linkedin.com/in/your-profile
VITE_EMAIL=your-contact-email@gmail.com
```

### 5. Run all three services
```bash
# Terminal 1
cd server && npm run server

# Terminal 2
cd email-worker && npm run server

# Terminal 3
cd client && npm run dev
```

### 6. Admin initialization
The Admin role bypasses standard signup. Seed the first admin user by executing creatAdmin.js script(enter your custom id and password), then log in at `http://localhost:5173/login`.

---

*Developed by Mukesh Kumar*