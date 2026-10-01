# E — Admin panel: auth, blog, testimonials, FAQs

**Status:** Done
**Spec:** `CLAUDE.md` — "an admin can post blog posts and manage
reviews/testimonials"
**Problem:** There was no way to change anything on the site. Every piece of
content lived in `src/messages/*.json` and required a developer, a branch, a
review and a deploy. The blog had an index page with hardcoded sample posts and
no article page at all.

**Change:**

### Authentication — `src/lib/auth.ts`, `src/lib/admin-guard.ts`

Session-based, hand-rolled on `jose` + `bcryptjs`. No NextAuth: there is exactly
one privileged role, so a full identity provider would be dependency surface with
nothing to configure.

- Password hash is `bcrypt` cost 12, stored in the `admins` collection.
- Session is an **HS256 JWT** in an **httpOnly, `sameSite=lax`, `secure`-in-
  production** cookie, 8-hour TTL. `sameSite=lax` is the CSRF mitigation: the
  cookie is not sent on cross-site POSTs, which is exactly the vector a Server
  Action sits behind.
- `secure` is conditional so the same code runs on `http://localhost`.
- **Verification is deliberately cheap**: signature check plus one indexed lookup
  by `ObjectId`. No bcrypt on the request path — that would make every admin
  page render pay for a password hash.
- `authenticate()` compares against a **dummy hash** when the account does not
  exist, so a wrong email and a wrong password take the same time and the login
  form does not leak which addresses are real.
- `getAdminUser()` re-reads the admin document on every check, so a deleted or
  revoked account cannot keep browsing on a still-valid token. `readSessionToken`
  alone would accept it for the full 8 hours.
- Two guard shapes in `admin-guard.ts`, because the callers fail differently:
  pages **redirect** to login; route handlers throw `AuthError` and map to **401**,
  since a redirect is meaningless to a `fetch()` caller.

### Content layer — `src/lib/content.ts`, `src/lib/content-schema.ts`

- **Native `mongodb` driver + Zod**, no ODM. The document shapes are small and
  the driver is the only thing that has to work without credentials anyway.
- Every read is wrapped in `unstable_cache` **with a tag**; every write calls
  `revalidateTag` for that tag. Admin edits propagate without a redeploy while
  the public pages keep serving cached HTML — the site's mobile bandwidth budget
  depends on pages not re-rendering per request.
- Tag invalidation clears cached *data*; `revalidatePath` clears cached *HTML*.
  Both are needed. A post whose slug changed would otherwise keep serving the old
  URL's cached page, so `updatePost` revalidates the previous slug too.
- **Every function tolerates an absent database** and returns an empty result
  rather than throwing. That is what lets `npm run build` succeed with no
  credentials.
- Indexes are created once per process and guarded by a `globalThis` promise, so
  a request does not wait on `createIndexes`. The unique index on `posts.slug` is
  what makes a double-submitted admin form safe.

### Mutations — `src/app/admin/actions.ts`

Server Actions, not API routes. Each action returns an `ActionResult`
(`{ ok, error?, fieldErrors? }`) instead of throwing, so forms render validation
messages inline rather than dumping the user on an error page.

**Every action re-checks the session.** A Server Action is a public HTTP endpoint
that can be invoked by id without ever visiting the page, so `assertAuth()` is
the real security boundary. Hiding admin links in the UI is convenience.

Cover images go browser → Cloudinary directly via a signed upload, so only
`publicId`, `url`, `width` and `height` reach the action. Photo payloads would
otherwise hit Server Action body-size limits.

### Image upload — `src/lib/cloudinary.ts`, `/api/admin/upload/signature`

`createUploadSignature()` signs `{ timestamp, folder, transformation }` and the
browser POSTs straight to the CDN. Uploads are transformed on the way in
(`w_2000,c_limit,q_auto,f_auto,dpr_auto`) so a 6 MB phone photo cannot become a
6 MB page weight on a 3G connection. `publicId` is stored *alongside* `url`
rather than instead of it, so a render can build a new delivery URL at a
different width without re-uploading.

### Pages

`/admin` dashboard, `/admin/login`, `/admin/posts`, `/admin/posts/new`,
`/admin/posts/[id]`, `/admin/testimonials`, `/admin/faqs`, plus `AdminNav`,
`DeleteButton`, `PostEditor`, `TestimonialRow`, `TestimonialCreate`, `FaqRow`,
`FaqFields`, `FaqForm`.

**All admin pages are `force-dynamic`** and use the existing design system
(`SectionHeader`, `Reveal`/`Stagger`, the `ink`/`cdagreen` palette, motion tokens
from `src/lib/motion-tokens.ts`). No new styling vocabulary, including here.

### Seed — `scripts/seed.ts`

`npm run seed`, run with `node --experimental-strip-types`. Creates the first
admin, 14 FAQs (7 fr + 7 en), 3 testimonials and 2 demo posts.

It is **idempotent and additive**: safe to re-run, it reuses anything that
already exists and recreates the full index set.

**`scripts/seed.ts` cannot import from `src/lib/*`.** Those modules start with
`import "server-only"`, whose `index.js` throws outside a React Server
environment. The seed script therefore declares the document shapes locally and
uses the `mongodb` driver directly. That duplication is deliberate.

`ADMIN_PASSWORD` is read from the **environment, never `process.argv`**, and is
never logged. Shell history and process listings both leak argv.

**Files:**

- `src/lib/auth.ts` (new), `src/lib/admin-guard.ts` (new)
- `src/lib/content.ts` (new), `src/lib/content-schema.ts` (new)
- `src/lib/mongo.ts` (new), `src/lib/cloudinary.ts` (new), `src/lib/mailer.ts` (new)
- `src/lib/markdown.ts` (new), `src/lib/rate-limit.ts` (new), `src/lib/api.ts` (new)
- `src/app/admin/**` (new, 16 files)
- `src/app/api/admin/session/route.ts`, `whoami/route.ts`, `upload/signature/route.ts` (new)
- `scripts/seed.ts` (new)
- `.env.example`, `package.json`

**Verify:**

```bash
# Terminal 1
cp .env.example .env.local       # fill in MONGODB_URI + SESSION_SECRET (32+ chars)
npm run dev

# Terminal 2 — creates the first admin. Password is never echoed.
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run seed
```

1. `/admin/login` → sign in. `/admin` should show the dashboard.
2. `/admin/posts/new` → write a post, give it a cover image, publish it. Check
   `/fr/blog` — it should be there without a redeploy.
3. `/admin/testimonials` → approve the pending one from the public form (`/fr/testimonials`).
4. `/admin/faqs` → add a question. Check `/fr/faq` and the contact-page accordion.
5. **Security:** while signed in, `curl -i -X POST localhost:3000/admin/posts/new`
   with no cookie. Must be refused. Also try signing in with a wrong email and
   with a wrong password — the two should take about the same time.
6. Delete a post, then re-check the old URL returns 404, not a cached page.

**Notes:**

- **Rotate `SESSION_SECRET` and every admin is logged out.** That is the intended
  behaviour, and it is the only thing that invalidates outstanding tokens
  immediately. There is no server-side session revocation list.
- There is **no password reset flow** and **no second admin can be created from
  the UI**. Both are deliberate omissions: a reset flow needs an email round-trip
  and a token table, and creating a second admin is `npm run seed` with a
  different `ADMIN_EMAIL`. Add both when a second person needs access — and
  before that, add the audit trail to match.
- `src/app/admin/actions.ts` **may only export async functions.** Exporting a
  type is fine (erased at compile time); exporting a value breaks the build.
- Seed testimonials and demo posts are deliberately labelled
  `PLACEHOLDER — …` / "replace me". **Invented praise must not ship.**
- Known `marked` gotcha, if markdown rendering is touched: renderer methods
  require `this.parser`. A bare object literal passed as `renderer` throws
  `t.text is not a function`. It must be `new Renderer()` with only `heading`
  overridden.