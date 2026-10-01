# B — SEO foundation

**Status:** Done
**Spec:** `CLAUDE.md` — "SEO is not optional"; bilingual FR/EN with `hreflang`
**Problem:** The site had page titles and nothing else. No sitemap, no
`robots.txt`, no canonical URLs, no `hreflang`, no structured data, no web
manifest, no social preview image, no favicon. Search engines had no machine-
readable statement of what the pages were or which language they were in, and
Cameroon's mobile-first audience had no installable manifest to work with.

**Change:**

1. **`src/app/sitemap.ts` (new)** — generates `/sitemap.xml` from one
   `STATIC_PATHS` list plus the dynamic content: every published blog post, in
   both locales. `alternates.languages` emits reciprocal `fr`/`en` hreflang on
   every entry, which is what actually tells Google the two are translations of
   each other rather than competing duplicates. Blog posts come from
   `getPublishedPostSlugs()`; with no database that returns `[]` and the sitemap
   is still valid.

2. **`src/app/robots.ts` (new)** — `force-dynamic`, because a statically
   generated `robots.txt` freezes the sitemap URL at build time, which breaks
   preview deployments. Allows everything except `/admin` and `/api`, and points
   at the absolute sitemap URL via `siteUrl()` rather than a relative path,
   because a relative `Sitemap:` directive is not reliably resolved by crawlers.

3. **`src/app/manifest.ts` + `src/app/icon.svg` (new)** — web app manifest with
   the brand name, theme colours from the Tailwind palette, and a hand-authored
   SVG icon rather than a PNG. The icon is in `src/app/`, not `public/`, so
   Next's file convention picks it up as the favicon for every route without a
   per-page metadata declaration.

4. **`src/app/api/og/route.tsx` (new)** — `next/og` social card image, served
   from the fixed path `/api/og?locale=fr`. It is **not** the
   `opengraph-image.tsx` file convention, because `siteUrl()` cannot be used to
   build the `image` metadata value in that case — metadata needs a static
   absolute URL, so the URL has to be known ahead of the request. A route gives
   us that: `/api/og?locale=fr` is the same string in `generateMetadata` and in
   the rendered tag.

5. **`src/components/seo/JsonLd.tsx` (new)** — a typed wrapper so JSON-LD cannot
   be malformed by hand-editing. Renders
   `<script type="application/ld+json">` with `JSON.stringify`. The `<` sequence
   is escaped to `\u003c`, which prevents an injected string in a FAQ answer from
   closing the script tag.

6. **Layout metadata** — `title.template` so child pages produce
   `Page — Cameroon Digital Agency` rather than overwriting the brand, plus
   `alternates.languages` for FR/EN, an OG/Twitter card block, and
   `LocalBusiness` JSON-LD (address, geo, `openingHours`, `priceRange`) in the
   root layout.

7. **`src/app/[locale]/error.tsx` and `not-found.tsx` (new)** — in-site error and
   404 screens. A framework-default error page is a stack trace on a dark-themed
   site; both are now styled, bilingual, and link back to a real route.

**Files:**

- `src/app/sitemap.ts` (new)
- `src/app/robots.ts` (new)
- `src/app/manifest.ts` (new)
- `src/app/api/og/route.tsx` (new)
- `src/components/seo/JsonLd.tsx` (new)
- `src/app/icon.svg` (new)
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/error.tsx` (new)
- `src/app/[locale]/not-found.tsx` (new)

**Verify:**

```bash
npm run build && npm run start
curl -s localhost:3000/sitemap.xml | head
curl -s localhost:3000/robots.txt
curl -s "localhost:3000/api/og?locale=fr" -o /tmp/og.png && file /tmp/og.png
```

Inspect the `<head>` of `/fr` — title, canonical, `og:image`, and the
`application/ld+json` block. Paste the page into Google's Rich Results Test and
the Schema validator.

**Notes:**

- **A root `src/app/not-found.tsx` was created and then deleted.** It cannot
  render `<html>`/`<body>`, because there is no root layout outside
  `[locale]/`. `src/app/[locale]/not-found.tsx` covers every route that actually
  has a layout, including unmatched paths under `/fr` and `/en`.
- **Known benign build warning:** "Using edge runtime on a page currently
  disables static generation for that page", emitted by `/api/og`. The route
  *must* be edge runtime — `next/og` depends on it — and it is a route handler,
  so there is no page to statically generate.
- `/api/og` renders Latin text with the default font. Adding a custom font means
  shipping the `.ttf` into the route and awaiting `fetch` before drawing;
  worth doing if OG engagement looks weak in analytics.
- `LocalBusiness` data (address, phone, geo) comes from `src/lib/constants.ts`
  `SITE`. It is demo data and must be replaced with the real business details
  before launch — see `docs/00-environment.md`.
- There is no analytics, tracking pixel, or search-console verification tag.
  Deliberately left out: adding them needs a privacy decision that belongs in the
  cookie policy, which is `docs/f-legal-pages.md`.