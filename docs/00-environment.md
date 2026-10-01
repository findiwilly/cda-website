# Environment & credentials

**Status:** Done
**Spec:** `CLAUDE.md` — "The site must build without secrets", "MongoDB for the
database, Cloudinary for image storage, SMTP for notifications"
**Problem:** The project had no `.env.example` and no documented list of
variables. Every module read `process.env` directly at the point of use, which
meant a missing variable surfaced as an undefined-property crash deep inside a
render — usually on Vercel, usually at the worst moment.

**Change:**

1. **`src/lib/env.ts` (new)** — the only place `process.env` is read. It exports
   the parsed values plus three capability booleans, `hasMongo`, `hasCloudinary`
   and `hasSmtp`, computed by a `present()` helper that rejects blank strings as
   well as `undefined` (a whitespace-only env var in a Vercel UI field is
   otherwise "set" and fails much later, in the driver).

   Three rules are enforced by the module rather than left to discipline:

   - **Nothing throws at import time.** A production build with no credentials
     must succeed.
   - **`siteUrl()` never returns empty.** It falls back through
     `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` →
     `http://localhost:3000`, because canonical URLs, the sitemap and
     schema.org `image` all need an absolute origin and a missing one produces
     silently invalid metadata rather than an error.
   - **`requireEnv()` throws only at the point of use**, and the message names
     the missing variables and points here.

2. **`.env.example` (new)** — every variable with a comment explaining what it
   controls, what breaks without it, and how to generate it. `SESSION_SECRET`
   ships with a one-liner using `crypto.randomBytes`.

3. **Graceful degradation is now the design rule, not a fallback.** Each
   unconfigured feature has one defined behaviour:

   | Missing | Behaviour |
   | --- | --- |
   | `MONGODB_URI` | Reads return `[]` / `null`. `/blog`, `/testimonials` and `/faq` render their empty states. Admin writes return `503 notConfigured`. |
   | `SESSION_SECRET` | Admin pages redirect to login; `/api/admin/session` returns 503. Short secrets are rejected below 32 characters. |
   | `CLOUDINARY_*` | `/api/admin/upload/signature` returns 503. The editor's upload button is disabled with an explanation. Everything else works. |
   | `SMTP_*` | Notifications are `console.info`'d instead of sent, so they are visible in Vercel logs. |

   This is what lets CI run a real production build with only
   `NEXT_PUBLIC_SITE_URL` set, and therefore lets a pull request from a fork
   exercise the same code path as production.

**Files:**

- `src/lib/env.ts` (new)
- `.env.example` (new)

**Verify:**

```bash
cp .env.example .env.local     # leave everything blank
npm run build                  # must exit 0
npm run dev
```

Then check `http://localhost:3000/fr/blog` renders its empty state rather than a
500, and `/admin/login` renders.

**Notes:**

- **Passwords are never read from `process.argv`** and never logged. `npm run
  seed` takes `ADMIN_PASSWORD` from the environment for that reason — shell
  history and process listings both leak argv.
- `tsconfig.json` was set to `"target": "ES2017"` during this work. The default
  `ES5` target failed to compile `[...new Set(...)]` in `content.ts`, which is
  used for FAQ category derivation.
- `.gitignore` already covered `.env*.local`; `.env.example` is not matched by
  that pattern and is therefore committed, as intended.
- Vercel environment variables go in Project Settings → Environment Variables,
  scoped to Production and Preview as appropriate. Do not set `ADMIN_PASSWORD`
  in Vercel — it is a seed-time-only secret and has no reader in the app.

---

## Live configuration

Added in [J](j-content-and-credentials.md). `.env.local` now holds real values
and is gitignored, so it cannot reach the repo. `.env.example` stays blanks-only.

```bash
npm run env:check
```

`scripts/check-credentials.mjs` is the diagnostic. It is read-only: it pings
Mongo, pings Cloudinary, and completes an SMTP handshake without sending mail.
Output looks like:

```
mongodb    OK   db="cda"
           admins: 0  <- seed required
cloudinary OK   cloud="<your-cloud-name>"
smtp       OK   smtp.gmail.com:587 as <your-address@gmail.com>
session    OK   64 chars
```

**What each probe deliberately does not do:**

- **Cloudinary uses `api.ping()`, not `api.usage()`.** The usage API is
  restricted on free plans and rejects with an error object carrying no
  `.message`, so the failure prints as `cloudinary FAIL undefined` and reads
  exactly like wrong credentials. It cost an hour.
- **SMTP uses `transporter.verify()`,** which completes the handshake and
  authenticates, then throws the session away. No mail is sent to anyone.

### Gmail and app passwords

Google will not accept the account password over SMTP. It requires an **App
Password**: Google Account → Security → 2-Step Verification → App passwords.
It is a 16-character code, *displayed* with spaces in `4-4-4-4` groups.

Two traps:

- **Quote the value in the env file.** Unquoted, the value is truncated at the
  first space, leaving `jvqt`, and Google answers with a generic
  `535 Username and Password not accepted`. Every hand-rolled `.env` reader in
  this repo (`scripts/seed.ts`, `scripts/check-credentials.mjs`) strips
  surrounding quotes for this reason.
- **A `535` is ambiguous.** Wrong password, revoked app password, and 2FA having
  been changed since the password was created all produce the same message.
  Google also shows the password with spaces while some SMTP clients need it
  concatenated. `npm run env:check` tries spaced and unspaced on 587 and 465, so
  the spacing question is settled for you — but a genuine rejection needs a new
  app password.

**Current state: rejected.** All four combinations return
`535-5.7.8 Username and Password not accepted`. The value is correctly shaped,
so it is not a truncation problem. Regenerate it.

Sending `SMTP_FROM` from `@gmail.com` is required unless
`@cameroondigitalagency.com` has been verified in the Gmail account. Sending as
an unverified domain fails DMARC and lands in spam.

### Credential hygiene

The MongoDB password and the Cloudinary API secret were pasted into a chat in
plaintext while setting this up. `.env.local` is gitignored, but the values are
in that conversation's history. **Rotate both before production** — reset the
Atlas database user's password in Database Access, and regenerate the Cloudinary
API secret under Settings → API Keys. Account names, cluster host and cloud name
are deliberately not written down here; find them in the provider consoles.

Note that Cloudinary's API *key* is the less sensitive half. It identifies the
account and appears in delivery URLs. The API *secret* is the one that signs
uploads and must never be committed.

No admin account exists yet: the seed was run with `ADMIN_EMAIL` blank so it could
not create one using the password that was in the chat. See
[J](j-content-and-credentials.md).