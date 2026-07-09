"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { HeroScene } from "@/components/three/HeroScene";
import { SITE } from "@/lib/constants";
import { waLink } from "@/lib/utils";

export function Hero() {
  const t = useTranslations("home.hero");
  const cta = useTranslations("cta");
  const common = useTranslations("common");
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      const split = SplitText.create(".hero-title", {
        type: "lines,chars",
        mask: "lines",
      });

      // The flag gradient can't survive per-char splitting (background-clip
      // stops at each wrapper), so paint the accent letter by letter instead.
      const accent = split.chars.filter((c) =>
        (c as HTMLElement).closest(".hero-accent")
      );
      const ramp = gsap.utils.interpolate(["#00C08B", "#FCD116", "#E0442E"]);
      document.querySelector(".hero-accent")?.classList.remove("text-gradient-cm");
      accent.forEach((c, i) => {
        (c as HTMLElement).style.color = ramp(
          i / Math.max(accent.length - 1, 1)
        );
      });

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .fromTo(
          ".hero-rule",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, transformOrigin: "left center" },
          0.15
        )
        .fromTo(
          ".hero-eyebrow",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          0.3
        )
        .from(
          split.chars,
          { yPercent: 115, duration: 1.05, stagger: 0.013 },
          0.45
        )
        .fromTo(
          ".hero-sub",
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          "-=0.55"
        )
        .fromTo(
          ".hero-cta",
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 },
          "-=0.5"
        )
        .fromTo(".hero-proof", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, "-=0.3")
        .fromTo(".hero-cue", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, "-=0.5");

      // Scroll: copy drifts away, lion breathes closer
      gsap.to(".hero-copy", {
        yPercent: -14,
        autoAlpha: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "75% top",
          scrub: true,
        },
      });
      gsap.to(".hero-lion", {
        scale: 1.08,
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section
      ref={root}
      className="relative flex min-h-dvh flex-col overflow-hidden pt-[72px]"
    >
      {/* Flag-color glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-44 top-1/3 h-[30rem] w-[30rem] rounded-full bg-cdagreen/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-36 -top-28 h-[28rem] w-[28rem] rounded-full bg-cdayellow/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 right-[6%] h-56 w-56 rounded-full bg-cdared/10 blur-[110px]"
      />

      {/* Editorial hairlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mx-auto hidden max-w-content justify-between px-6 lg:flex"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="h-full w-px bg-white/[0.03]" />
        ))}
      </div>

      {/* Lion — right of center on desktop, behind the copy on mobile */}
      <div className="hero-lion absolute inset-0 lg:left-[32%]">
        <HeroScene className="absolute inset-0" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-ink-950/45 lg:bg-gradient-to-r lg:from-ink-950 lg:via-ink-950/55 lg:to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-content flex-1 items-center px-6">
        <div className="hero-copy max-w-3xl py-16">
          <div className="flex items-center gap-4">
            <span className="hero-rule h-px w-10 shrink-0 bg-cdagreen-bright" />
            <p className="hero-eyebrow text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright sm:text-xs">
              {t("eyebrow")}
            </p>
          </div>

          <h1 className="hero-title mt-8 font-display text-display-lg font-bold text-ink-50">
            {t.rich("title", {
              accent: (chunks) => (
                <span className="hero-accent text-gradient-cm">{chunks}</span>
              ),
            })}
          </h1>

          <p className="hero-sub mt-7 max-w-lg text-base leading-relaxed text-ink-300 sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={waLink(SITE.whatsappNumber, common("waPrefill"))}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta inline-flex items-center justify-center rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
            >
              {cta("bookFreeSession")}
            </a>
            <a
              href="#industries"
              className="hero-cta inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-ink-100 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
            >
              {cta("exploreIndustries")}
            </a>
          </div>

          <p className="hero-proof mt-12 text-[0.65rem] uppercase tracking-[0.3em] text-ink-400 sm:text-xs">
            {t("proof")}
          </p>
        </div>
      </div>

      <div className="hero-cue relative z-10 flex justify-center pb-8">
        <a
          href="#services"
          aria-label="↓"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink-300 transition-colors hover:border-white/30 hover:text-white"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
}
