"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

function starPoints(cx: number, cy: number, spikes: number, rOuter: number, rInner: number) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}

/**
 * Wraps the founder story with a slow parallax lion watermark —
 * scroll-scrubbed (GSAP's lane), disabled for reduced motion.
 */
export function StoryParallax({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.to(".story-lion", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section ref={root} className="relative overflow-hidden">
      <div
        aria-hidden
        className="story-lion pointer-events-none absolute right-[-8rem] top-1/4 hidden lg:block"
      >
        <svg viewBox="0 0 240 240" className="h-[34rem] w-[34rem] opacity-[0.05]">
          <polygon points={starPoints(120, 112, 14, 104, 78)} fill="#00C08B" />
          <circle cx="120" cy="116" r="54" fill="#0A0A0B" />
          <circle cx="100" cy="108" r="6" fill="#FCD116" />
          <circle cx="140" cy="108" r="6" fill="#FCD116" />
        </svg>
      </div>
      {children}
    </section>
  );
}
