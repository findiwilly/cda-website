# J — Real content, live credentials, and the bugs that surfaced

**Status** Done
**Spec** Seed real researched content rather than placeholders; wire the real
MongoDB, Cloudinary and SMTP credentials; push.

## Problem

Two requests and a pile of setup. Setting it up turned up five defects that
would all have shipped.

1. **The seed content was partly fabricated.** `scripts/seed.ts` asserted things
   about a real business that nobody had verified: that a brochure site "starts
   around 350 000 FCFA", that "more than half our clients are in Douala, Bertoua,
   Bamenda or abroad", a 30-day satisfaction guarantee, a 50/50 payment schedule.
   None of that came from the business. The testimonials were at least labelled
   `PLACEHOLDER —`, which made the rest of the file read as trustworthy. It was
   not.
2. **It contradicted the site's own copy.** `src/messages/*.json`
   `contact.faq.q4.a` says payment is *MTN Mobile Money, Orange Money or bank
   transfer, instalments possible*. The seeded FAQ said *50 % on signature,
   50 % on delivery*. A visitor reading the contact page and the FAQ page would
   have been told two different things. The English version also quoted euros
   (`€600`, `€430`, `€2,500`) where the French quoted FCFA, at an inconsistent
   rate — 350 000 FCFA is roughly €530, not €600.
3. **One seeded French answer contained an English fragment**: *"Facture
   Proforma disponible pour les entreprises needing a comptable."*
4. **`generateStaticParams` pre-rendered every slug under every locale.**
   `getPublishedPostSlugs()` projected `locale` and then threw it away, returning
   bare slugs, which the page then crossed with the locale list. `/fr/blog/<english-slug>`
   rendered `notFound()` — but as a **static file, so HTTP 200**. That is a soft
   404: a real URL, real indexable HTML, containing "not found". The first
   database-backed build did this for every post.
5. **Every seeded post began with `# `**, but `blog/[slug]/page.tsx` renders
   `<h1>{post.title}</h1>` itself, and `outlineOf()` only collects `#{2,3}`. So
   each post had two `h1`s and the first heading was missing from the table of
   contents.

Plus the environment: nothing was configured, and the diagnostics were themselves
broken — `cloudinary.api.usage()` is restricted on free plans and rejects with an
error object carrying no `.message`, which is indistinguishable from bad
credentials.

## Change

### Research

Web search returned nothing from this environment, but `webfetch` and DuckDuckGo's
HTML endpoint both worked. Three sources, all public and all dated:

| Source | Used for |
| --- | --- |
| DataReportal, *Digital 2025: Cameroon* (Kemp, March 2025) | population, connections, penetration, social media, speeds — figures as at January 2025 |
| honadi.com, *Combien coûte un site web au Cameroun ?* | price tiers, annual running costs, red flags |
| sinedev.com, *Création de site web au Cameroun : prix, agences et conseils 2025* | price tiers with timelines, mobile-money aggregator landscape |

The figures that ended up in the content, all January 2025: population 29.5 M;
25.5 M cellular connections (86.3 % of population); 12.4 M internet users
(41.9 % penetration); 17.1 M offline (58.1 %); 5.45 M social media identities
(18.5 % of population, 35.4 % of adults); 1.40 M LinkedIn; Instagram ad reach
2.0 % of population; median fixed download 9.48 Mbps; 83.6 % of connections
broadband-capable; median age 18. Price ranges: one-pager 70–120 k FCFA;
professional 4–7 pages 150–400 k; site with blog and SEO 300–750 k; store from
300 k (20–50 products, MTN MoMo) rising past 600–800 k with stock management and
up to 1.8 M for the largest projects; custom portal from 800 k. Annual: domain
8–20 k, hosting 30–80 k, maintenance 10–25 k/month. European agency for
comparable output 400 k–1.5 M.

### Content

`scripts/seed-content.ts` is new — the content as data, separate from the seeding
logic, with the editorial rules stated at the top of the file:

- **No invented claims about the business.** Market figures are stated with their
  value and date. Anything about CDA itself is either a definition (what an AI
  agent is) or a restatement of the site's own copy.
- **Commercial terms are owned by the messages files.** Pricing, timelines,
  payment methods and after-delivery terms are whatever `contact.faq` says.
  Editing one without the other now produces a visible contradiction, which is
  the point.

18 questions per locale across `Tarifs`, `Marché camerounais`, `Technique`,
`Organisation` — the price question leads, because price is what blocks a
purchase. Answers are plain text: `faq/page.tsx` renders `answer` straight into
the accordion *and* into the FAQPage JSON-LD, so markdown would appear literally
and would leak into structured data.

3 posts per locale, each topic written once in French and once in English and
linked with `translationOfSlug` (resolved to the counterpart's `_id` at insert):
*Combien coûte un site web au Cameroun ?*, *41,9 % : pourquoi votre site doit
être conçu pour le mobile*, *Orange Money, MTN Money, NotchPay : quel paiement
en ligne ?*. Bodies start at `##`.

**Testimonials are seeded empty, and this is the one thing a seed script must
never invent.** A fabricated quote attributed to a named person at a named
company is a factual claim about a real third party, and a visitor reads it as
one. The collection is empty, the page renders its empty state, and quotes come
from `/admin/testimonials` or from real clients through the form.

### Fixes

- `getPublishedPostSlugs()` now returns `{ slug, locale }[]`; `generateStaticParams`
  maps it directly instead of crossing it with the locale list. Six posts now
  pre-render as six correct URLs, verified against `.next/server/app`.
- Removed the `export { getPublishedPostSlugs }` re-export from `sitemap.ts`. The
  sitemap already filters per locale with `listPublishedPosts(locale)`; the
  re-export implied the two shared a shape they do not.
- `seed.ts` loads `.env.local` itself — Next loads it for the app, a bare
  `node scripts/seed.ts` does not — and unwraps quoted values, because the Gmail
  app password contains spaces.
- `scripts/check-credentials.mjs` uses `cloudinary.api.ping()`, not `usage`, and
  names the quoted-value trap when it sees a short space-free password.
- `tsconfig.json` gains `allowImportingTsExtensions` (safe with `noEmit`), CI moves
  from Node 20 to 22 — `--experimental-strip-types` does not exist on 20 — and
  `engines` pins `>=22.6.0`.

### Checks

`scripts/check-seed-content.mjs` validates the content as data: encoding, no
markdown in FAQ answers, no English in French or French in English, locale
parity, translation links resolving, heading levels, empty testimonials.

Language drift is the interesting one. A 60-word list of English function words
caught nothing — `impossibly` had already shipped into the French post in an
earlier draft. English *morphology* is more reliable than English vocabulary, so
`-ly` / `-ing` / `-ed` endings flag the whole category, with an allowlist of
French words that legitimately end that way (`famille`, `possible`, `incomparable`).

`scripts/test-seed-content.mjs` injects 11 specific defects and asserts the
checker rejects each one, restoring the file byte-for-byte afterwards. It is in
the repo because a checker that only ever passes is indistinguishable from one
that does nothing — the same lesson as the dead check in `check-messages.mjs`.

Two of those 11 test cases failed *the tests*, not the checker: the mutations
were `rapidement` and `optimisé`, which are French words. A test that mutates
correct code and calls it a failure trains you to ignore the suite.

## Files

| File | Change |
| --- | --- |
| `scripts/seed-content.ts` | New. 36 FAQs, 6 posts, empty testimonials, editorial rules, sources |
| `scripts/check-seed-content.mjs` | New. Data validation for the above |
| `scripts/test-seed-content.mjs` | New. 11 injected defects, all rejected |
| `scripts/check-credentials.mjs` | New. Read-only Mongo/Cloudinary/SMTP/session probe |
| `scripts/seed.ts` | Rewritten. Imports content, loads `.env.local`, resolves translations |
| `src/lib/content.ts` | `getPublishedPostSlugs()` returns locale-tagged entries |
| `src/app/[locale]/blog/[slug]/page.tsx` | `generateStaticParams` no longer crosses slugs with locales |
| `src/app/sitemap.ts` | Dropped the misleading re-export |
| `tsconfig.json` | `allowImportingTsExtensions` |
| `package.json` | `seed:check`, `seed:test`, `env:check`; `verify` includes the content check; `engines` |
| `.github/workflows/nextjs.yml` | Node 22; `seed:check` step |
| `.env.example`, `src/lib/env.ts`, `src/app/admin/login/LoginForm.tsx` | Domain corrected to `cameroondigitalagency.com` |

## Verify

```bash
npm run seed:check     # content is well-formed
npm run seed:test      # the checker can actually fail
npm run env:check      # credentials work (read-only, sends no mail)
npm run verify         # messages + content + lint + typecheck + build
npm run seed           # idempotent; only fills empty collections
```

Database state after seeding: 36 FAQs (18 fr / 18 en, 4 featured each), 6 posts
(3 fr / 3 en, every `translationOf` resolving to its counterpart), 0 testimonials,
0 admins.

## Notes

- **SMTP authenticates but the password is rejected.** All four combinations —
  with and without the spaces in the app password, on 587 and 465 — return
  `535 5.7.8 Username and Password not accepted`. The value is correctly shaped
  (19 characters, `4-4-4-4` lowercase) so it is not a truncation problem. Google
  rejects it. Regenerate the app password; Google revokes them whenever 2FA
  changes, so one created before a 2FA change stops working silently.
- **No admin account was created.** `npm run seed` creates one when `ADMIN_EMAIL`
  is set, and the only password available was the one pasted in chat. Running it
  with `$env:ADMIN_EMAIL=" "` (a single space — PowerShell *deletes* a variable
  set to `""`, which lets the loader restore the real value from `.env.local`)
  skips admin creation and seeds content only. Create the admin with a password
  you have not typed into a chat.
- **The credentials in `.env.local` were pasted in plaintext and should be
  rotated** — the MongoDB password and the Cloudinary API secret especially.
  `.env.local` is gitignored and cannot reach the repo; `.env.example` remains
  blanks-only.
- **Seed content is only inserted into an empty collection.** Correct — it is
  already populated. To revise the FAQs or posts, edit them in `/admin`, or drop
  the collection and re-seed.
- **The push is still blocked.** See [A](a-fix-ci.md); the token needs the
  `workflow` scope. Collaborator status is not a scope.