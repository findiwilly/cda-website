/**
 * Shared scroll-progress channel between the Hero's ScrollTrigger (light
 * bundle) and the lazily loaded LionParticles scene (three.js bundle).
 * A module singleton keeps the two decoupled so importing it never drags
 * three.js into the main bundle.
 */
export const heroScrollMix = { current: 0 };
