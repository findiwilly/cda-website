// ============================================================
// CDA MOTION TOKENS — The Animation Constitution
// Every animation on the site imports from this file.
// No inline one-off animations. Ever.
// Voice: slow, confident, expensive. Motion whispers.
// ============================================================

// ---------- EASING CURVES (the accent of the brand) ----------
export const ease = {
  // Primary: "expo-out" — fast start, long luxurious settle.
  // Used for ALL entrances. This curve IS the CDA feel.
  out: [0.16, 1, 0.3, 1] as const,

  // Exits: quicker, quieter. Things leave without drama.
  in: [0.55, 0, 1, 0.45] as const,

  // In-out: for elements that move from A to B on screen
  // (layout shifts, page transitions, accordion panels)
  inOut: [0.65, 0, 0.35, 1] as const,

  // GSAP string equivalents (ScrollTrigger timelines)
  gsapOut: 'expo.out',
  gsapInOut: 'power3.inOut',
} as const;

// ---------- DURATIONS (seconds) ----------
export const dur = {
  fast: 0.3,      // micro-interactions: hovers, toggles, button states
  base: 0.6,      // standard entrances: cards, text blocks
  slow: 0.9,      // section reveals, images
  cinematic: 1.2, // hero moments ONLY — one per page maximum
  exit: 0.3,      // exits are always faster than entrances
} as const;

// ---------- STAGGER ----------
export const stagger = {
  tight: 0.05,  // letters, small icons
  base: 0.08,   // list items, cards in a grid
  loose: 0.15,  // large sections arriving in sequence
} as const;

// ---------- DISTANCES ----------
// Nothing travels more than 24px on entrance. Subtle > dramatic.
export const dist = {
  y: 24,   // standard fade-up distance
  ySm: 12, // small elements (captions, labels)
  scale: 0.96, // scaleIn starting point — barely perceptible
} as const;

// ============================================================
// MOTION VARIANTS (for `motion` components)
// Usage: <motion.div variants={fadeUp} initial="hidden"
//          whileInView="visible" viewport={viewportOnce} />
// ============================================================

export const viewportOnce = { once: true, margin: '-80px' } as const;

export const fadeUp = {
  hidden: { opacity: 0, y: dist.y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.base, ease: ease.out },
  },
} as const;

export const fadeUpSlow = {
  hidden: { opacity: 0, y: dist.y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.slow, ease: ease.out },
  },
} as const;

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: dur.base, ease: ease.out },
  },
} as const;

export const scaleIn = {
  hidden: { opacity: 0, scale: dist.scale },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: dur.slow, ease: ease.out },
  },
} as const;

// Parent wrapper that staggers its children
export const staggerParent = {
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger.base, delayChildren: 0.1 },
  },
} as const;

export const staggerParentLoose = {
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger.loose, delayChildren: 0.15 },
  },
} as const;

// Letter/word cascade — pair with split-type.
// Apply to each char/word span produced by SplitType.
export const letterCascade = {
  hidden: { opacity: 0, y: '0.6em' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.base, ease: ease.out },
  },
} as const;

// Clip reveal — text/images unveiled as if a curtain lifts.
// The most "expensive-feeling" entrance in the kit. Use sparingly.
export const clipReveal = {
  hidden: { clipPath: 'inset(0 0 100% 0)', y: 12 },
  visible: {
    clipPath: 'inset(0 0 0% 0)',
    y: 0,
    transition: { duration: dur.cinematic, ease: ease.out },
  },
} as const;

// SVG stroke draw (constellations, diagrams) — a page's cinematic
// moment when used; pair with fadeIn nodes inside a staggerParent.
export const drawLine = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: dur.cinematic, ease: ease.out },
  },
} as const;

// Dropdown/overlay panels (mobile menu). Enters from just above its
// resting spot; exits quicker and quieter, per house rule 2.
export const dropIn = {
  hidden: { opacity: 0, y: -dist.ySm },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.fast, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -dist.ySm,
    transition: { duration: dur.exit, ease: ease.in },
  },
} as const;

// Hover states (buttons, cards). Transform + opacity ONLY.
export const hoverLift = {
  rest: { y: 0, transition: { duration: dur.fast, ease: ease.out } },
  hover: { y: -4, transition: { duration: dur.fast, ease: ease.out } },
} as const;

// ============================================================
// HOUSE RULES (enforced — see CLAUDE.md motion section)
// 1. Only `transform` and `opacity` are animated. Never
//    width/height/top/left/margin (layout thrash = jank).
// 2. Entrances stagger; exits are faster than entrances.
// 3. Max ONE cinematic moment per page. Everything else whispers.
// 4. Every scroll animation respects prefers-reduced-motion
//    and Mode Léger (reduced-data): render final state instantly.
// 5. Nothing travels more than 24px or scales more than 4%.
// 6. whileInView uses viewportOnce — animations play once,
//    never on every scroll pass. Repetition cheapens.
// ============================================================

// Reduced-motion helper — wrap variants at the layout level:
// const prefersReduced = useReducedMotion();
// if (prefersReduced) -> pass `visible` as initial (no animation).
