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