"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { SERVICE_ICONS } from "@/components/ui/service-icons";

/**
 * The Services page's cinematic moment: a pinned horizontal journey through
 * the three service families (desktop, motion-tolerant users only — mobile
 * and reduced-motion get the same panels stacked normally).
 */
export function ServicesJourney() {
  const t = useTranslations("services");
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const amount = () =>
            track.current!.scrollWidth - container.current!.clientWidth;
          gsap.to(track.current, {
            x: () => -amount(),
            ease: "none",
            scrollTrigger: {
              trigger: container.current,
              start: "top top",
              end: () => "+=" + amount(),
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }
      );
      return () => mm.revert();
    },
    { scope: container }
  );

  return (
    <div ref={container} className="overflow-hidden">
      <div
        ref={track}
        className="flex flex-col gap-6 px-6 lg:h-dvh lg:w-max lg:flex-row lg:items-center lg:gap-8 lg:px-[10vw] lg:pt-[72px]"
      >
        {SERVICE_CATEGORIES.map((category, i) => (
          <article
            key={category.key}
            className="glass noise relative w-full shrink-0 overflow-hidden rounded-3xl p-8 sm:p-12 lg:w-[62vw] lg:max-w-3xl"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cdagreen/10 blur-[90px]"
            />
            <span className="font-display text-sm font-semibold text-ink-600">
              {String(i + 1).padStart(2, "0")} / 03
            </span>
            <h2 className="mt-4 font-display text-display-sm font-bold text-ink-50">
              {t(`categories.${category.key}`)}
            </h2>
            <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {category.slugs.map((slug) => {
                const Icon = SERVICE_ICONS[slug];
                return (
                  <li key={slug} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cdagreen/10 ring-1 ring-cdagreen/20">
                      <Icon className="h-4.5 w-4.5 h-[18px] w-[18px] text-cdagreen-bright" />
                    </span>
                    <span className="text-sm text-ink-100">
                      {t(`${slug}.name`)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
