import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register once on the client; safe no-op during SSR module evaluation.
// GSAP's role here: pinned sections and scroll-scrubbed timelines ONLY —
// component entrances belong to `motion` + src/lib/motion-tokens.ts.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
