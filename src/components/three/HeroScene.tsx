"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LionParticles = dynamic(() => import("./LionParticles"), { ssr: false });

function starPoints(cx: number, cy: number, spikes: number, rOuter: number, rInner: number) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Static geometric lion — shown for prefers-reduced-motion and while 3D loads */
function LionFallback({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center", className)}>
      <svg viewBox="0 0 240 240" className="h-[68vmin] w-[68vmin] max-h-full">
        <polygon points={starPoints(120, 112, 14, 104, 78)} fill="rgba(0,166,126,0.10)" />
        <circle cx="120" cy="116" r="54" fill="rgba(0,166,126,0.16)" />
        <circle cx="100" cy="108" r="6" fill="#FCD116" opacity="0.75" />
        <circle cx="140" cy="108" r="6" fill="#FCD116" opacity="0.75" />
        <polygon points="111,134 129,134 120,146" fill="#0A0A0B" />
      </svg>
    </div>
  );
}

/**
 * Lazy 3D mount: waits for the section to intersect the viewport, skips 3D
 * entirely for prefers-reduced-motion, and cross-fades from the static
 * fallback once the canvas is on screen.
 */
export function HeroScene({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show3d, setShow3d] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow3d(true);
          io.disconnect();
        }
      },
      { rootMargin: "160px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("pointer-events-none", className)} aria-hidden>
      <LionFallback
        className={cn(
          "transition-opacity duration-1000 ease-out-expo",
          show3d ? "opacity-0" : "opacity-100"
        )}
      />
      {show3d && (
        <div className="absolute inset-0 animate-[lion-in_1.2s_ease-out_both]">
          <LionParticles />
        </div>
      )}
    </div>
  );
}
