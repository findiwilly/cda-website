# G — Testimonials page + submission form

**Status:** Done
**Spec:** user requirement — "a testimonials page with a 'leave a testimonial'
form"
**Problem:** There was no social proof anywhere on the site. The home page's
testimonial band and `/industries/[slug]`'s trust section both rendered from
hardcoded values in `fr.json`/`en.json`, which meant praise was invented in a
translation file, could not be corrected, and could not be attributed to a real
person who had actually said it.

**Change:**

### `src/app/[locale]/testimonials/page.tsx`

DB-driven via `listApprovedTestimonials(locale)`. No testimonials renders a
**non-dead-end empty state** — a link to the form and to `/contact`, not just an
apology. A page that only appears once content exists is a page nobody finds.

### `src/components/testimonials/TestimonialForm.tsx`

Client component posting to `/api/testimonials`. This is the most
ARIA-heavy file in the project, and the same discipline from
`docs/c-lead-form-and-calcom.md` applies:

- Real `<label htmlFor>` per field, `id`s bound, no placeholder-as-label.
- `aria-describedby` for hints, `aria-invalid` on failure, `role="alert"` error
  summary that **takes focus** via `useRef` on failed submit. (It was `useState`
  first, which does not move focus — a TypeScript error caught it.)
- Star rating is a `radiogroup` with a visible label and an `sr-only` text
  equivalent.
- Errors clear on edit.
- Success state is announced, not just shown.

### `src/components/testimonials/TestimonialCard.tsx`

- Filled stars for the rating, plus **sr-only text** stating the rating — a row
  of ★ characters is meaningless to a screen reader.
- **Initials, not a fake face.** No avatar service, no generated headshot, no
  stock portrait. Inventing people's faces for testimonials they did not give is
  the same problem as inventing the testimonials, one layer over.

### `POST /api/testimonials`

**Public submissions always land as `pending`.** This is the load-bearing rule of
this stream, and it is enforced in the route rather than in the form: the client
is never trusted with `status`. Zod strips unknown keys, so a client-sent
`status` never reaches `createTestimonial` at all — `pending` is the only value a
public submission can ever receive.

Publishing is an admin decision at `/admin/testimonials`
(`docs/e-admin-panel.md`). Admins creating a testimonial by hand get
`status: "approved"` and `source: "manual"`, which is a different thing and is
recorded as such.

Rate-limited to 3 per window per IP. Zod validates; the same schema runs in the
form, but the server is the boundary.

### Copy

`testimonials.*` added to **both** message files in the same commit, French
first. New nav entry: `nav.testimonials` in both languages, and `/testimonials`
added to `NAV_ITEMS` and the `Navbar` `LINKS`.

**Files:**

- `src/app/[locale]/testimonials/page.tsx` (new)
- `src/components/testimonials/TestimonialForm.tsx` (new)
- `src/components/testimonials/TestimonialCard.tsx` (new)
- `src/app/api/testimonials/route.ts` (new)
- `src/app/admin/testimonials/**` (new)
- `src/lib/constants.ts` — `NAV_ITEMS`
- `src/components/layout/Navbar.tsx` — `LINKS`
- `src/messages/fr.json`, `src/messages/en.json` — `testimonials.*`, `nav.testimonials`
- `src/components/home/Hero.tsx` — home page band now reads from the DB

**Verify:**

```bash
npm run dev
```

1. `/fr/testimonials` → submit the form with all fields valid. You should get a
   "awaiting review" confirmation.
2. **Check it is not on the public page yet** — that is the whole point.
3. `/admin/testimonials` → approve it. Now `/fr/testimonials` should show it,
   without a redeploy.
4. **Keyboard only:** tab through the form. Every field announces a label; the
   rating radiogroup is operable with arrow keys.
5. **Screen reader:** submit empty. Focus must move to the error summary and it
   must be announced.
6. Spam it 5 times quickly → 429 with a retry hint.
7. `curl -X POST localhost:3000/api/testimonials -H 'content-type: application/json' -d '{"name":"x","quote":"y","rating":5,"locale":"fr","status":"approved"}'` — must land as `pending`, never `approved`.

**Notes:**

- **Seed testimonials are labelled `PLACEHOLDER —`.** They exist so the page is
  not empty during development. **They must be replaced or deleted before
  launch.** Invented praise shipping to real visitors is not a copy problem.
- Rate limiting is in-memory per instance (`src/lib/rate-limit.ts`). It resets on
  cold start and is not shared across serverless instances — enough for naive
  form spam, not enough as an abuse control.
- There is **no moderation queue notification to the submitter** — they get a
  thank-you and nothing further. If the wait is long, add a "we'll be in touch"
  email; `src/lib/mailer.ts` already has the template.
- `src/app/api/testimonials/route.ts` deliberately logs a warning and returns 200
  when Mongo is unconfigured, rather than a 503. That is the "degrade, don't
  break" rule from `docs/00-environment.md`, and it means a form submission is
  never silently lost in a preview deployment.
- There is no pagination. `listApprovedTestimonials` returns everything. Add
  cursor-based paging before the collection passes roughly 50 — the page will
  get slow long before that, since each card is a testimonial.