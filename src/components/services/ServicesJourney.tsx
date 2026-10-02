"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { ServiceSlug } from "@/lib/constants";
import { SERVICE_SLUGS } from "@/lib/constants";
import { SERVICE_ICONS } from "@/components/ui/service-icons";

const HERO_BG: Record<string, string> = {
  branding: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "digital-strategy": "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "social-media-marketing": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "content-marketing": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "email-sms-marketing": "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "experiential-marketing": "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "billboard-led-advertising": "https://images.unsplash.com/photo-1510274642460-65a8de5e52e9?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "web-development": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "custom-software": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "ai-automation": "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "seo-geo-aeo": "https://images.unsplash.com/photo-1562577309-2592ab84b1bc?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "data-analytics": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "it-consulting": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "network-systems": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  cctv: "https://images.unsplash.com/photo-1584291527908-033f4d6542c8?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  iot: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "it-maintenance": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "it-consultancy": "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "e-invitations": "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

export function ServicesJourney() {
  const t = useTranslations("services");
  const [active, setActive] = useState<ServiceSlug>("branding");
  const bg = HERO_BG[active] || HERO_BG.branding;
  const Icon = SERVICE_ICONS[active];
  const title = t(`${active}.name`);
  const desc = t(`${active}.pitch`);

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="absolute inset-0 -z-10">
        <Image
          src={bg}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-[1px]" />
      </div>

      <section className="flex flex-1 flex-col justify-center px-6 py-10 md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <p className="eyebrow text-ink-200">{t("intro.eyebrow")}</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-50 sm:text-4xl md:text-5xl lg:text-6xl">
            {t("intro.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-200 sm:text-lg">
            {t("intro.subtitle")}
          </p>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <div className="flex-1">
              <div className="glass rounded-3xl border border-white/10 p-6 sm:p-8 md:p-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cdagreen/20 text-cdagreen ring-1 ring-cdagreen/40">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-semibold text-ink-50 sm:text-3xl md:text-4xl">
                    {title}
                  </h2>
                </div>
                <p className="mt-4 text-base text-ink-200 sm:text-lg md:text-xl">
                  {desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-ink-950/70 px-6 py-8 backdrop-blur md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <h3 className="text-sm uppercase tracking-widest text-ink-400">
            {t("intro.eyebrow")} — {t("intro.title")}
          </h3>
          <p className="mt-2 text-sm text-ink-300">{t("intro.subtitle")}</p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {SERVICE_SLUGS.map((slug, idx) => {
              const SIcon = SERVICE_ICONS[slug];
              const activeCls = active === slug ? "bg-white/20 ring-2 ring-cdagreen/60" : "hover:bg-white/10";
              return (
                <button
                  key={slug}
                  onClick={() => setActive(slug)}
                  className={`flex items-center gap-3 rounded-2xl border border-white/10 p-3 text-left transition ${activeCls}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cdagreen/20 text-cdagreen ring-1 ring-cdagreen/40">
                    <SIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ink-400">0{idx + 1}</p>
                    <p className="line-clamp-2 text-sm font-medium text-ink-50">
                      {t(`${slug}.name`)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}