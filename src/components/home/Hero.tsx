"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import {
  clipReveal,
  fadeIn,
  fadeUp,
  staggerParentLoose,
} from "@/lib/motion-tokens";
import { heroScrollMix } from "@/lib/scroll-mix";
import { HeroScene } from "@/components/three/HeroScene";
import { Link } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import { waLink } from "@/lib/utils";

export function Hero() {
  const t = useTranslations("home.hero");
  const cta = useTranslations("cta");
  const common = useTranslations("common");
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Scroll scrub only — entrances are Motion variants below
  useGSAP(
    () => {
      if (reduced) return;
      // Feed scroll progress to the particle scene: lion → data streams
      const morph = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          heroScrollMix.current = self.progress;
        },
      });
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
        scale: 1.04,
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      return () => {
        morph.kill();
        heroScrollMix.current = 0;
      };
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
      <motion.div
        className="hero-lion absolute inset-0 lg:left-[32%]"
        initial={reduced ? "visible" : "hidden"}
        animate="visible"
        variants={fadeIn}
      >
        <HeroScene className="absolute inset-0" />
      </motion.div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-ink-950/45 lg:bg-gradient-to-r lg:from-ink-950 lg:via-ink-950/55 lg:to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-content flex-1 items-center px-6">
        <motion.div
          className="hero-copy max-w-3xl py-16"
          initial={reduced ? "visible" : "hidden"}
          animate="visible"
          variants={staggerParentLoose}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <span className="h-px w-10 shrink-0 bg-cdagreen-bright" />
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright sm:text-xs">
              {t("eyebrow")}
            </p>
          </motion.div>

          {/* The page's one cinematic moment */}
          <motion.h1
            variants={clipReveal}
            className="mt-8 font-display text-display-lg font-bold text-ink-50"
          >
            {t.rich("title", {
              accent: (chunks) => (
                <span className="text-gradient-cm">{chunks}</span>
              ),
            })}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-lg text-base leading-relaxed text-ink-300 sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <a
              href={waLink(SITE.whatsappNumber, common("waPrefill"))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
            >
              {cta("bookFreeSession")}
            </a>
            <Link
              href="/industries"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-ink-100 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
            >
              {cta("exploreIndustries")}
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-12 text-[0.65rem] uppercase tracking-[0.3em] text-ink-400 sm:text-xs"
          >
            {t("proof")}
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 flex justify-center pb-8"
        initial={reduced ? "visible" : "hidden"}
        animate="visible"
        variants={fadeIn}
      >
        <a
          href="#services"
          aria-label="↓"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink-300 transition-colors hover:border-white/30 hover:text-white"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
