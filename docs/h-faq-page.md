# H — FAQ page

**Status:** Done
**Spec:** user requirement — "an FAQ page"
**Problem:** No FAQ page existed. The contact page's accordion showed a
hardcoded `eyebrow="FAQ"` block with no questions in it, and that eyebrow string
was English — rendering untranslated in French. Prospective buyers had nowhere to
self-serve the questions that block a purchase, which meant every one of them
became an email or a WhatsApp message.

**Change:**

### `src/app/[locale]/faq/page.tsx`

- Content is **admin-managed in Mongo**, not in the message files, so adding a
  question needs no developer and no deploy. Managed at `/admin/faqs`
  (`docs/e-admin-panel.md`).
- **Featured questions render first**, outside the category grouping. These are
  the questions that block a purchase, and they should not have to be hunted for
  under a heading.
- The rest is grouped by the `category` field, sorted by the admin's `order`
  within each group and alphabetically by group, so the page stays stable as
  questions are added.
- **Accents are normalised for element ids.** French category names like
  "Questions fréquentes" contain characters that are valid in an `id` but
  awkward as a fragment and fragile in CSS selectors. `slugOf()` runs
  NFD-normalisation and strips the combining marks, so `id="faq-questions-frequentes"`
  comes out of "Questions fréquentes".
- Every section uses `aria-labelledby` pointing at its own `<h2>`, so the
  category structure is navigable by heading.
- Empty state when there are no FAQs — which is what a fresh, unseeded database
  produces.

### Structured data mirrors the page exactly

`faqJsonLd` is fed **the same array that renders below** —
`faqs.map(({ question, answer }) => ...)`. That is deliberate and is the whole
point: schema.org requires structured data to match visible content, and marking
up questions that are not on the page is a manual-action risk from Google, not a
ranking trick.

Breadcrumb JSON-LD alongside it, from `src/lib/seo.ts`.

### Copy

`faq.*` added to **both** message files in the same commit, French first. Nav
entry `nav.faq` in both languages, and `/faq` added to `NAV_ITEMS` and the
`Navbar` `LINKS`.

**Files:**

- `src/app/[locale]/faq/page.tsx` (new)
- `src/lib/seo.ts` — `faqJsonLd`, `breadcrumbJsonLd`
- `src/app/admin/faqs/**` (new)
- `src/components/ui/Accordion.tsx` — accessibility work
- `src/lib/constants.ts` — `NAV_ITEMS`
- `src/components/layout/Navbar.tsx` — `LINKS`
- `src/messages/fr.json`, `src/messages/en.json` — `faq.*`, `nav.faq`
- `src/app/[locale]/contact/page.tsx` — hardcoded `"FAQ"` replaced

**Verify:**

```bash
npm run seed      # seeds 14 FAQs: 7 fr + 7 en
npm run dev
```

1. `/fr/faq` and `/en/faq`. Featured questions at the top, then categories.
2. **Screen reader:** navigate by heading (H key in NVDA/VO). Each category
   should be reachable and announced with its question count implied by the list.
3. Expand an accordion item. The answer should be announced as a region labelled
   by the question.
4. `/admin/faqs` → add a question, publish it, check `/fr/faq` updates with no
   redeploy. Then reorder with the `order` field and confirm the page follows.
5. **Validate structured data:** paste `/fr/faq` into Google's Rich Results Test.
   It should report FAQ items, and the count should match the visible count.
6. `npm run seed` with an empty database first, to see the empty state.

**Notes:**

- **The same questions appear in three places** — `/faq`, the contact-page
  accordion, and the FAQ JSON-LD. That is intentional: they are the same data
  read three ways. Change them in `/admin/faqs`, never in `fr.json`.
- **FAQ rich results are restricted by Google.** FAQ schema no longer generates
  expandable results for most commercial sites. The markup is still correct and
  still helps LLM and assistant search, which increasingly answer from exactly
  this structure — but do not expect a visible SERP change. The page is worth
  having on its own merits.
- **`featured` is a boolean, not a weight.** There is one featured block. If a
  second tier is ever needed, that is a `priority` field, not another boolean.
- Accent normalisation in `slugOf()` duplicates logic that also exists in
  `src/lib/markdown.ts` (`slugify`). They are separate on purpose — one runs on
  build-time markdown headings, the other on admin-authored category names — but
  if a third copy appears, extract it.
- The accordion it reuses is the same component fixed in
  `docs/c-lead-form-and-calcom.md`. Its `aria-controls`, `role="region"` and
  heading-wrapper work is load-bearing here, since the FAQ page is entirely
  accordions.

### Added in [J](j-content-and-credentials.md)

Seeding 18 real questions per locale surfaced three constraints that are easy to
break and impossible to see until the content is rendered.

- **Answers are plain text, never markdown.** `answer` is rendered straight into
  the accordion *and* passed to `faqJsonLd`. Nothing parses markdown there, so
  `*vos*` appears literally in the page and `**prix**` leaks into the structured
  data that Google reads. `npm run seed:check` fails on markdown in an answer.
- **The two languages cannot be paired by question text.** The question is
  translated, so the French and English rows legitimately differ. The first
  version of the seed paired on `question`, and it "worked" for exactly one entry
  — the one that had been left in French on the English page, which is itself a
  bug a visitor would see. Seeded FAQs therefore carry an explicit `key`
  (`market-price-ranges`, `payment-terms`, …) which is the join key, stripped
  before insert because it is a seed-time convenience, not a document field.
- **Seeded answers must agree with `contact.faq` in the message files.** Both
  surfaces answer "how much?", "how long?", "how do I pay?". The seed originally
  said *50 % on signature, 50 % on delivery* while `contact.faq.q4.a` says *MTN
  Mobile Money, Orange Money or bank transfer, instalments possible*. The
  messages files own the commercial terms; the FAQs restate them. The old English
  seed also quoted euros where the French quoted FCFA, at an inconsistent rate.