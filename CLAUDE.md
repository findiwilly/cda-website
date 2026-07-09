# CDA Website — Project Memory

Multi-page marketing site for **Cameroon Digital Agency (CDA)**, an AI-powered digital
transformation agency in Yaoundé, Cameroon, serving Cameroonian SMEs and scaling across
Francophone Africa. Quality bar: senior Apple.com engineer × Awwwards Site of the Day.
Nothing may look template-like or "AI-generated".

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — production build (run before pushing; must pass)
- `npm run lint` — ESLint (next/core-web-vitals)

## Tech stack

- **Next.js 14 (App Router, TypeScript)** — `src/` layout, path alias `@/*` → `src/*`
- **Tailwind CSS 3.4** — all styling via utilities + tokens in `tailwind.config.ts`.
  No CSS modules, no styled-components. Arbitrary values welcome; generic
  Bootstrap-looking layouts are not.
- **Motion** (`motion` package, the framer-motion successor — import from
  `motion/react`, never `framer-motion`) — declarative UI animation: scroll reveals,
  staggered children, AnimatePresence. Shared variants live in `src/lib/motion.ts` —
  always reuse/extend these presets instead of inlining one-off variants.
- **GSAP + ScrollTrigger + SplitText** (all free since 3.13) via `@gsap/react`'s
  `useGSAP` — cinematic sequences: hero type reveals, scrubbed scroll parallax.
  Import from `src/lib/gsap.ts` (plugins registered there), never from `gsap` directly.
- **Lenis** — site-wide smooth scrolling, mounted once in
  `src/components/layout/SmoothScroll.tsx`, synced to GSAP's ticker, disabled for
  `prefers-reduced-motion`. Same-page `#anchor` clicks are intercepted there.
- **Division of labor**: Motion for component-level reveals/presence; GSAP for
  timeline choreography and anything scroll-scrubbed. Don't mix both on one element.
- **Three.js via React Three Fiber (+ drei)** — 3D used tastefully, not everywhere.
  All R3F scenes live in `src/components/three/` and are **always** loaded with
  `next/dynamic` (`ssr: false`) behind an intersection observer, with a static
  fallback for `prefers-reduced-motion` and low-end devices.
- **next-intl** — bilingual routing (see Bilingual section).

## Structure

```
src/
  app/[locale]/        # all routes live under the locale segment
  components/
    layout/            # navbar, footer, WhatsApp button, page transition shell
    three/             # R3F scenes (lion particle field, service icons, agent orchestration)
    motion/            # reusable motion wrappers (Reveal, Stagger, Counter…)
    ui/                # buttons, cards, accordion, forms, device frames
  i18n/                # next-intl routing + request config
  lib/                 # motion presets, utils (cn), constants (industries, services)
  messages/            # fr.json (source of truth), en.json
```

## Design system

Dark, premium, ultra-modern, editorial. Minimalism with intention: generous whitespace,
glassmorphism cards, subtle grain/noise texture.

- **Backgrounds**: deep charcoal / near-black — `ink` scale in Tailwind config
  (`ink-950` page background `#0A0A0B`, lighter steps for surfaces).
- **Accents — Cameroon flag, used sparingly** as glows, gradients, thin highlights,
  never loud blocks: green `#007A5E` (`cdagreen`), red `#CE1126` (`cdared`),
  yellow `#FCD116` (`cdayellow`). Green is the primary accent; red is rare (alerts,
  single emphatic strokes); yellow for warm glows/highlights.
- **Typography**: one strong scale. Display = **Syne** (`font-display`) for headlines;
  body = **Space Grotesk** (`font-sans`). Both loaded via `next/font/google` in the
  root layout with CSS variables `--font-display` / `--font-sans`.
- **Utilities defined in `globals.css`**: `.glass` (glassmorphism card),
  `.noise` (grain overlay), `.text-gradient-cm` (flag-tinted gradient text).
- **The lion**: CDA's geometric lion motif appears subtly and repeatedly — low-opacity
  3D form in the hero particle field, silhouettes in section transitions, lion eyes as
  loading states. Present, felt, never cartoonish or clip-art.

## Bilingual (critical)

- **French is the default locale** (Cameroon market). Locales: `fr` (default), `en`.
- next-intl with `localePrefix: 'as-needed'` → `/` is French, `/en/...` is English.
- Language toggle (globe icon, FR/EN) in the navbar switches with a client-side
  navigation (no full reload); next-intl persists choice via the `NEXT_LOCALE` cookie.
- **Every string lives in `src/messages/fr.json` and `en.json`** — no hardcoded copy
  in components, ever. Write French first, then English. Add keys to both files in the
  same commit.
- French copy is real Cameroonian-market French — warm, direct, natural. Never
  machine-translated stiffness.

## Copy rules

- Human, confident, warm. Short sentences. Zero corporate-AI filler — no
  "In today's digital landscape…", no buzzword soup.
- **Strategy-tease rule**: service and industry copy shows *what's possible* and a
  glimpse of market insight, never the full playbook. Create curiosity, drive to the
  free strategy session ("We'll show you exactly how in your free strategy session.").
- Every page ends in a CTA. Primary CTA site-wide: **Book Free Strategy Session**.

## Performance & accessibility budget

- Lighthouse **90+ on mobile**. Mobile-first — most Cameroonian traffic is mobile,
  often low-bandwidth. Lazy-load all 3D and heavy assets; keep JS lean.
- `prefers-reduced-motion` respected everywhere: 3D degrades to static imagery,
  Framer Motion variants collapse to opacity-only (handled in `lib/motion.ts`).
- Contrast-checked palette, keyboard navigable, semantic HTML.
- SEO: full per-page metadata in both languages, OpenGraph images, schema.org
  `LocalBusiness` markup (Yaoundé), sitemap.

## Pages (build order)

1. Design system foundation (tokens, typography, motion presets) — **done first**
2. **Home** — R3F lion particle hero, stat counters, Power Offer, services grid with 3D
   icons, live "CDA in Action" dashboard ticker, industries carousel, testimonials
3. **Industries** — hub grid + one reusable dynamic template `/industries/[slug]`
   (15 niches: hospitality, beauty, interior design, schools, insurance, travel,
   finance/microfinance, construction, fashion/retail, manufacturing, gyms, automotive,
   laundry, legal, talent management). Each: industry-specific hook, service mapping
   with one flagship example, one classy mockup in a device frame, 90-day content plan
   preview, trust block, niche CTA form (niche dropdown + WhatsApp required + email
   optional).
4. **Services** — full stack (branding, digital strategy, social, content, email/SMS,
   experiential, billboard & LED TV — Yaoundé & Douala, 20+ carrefours, framed as
   exclusive; web dev, custom software, AI automation/chatbots, SEO/GEO/AEO explained
   in one plain line each, data analytics, IT consulting, e-invitations). Each service:
   3D icon, short human pitch, Book-a-session CTA.
5. **AI Agents** (flagship differentiator) — 3D node-orchestration hero, Virtual AI
   C-Suite (CSO, CMO, COO, CTO, CFO, CCO), positioned as premium/on-request only.
   This is CDA's moat.
6. **About** — narrative scroll (Findi's founder story, why Cameroon, why now),
   parallax, lion motif woven through.
7. **Resources** — interactive calculators (ROI, LTV, CAC, Churn) with animated
   real-time results + "Want us to improve this number?" CTA each.
8. **Blog** — clean editorial layout, category filters, reading time, MDX-ready.
9. **Booking/Contact** — Cal.com embed, fallback lead form (WhatsApp number required,
   validated for Cameroon `+237` format; email optional) → success animation +
   auto-open WhatsApp; FAQ accordion (pricing ranges, timelines, MTN MoMo / Orange
   Money payment, "do I need a website if I have Facebook?").

## Global components

- Sticky glass navbar: language toggle, animated underline links, always-visible
  "Book Session" button.
- Floating WhatsApp click-to-chat button, bottom-right, subtle pulse, site-wide.
- Framer Motion page transitions, subtle custom cursor (desktop only), scroll
  progress indicator.

## Conventions

- Client components only where interactivity demands it (`"use client"` at the leaf,
  not the page). Server components by default.
- Shared data (industries list, services list, nav items) lives in `src/lib/constants.ts`
  — never duplicated in components.
- `cn()` from `src/lib/utils.ts` for conditional classes.
- Commit style: short imperative subject, e.g. `Add industries hub grid`.
