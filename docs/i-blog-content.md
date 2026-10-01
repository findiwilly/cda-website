# I — Blog index & article rendering

**Status:** Done
**Spec:** user requirement — "an admin can post blog posts"
**Problem:** `/blog` was a hardcoded list of three sample posts from
`fr.json`/`en.json`. There was **no article page at all** — every card linked
nowhere, or to a route that did not exist. Posts could not be written by anyone
without a developer.

**Why this has its own document,** though the index was A–H: the interesting work
here is the markdown → sanitized HTML pipeline, and the bugs in it are the kind
that do not announce themselves.

**Change:**

### `src/app/[locale]/blog/page.tsx`

- DB-driven via `listPublishedPosts(locale)`.
- **Category pills are derived from the posts that exist**, not from a list in a
  translation file. A category filter with nothing to filter is worse than no
  filter.
- The empty state is a **non-dead end** — it links to `/contact` and `/faq`
  rather than just apologising.

### `src/app/[locale]/blog/[slug]/page.tsx`

- `getPostBySlug(slug, locale)`. `generateStaticParams` from
  `getPublishedPostSlugs()`, so published posts are statically generated and the
  rest render on demand.
- Breadcrumb JSON-LD and `articleJsonLd` from `src/lib/seo.ts`.
- Cover image, related posts, table of contents.
- `publishedAt` is set once on first publish and **preserved across later
  edits**, so the date a post went live never silently moves when it is
  corrected. `updatedOn` is shown separately, and only when `updatedAt` is more
  than 24 hours past `publishedAt` — an article edited an hour after publication
  has not really been updated.
- **The cover image sits below the text header**, so the headline is the first
  thing painted and a slow image can never delay LCP.

### `src/components/blog/ArticleBody.tsx`

A **server component** that renders sanitized HTML only. Client-side markdown
rendering would mean shipping `marked` and `sanitize-html` to every visitor to
display content that could have been sanitized on the server.

### `src/components/blog/TableOfContents.tsx`

In-page contents built from `extractHeadings()`.

### `src/lib/markdown.ts` — the pipeline, and two traps

Every read goes **parse → sanitize**. Admin-authored markdown is still untrusted
input: a compromised or careless admin session could otherwise store `<script>`
or an `onerror` handler and have it served to every visitor. The sanitizer's
allowlist is **explicit, not a denylist** — headings, prose, lists, links, images,
code, quotes, tables. Not script, style, iframe, form, event handlers, or
`javascript:` URLs. `renderMarkdown` never throws; malformed markdown degrades to
text.

**Trap 1 — heading ids.** `marked` v8 stopped emitting heading `id`s, so
`outlineOf()` in `src/lib/markdown.ts` is the single source of truth, and
`renderMarkdown` re-attaches exactly those ids through a custom renderer. Both
sides number headings independently, and `idNthTime()` keeps them in lockstep by
counting occurrences. Matching on rendered inner HTML instead — the obvious
approach — breaks the moment a heading contains inline markdown: `## **Bold**
title` renders as `Bold title` inside a `<strong>`, which never equals
`token.text`. Matching on **`token.text` (raw markdown)** is required.

**Trap 2 — the renderer must be an instance.** `marked`'s renderer methods
require `this.parser`. Passing a bare object literal as `renderer` throws
`t.text is not a function` at render time. It must be `new Renderer()` with only
`heading` overridden; a partial object has no fallback for the methods `marked`
does not find.

### Typography without a plugin

**`@tailwindcss/typography` is not installed.** Its output fights this site's
theme — it sets its own colour scale and its own spacing. `.prose-cda` is
hand-written in `src/app/globals.css` and covers **exactly the tags the sanitizer
allows**, so a tag can never end up rendered and unstyled, and a style can never
be written for a tag that cannot survive sanitization.

The sanitizer allowlist carries three additions that exist to make this work:
`h2`/`h3` → `["id"]` (for the table of contents) and `img` → `["decoding"]`.

### Also in this stream

`tsconfig.json` was set to `"target": "ES2017"` — see `docs/00-environment.md`.

**Files:**

- `src/app/[locale]/blog/page.tsx` (rewritten)
- `src/app/[locale]/blog/[slug]/page.tsx` (new)
- `src/components/blog/ArticleBody.tsx` (new)
- `src/components/blog/TableOfContents.tsx` (new)
- `src/lib/markdown.ts` (new)
- `src/app/globals.css` — `.prose-cda`
- `src/messages/fr.json`, `src/messages/en.json` — `blog.*`

**Verify:**

```bash
npm run seed      # 2 demo posts
npm run dev
```

1. `/fr/blog` → open a post. TOC links must **scroll to the right heading**,
   not just exist.
2. **Test the heading-id matching directly.** Create a post containing
   `## **Résumé**`, `## Résumé` and `## Conclusion`. All three TOC entries must
   resolve to distinct sections. This is the case the naive implementation
   silently breaks.
3. **Test the sanitizer.** Create a post with
   `<script>alert(1)</script>` and `[x](javascript:alert(1))`. Neither may
   execute, and neither may appear as live markup.
4. Publish a post, wait, edit it. `publishedAt` must not move.
5. Testimonials/FAQs in `/admin` — see `docs/e-admin-panel.md`.

**Notes:**

- **Demo posts from the seed are marked "replace me".** They must be replaced or
  deleted before launch, same as the placeholder testimonials.
- **Cover images use a plain `<img>`, not `next/image`.** `cover.url` is already
  a transformed Cloudinary delivery URL, so Next's optimiser would only add a hop
  for no benefit. Width and height come from the upload, so there is no layout
  shift. This is the one place the
  `// eslint-disable-next-line @next/next/no-img-element` disable is used, and it
  is deliberate.
- A **cover image is optional.** Posts render without one. Do not make it
  required — it adds friction to every post for a purely decorative gain.
- **Sanitizer changes have a second consumer.** If a tag is added to
  `allowedTags`, it also needs a rule in `.prose-cda`. If an attribute is added,
  it needs `allowedAttributes`. Keeping those two in step by hand is deliberate;
  the alternative — a plugin that styles tags the sanitizer would strip — is worse.
- **`slugify` uses `\u` escapes for diacritic stripping, not literal combining
  characters.** U+0300 and U+036F are invisible in an editor and render correctly
  only next to a base letter, so any tool reading the file without assuming UTF-8
  transcodes them into a plausible-looking character class that matches nothing.
  A bare `Get-Content` in Windows PowerShell already does exactly that. The
  failure is silent, and French content is accented throughout, so it would show
  up as `r-sum` instead of `resume` in slugs and TOC anchors. Keep the escapes.
- **Bilingual posts are separate documents sharing `translationOf`**, not one
  document with translated fields. Editing the French post therefore cannot
  silently break the English one, and the admin can see at a glance which
  translations are missing.