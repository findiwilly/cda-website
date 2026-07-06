import type { Variants } from "framer-motion";

/**
 * Shared motion presets — the single source of animation truth.
 * Always compose from these instead of inlining variants in components,
 * so the whole site moves with one voice.
 *
 * Reduced motion: wrap pages in <MotionConfig reducedMotion="user"> (done in
 * the page transition shell once it exists) so these transforms collapse to
 * opacity-only for users who ask for it.
 */

// Apple-ish easings — mirrored as Tailwind's ease-out-expo / ease-in-out-smooth
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  fast: 0.4,
  base: 0.7,
  slow: 1.1,
} as const;

/** Default viewport config for whileInView reveals */
export const VIEWPORT = { once: true, margin: "-80px" } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

/** Parent for staggered children — pair children with fadeUp/scaleIn */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

/** Page transition (used by the Framer Motion page shell) */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.fast, ease: EASE },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: EASE_IN_OUT },
  },
};
