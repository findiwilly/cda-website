---
name: cda-motion-design
description: Use whenever building, editing, or reviewing anything that moves on CDA pages — sections, components, transitions, scroll behavior, hovers, loaders. Enforces motion-tokens-only animation values and the house choreography rules.
---

# SKILL: CDA Motion Design

Use this skill whenever building, editing, or reviewing anything that moves on a CDA project: page sections, components, transitions, scroll behavior, hovers, loaders.

## Identity
CDA motion is **slow, confident, expensive**. It behaves like a luxury brand: one breathtaking moment per page, disciplined calm everywhere else. Motion whispers "we could do more — we choose not to."

## Hard rules (never break)
1. **All animation values come from `src/lib/motion-tokens.ts`.** Never write inline durations, easings, or distances. If a needed variant doesn't exist, add it to the tokens file first, then use it.
2. **Animate only `transform` and `opacity`.** Never width, height, top, left, margin, padding, or font-size. If a layout change must animate, use Motion's `layout` prop.
3. **Entrance choreography:** elements enter with `fadeUp` inside a `staggerParent`. Exits use `dur.exit` (faster than entrances).
4. **One cinematic moment per page maximum** (`dur.cinematic`, `clipReveal`, pinned GSAP scenes). Everything else uses `base` or `slow`.
5. **Distance discipline:** nothing travels more than 24px on entrance; nothing scales more than 4%.
6. **Play once:** `whileInView` with `viewportOnce`. Animations never replay on scroll-up.
7. **Accessibility & data:** every animated component checks `useReducedMotion()` and the Mode Léger flag. Both render the final visible state instantly with no animation. Scroll-scrubbed/pinned sections are disabled entirely in both modes.
8. **Mobile first judgment:** after building any motion, run the dev server and test with CPU throttled 4x. If it stutters, simplify — do not "optimize" by adding will-change everywhere.

## Library roles (do not improvise new libraries)
- `motion` — component entrances, hovers, layout, page transitions
- `gsap` + ScrollTrigger (via `@gsap/react` useGSAP) — pinned sections, scroll-scrubbed timelines, video scrubbing
- `lenis` — global smooth scroll; initialize once in the root layout; sync with ScrollTrigger
- `split-type` — split headlines for `letterCascade`; always revert splits on unmount
- `lottie-react` — micro feedback only (form success, small icons); never ambient decoration

## Choreography recipes
- **Section entrance:** wrapper = `staggerParent`; heading = `letterCascade` on words; body = `fadeUp`; media = `scaleIn`.
- **Hero (the one cinematic moment):** `clipReveal` on the headline, background media fades with `fadeIn` at `dur.cinematic`, CTAs arrive last via stagger.
- **Pinned scroll story:** GSAP ScrollTrigger pin + scrub: 1; map progress to transforms or video currentTime; provide a static fallback frame.
- **Hover:** `hoverLift` + a color/opacity shift at `dur.fast`. No scale-ups beyond 1.02.
- **Page transition:** brief opacity+y exit (`dur.exit`), entrance per section rules. Optional lion-mark wipe reserved for launch phase 2.

## Review checklist before committing any motion work
[ ] All values from tokens? [ ] Transform/opacity only? [ ] Stagger present on groups? [ ] Once-only viewport? [ ] Reduced-motion + Mode Léger paths? [ ] 4x throttle smooth? [ ] Only one cinematic moment on the page?
