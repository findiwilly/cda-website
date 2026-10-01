# D — Background & side imagery

**Status:** Done (photography pending drop-in)
**Spec:** `CLAUDE.md` — "background images in some sections, side-by-side images
in others"
**Problem:** Every page had exactly one visual device: a coloured blurred circle
(`bg-cdagreen/15 blur-[130px]`) near the masthead. Eight pages used it, in
near-identical positions. The site read as unfinished, and the requirement was
for actual imagery in two arrangements.

**Change:**

### Photography is the target; the mechanism is in place

Real, licensed stock photography is what this should ship with. **The component
and path structure are built for it.** What is live right now is authored SVG,
for one reason: photo bytes could not be downloaded in the build environment —
outbound HTTP from the shell is blocked. That is a tooling limit, not a design
decision.

So this stream is split in two:

| Layer | Status |
| --- | --- |
| `SplitMedia` — the side-by-side arrangement | **Done.** Both slots wired to the registry. |
| `SectionBackdrop` — the background arrangement | **Done**, with a `photo` variant ready and unused. |
| `src/lib/images.ts` — every image slot in one file | **Done.** |
| The actual `.jpg` files | **Not present.** See `public/img/photos/README.md`. |

Swapping a slot to photography is a one-entry edit in `src/lib/images.ts` plus
updating two `alt` strings. Full instructions, suggested search terms and
dimensions are in **`public/img/photos/README.md`** — start there, it is the
short version.

**Nothing references a path that does not exist.** The site renders correctly as
it stands, and no broken images appear while the photographs are pending.

### `src/lib/images.ts`

Every image slot, each with:

- `src` / `width` / `height` — what is live now.
- `photo.file` / `width` / `height` / `search` / `source` — the drop-in target,
  with search terms chosen to surface dark, low-clutter, legible-at-low-opacity
  images. A busy or bright photograph will fight the copy no matter how far the
  opacity is turned down.

An earlier version of this work argued *against* stock photography, on the
grounds that using stock images would fabricate claims about the business. That
reasoning was wrong, and conflating two separate things caused it:

- **Genuinely wrong:** a stock photo of a person standing in for a *named member
  of the CDA team*. That implies a specific person did or said something they did
  not. `TestimonialCard` uses initials for exactly this reason.
- **Fine, and what was asked for:** a generic photograph illustrating "how we
  work". It makes no claim about CDA's staff. This is stock photography, and it
  is ordinary practice.

### `src/components/ui/SplitMedia.tsx` (new)

Reusable media-plus-copy section, following the existing side-by-side grid
pattern rather than inventing a new one:

- `reverse` flips which side the media takes. **On mobile both always stack, and
  the media always comes first** — on a phone that is the only arrangement that
  still reads top-to-bottom as "look, then read".
- Media goes through `next/image` with explicit `width`/`height` **and** a
  `sizes` hint. Without `sizes`, Next downloads desktop-width art on a 360px
  screen; without explicit dimensions the box is not reserved and the layout
  shifts on load. Both matter more with a photograph, which is far larger than
  an SVG.
- `alt` is **required**. For these sections the image carries meaning the copy
  does not repeat, so `alt=""` would be wrong.
- Optional `caption` and `aside` slots, so the component stays generic.

Two sections use it:

| Page | Section | Slot |
| --- | --- | --- |
| `/about` | `Method` — measure, adjust, repeat | `IMAGES.method` |
| `/ai-agents` | `OnAPhone` — it answers while you sleep | `IMAGES.agentOnPhone` |

`industries/[slug]` already had a side-by-side `PhoneMockup`, so it was left
alone rather than being rewritten to use the new component — it does not need an
`Image`, and forcing it through `SplitMedia` would have meant prop-drilling a
component through `src`.

### `src/components/ui/SectionBackdrop.tsx` (new)

Decorative layer for section mastheads. Three variants:

- `variant="photo"` — a real photograph, `src` required. Preferred; unused until
  the file lands.
- `variant="grid"` — `public/img/grid.svg`, a 120×120 **tileable** fine grid.
  One cell carries a faint green fill so it does not read as graph paper.
- `variant="contours"` — `public/img/contours.svg`, a 1600×900 topographic field
  with cm-gradient strokes and survey markers.

Two properties are non-negotiable and enforced in the component:

- **`aria-hidden` + `pointer-events-none`.** Decoration must be invisible to a
  screen reader and must never intercept a click meant for the content on top.
- **Opacity stays low.** The default is `0.06`; call sites pass `0.04`–`0.06`.
  Above roughly `0.12` body text loses contrast. A gradient
  (`from-ink-950 via-ink-950/60 to-ink-950`) fades the layer towards the edges so
  it never forms a visible rectangle boundary.

The parent must be `relative overflow-hidden`; that clips the oversized offsets
and lets one asset cover any section height.

Applied to 11 mastheads: `services`, `resources`, `blog` index, `blog/[slug]`,
`contact`, `faq`, `testimonials`, `industries`, `industries/[slug]` (two),
`about` (two), `ai-agents`.

**The home page deliberately has none.** `HeroScene` is already the visual event
there and a texture behind it would only muddy it.

### Copy

`about.method` and `aiAgents.onAPhone` were added to **both** message files in the
same commit, including the `imageAlt` strings. `aiAgents.how.eyebrow` replaced a
hardcoded English `"Co-pilot"` that was rendering in French.

**The `imageAlt` strings must be rewritten when the photographs land.** They
currently describe illustrations. Shipping them unchanged alongside a photograph
means telling every screen-reader user the image is a dashboard illustration when
it is a photo of a person. `public/img/photos/README.md` calls this out as step 3
for exactly that reason.

**Files:**

- `src/lib/images.ts` (new)
- `src/components/ui/SectionBackdrop.tsx` (new)
- `src/components/ui/SplitMedia.tsx` (new)
- `public/img/photos/README.md` (new)
- `public/img/grid.svg`, `contours.svg`, `art-dashboard.svg`, `art-agent.svg` (new)
- `src/app/[locale]/about/page.tsx`, `ai-agents/page.tsx`, `services/page.tsx`,
  `resources/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`,
  `contact/page.tsx`, `faq/page.tsx`, `testimonials/page.tsx`,
  `industries/page.tsx`, `industries/[slug]/page.tsx`
- `src/messages/fr.json`, `src/messages/en.json`

**Verify:**

```bash
npm run build
npm run dev
```

1. `/fr/about` and `/fr/ai-agents` — the two side-by-side sections render.
2. Narrow to 375px. The image must come **above** the copy on both.
3. Disable images in DevTools — nothing should break or reflow badly.
4. Screen reader: `SectionBackdrop` is skipped entirely; each `SplitMedia` image
   announces its `imageAlt`.
5. To test the photo path: drop any `.jpg` into `public/img/photos/`, set that
   slot's `src` in `src/lib/images.ts`, and confirm it renders before
   downloading the real thing.

**Notes:**

- **Optimise photographs before dropping them in.** A 4000px camera JPEG will be
  ~4 MB and will dominate the page weight on the metered mobile connections this
  audience is on. Resize to the dimensions in `src/lib/images.ts` and export as
  WebP or AVIF at q~75. That is most of the work, and it is worth doing properly.
- **The `SplitMedia` images are SVGs served as static files**, not run through
  `next/image`'s optimiser — SVG needs no resizing and the transform would be a
  pointless hop. Real JPEGs take the identical code path unchanged.
- `grid.svg` must not be scaled up. Its strokes are `1px` at a 120px tile, so
  they land near `0.5px` in place; a larger `background-size` makes it visibly
  coarse.
- If a real client dashboard is ever shown, that needs written permission and a
  caption saying whose data it is.
- Prefer images that plausibly reflect the market. For a Cameroonian agency,
  generic stock can quietly undercut the whole point of the site; the search
  terms in the registry aim for that, but check before publishing.