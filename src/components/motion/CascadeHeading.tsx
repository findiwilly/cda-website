"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SplitType from "split-type";
import { animate, stagger as staggerDelay, useReducedMotion } from "motion/react";
import { dur, ease, stagger } from "@/lib/motion-tokens";

/**
 * Display heading with the `letterCascade` word reveal (split-type + tokens).
 * Splits on mount, hides words, cascades them in when scrolled into view,
 * reverts the split on unmount. Skips everything for reduced motion.
 */
export function CascadeHeading({
  as: Tag = "h2",
  children,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const [inView, setInView] = useState(false);
  const reduced = useReducedMotion();

  const setRef = useCallback((el: HTMLHeadingElement | null) => {
    ref.current = el;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "-80px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const split = new SplitType(el, { types: "words" });
    const words = split.words ?? [];
    words.forEach((w) => {
      w.style.display = "inline-block";
      w.style.opacity = "0";
      w.style.transform = "translateY(0.6em)";
    });

    let controls: ReturnType<typeof animate> | undefined;
    if (inView) {
      controls = animate(
        words,
        { opacity: 1, transform: "translateY(0)" },
        {
          duration: dur.base,
          ease: ease.out,
          delay: staggerDelay(stagger.tight),
        }
      );
    }

    return () => {
      controls?.stop();
      split.revert();
    };
  }, [inView, reduced]);

  return (
    <Tag ref={setRef} className={className}>
      {children}
    </Tag>
  );
}
