---
name: cda-brand
description: Use when designing, building, or reviewing ANY CDA page, section, or component — the brand's visual system, UI/UX heuristics, and the pre-ship quality checklist. Trigger on tasks like "build the X page", "add a section", "improve the design", "does this look premium?".
---

# CDA Brand & UI Craft

The bar: senior Apple.com engineer × Awwwards Site of the Day. If a section could
appear in a generic Tailwind template, redesign it.

## Composition rules

- Every section starts from the same skeleton: eyebrow (hairline + tracking-[0.35em]
  micro-caps in `cdagreen-bright`) → display heading → optional one-line subtitle.
  Use the shared `SectionHeader` pattern; never invent a new header style per section.
- Left-align editorial content on desktop; reserve centered layouts for finales/CTAs.
- One display size per section maximum. Heading hierarchy: `text-display-xl` is the
  hero's alone; sections use `display-md`, cards use `text-lg`.
- Whitespace is a feature: `py-section` between sections, min `gap-4` in grids.
  Never fill space with decoration — fill it with intention or leave it empty.
- Asymmetry beats symmetry: off-center 3D, 2-column splits with unequal weight,
  numbered items (`01`, `02`…) in `ink-600` for editorial texture.

## Color discipline

- Backgrounds only from the `ink` scale. Flag colors are *accents*: glows
  (`bg-cdagreen/20 blur-[140px]`), hairlines, icon tints, one gradient text moment
  per page. Green leads; yellow warms; red appears once or twice per page, max.
- Never place flag colors as filled blocks behind text. Never use pure white
  (`ink-50` is the ceiling).
- Glass surfaces (`.glass`) for cards; gradient borders via `p-px` wrapper +
  `bg-gradient-to-br from-cdagreen/40 …` for the one hero panel per page.

## Motion recipes

- Motion (`motion/react`) for reveals: `Reveal` for single blocks, `Stagger` +
  `StaggerItem` for grids (gap 0.08, never slower), `Counter` for numbers.
- GSAP (via `@/lib/gsap`) only for: SplitText type reveals on display headings,
  scrubbed parallax, pinned sequences. One GSAP moment per page is enough.
- Everything must degrade: reduced-motion collapses to opacity/none. Test it.
- Easing: `power4.out` (GSAP) / `EASE` from `lib/motion`. No bounces, no springs
  with visible overshoot — this brand glides, it doesn't bounce.

## Mobile first, Cameroon first

- Design at 390px first; enhance upward. Thumb-reachable CTAs, full-width buttons.
- 3G budget: no images where CSS/SVG works, 3D lazy-loaded behind IO, LCP element
  is always text.
- WhatsApp is the conversion primitive: primary CTAs deep-link via `waLink()` with
  a prefilled localized message.

## Pre-ship checklist

1. Both locales rendered and proofread — French reads warm and Cameroonian, not translated.
2. Screenshot desktop (1440) AND mobile (390); look at them before declaring done.
3. Every link/button lands somewhere real (section, page, or WhatsApp). Zero 404s.
4. Fold test: headline + primary CTA visible without scrolling on both viewports.
5. `npm run build` passes; three.js stays out of the initial bundle.
6. Reduced-motion pass: page fully usable, nothing invisible.
