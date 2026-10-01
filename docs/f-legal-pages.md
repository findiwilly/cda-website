# F — Legal pages

**Status:** Done
**Spec:** user requirement — "legal pages: policy, terms, cookies, plus others
that apply"
**Problem:** The footer linked to a legal page that did not exist. `/fr/legal`
404'd. A French-facing business collecting email addresses, phone numbers and
WhatsApp conversations with no privacy policy is a real problem, not a formality
— under GDPR for any EU visitor and under Cameroon's Law No. 2020/014 on
cyber-security and data protection for anyone in Cameroon.

**Change:**

`src/app/[locale]/legal/[slug]/page.tsx` renders three documents, fully
bilingual:

| Slug | Document |
| --- | --- |
| `/legal/privacy` | Politique de confidentialité / Privacy policy |
| `/legal/terms` | Conditions générales / Terms of service |
| `/legal/cookies` | Politique cookies / Cookie policy |

**Why these three.** They are the minimum set that covers what the site actually
does. Nothing else was invented:

- **Privacy** is needed because `/api/leads` and `/api/testimonials` both write
  personal data to MongoDB — name, email, phone number, WhatsApp, free-text
  message, and whatever a testimonial submitter types. It declares the data
  collected, the legal basis, retention, the processors involved (MongoDB,
  Cloudinary, an SMTP provider), and the rights.
- **Terms** are needed because the site sells services and takes bookings.
- **Cookies** is needed because an analytics or tracking tag will eventually be
  added, and French law requires prior consent for non-essential cookies. The
  page documents that position *and states that no non-essential cookie is
  currently set* — which is true today, and is the honest thing to say.

**Deliberately not added:** an imprint (`mentions légales`) page. French law
requires one for any commercial site, and it is genuinely needed — but the
required content (SIRET/SIREN, RCS, registered address, hosting provider) is
business registration data that has to come from the owner. Shipping a template
with placeholder registration numbers would be worse than not shipping it, so it
is flagged as a follow-up rather than filled in with fiction.

**Structure.** `src/lib/legal.ts` holds the registry:

- `LEGAL_SLUGS` and the `LegalSlug` type,
- `isLegalSlug()` for the runtime guard in `generateMetadata`,
- the `LegalSection` shape: `{ heading, paragraphs, bullets? }`.

**The registry lives outside the page module on purpose.** Next.js requires page
files to export only a known set of names, so declaring `LEGAL_SLUGS` in
`page.tsx` fails the type check with an error that does not mention exports.

An unknown slug calls `notFound()` and returns a 404 — not a 200 with blank
content, which is what a lookup-failure-by-default implementation gives you.

**Files:**

- `src/app/[locale]/legal/[slug]/page.tsx` (new)
- `src/lib/legal.ts` (new)
- `src/messages/fr.json`, `src/messages/en.json` — `legal.*`
- `src/components/layout/Footer.tsx` — links

**Verify:**

```bash
npm run dev
```

1. `/fr/legal/privacy`, `/fr/legal/terms`, `/fr/legal/cookies` — and the `/en`
   equivalents. Each should render in the correct language.
2. `/fr/legal/nonexistent` → 404.
3. Every legal link in the footer, in both languages.
4. Check the footer on mobile — the legal links must not push the primary nav
   off screen.
5. Read the copy once for accuracy against what the site actually does. **It is
   a starting draft, not legal advice.**

**Notes:**

- **This needs a real lawyer before launch.** It was written to be accurate
  about the site's behaviour and to cover the obvious obligations, but no
  automated drafting substitutes for review by someone qualified in Cameroon and
  France. Budget for that.
- **The imprint page is the outstanding gap.** It needs the company's registered
  name, address, SIRET/SIREN, RCS number, and hosting provider. Add it to
  `LEGAL_SLUGS` in `src/lib/legal.ts` and to `legal.*` in both message files.
- **`Cookie` copy must be revisited the moment analytics is added.** Right now it
  says no non-essential cookies are set, which is true. Adding a tag without
  updating the page — and without a consent banner — is a compliance failure, not
  a bug.
- Legal pages are server-rendered and statically generated like every other
  route, so they carry canonical URLs, hreflang and sitemap entries from
  `docs/b-seo-foundation.md` automatically.
- **Not linked from the sitemap?** They are, via `STATIC_PATHS`. The sitemap
  contains only the French and English canonical paths for each, so there is no
  duplicate-content problem.