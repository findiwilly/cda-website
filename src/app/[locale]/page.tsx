import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Check, MessageCircle, Zap } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { Counter } from "@/components/motion/Counter";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SERVICE_ICONS } from "@/components/ui/service-icons";
import { Link } from "@/i18n/routing";
import {
  FEATURED_SERVICES,
  HOME_STATS,
  INDUSTRY_SLUGS,
  SITE,
} from "@/lib/constants";
import { waLink } from "@/lib/utils";

export default function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main>
      <Hero />
      <Ticker />
      <Stats />
      <PowerOffer />
      <ServicesSection />
      <IndustriesSection />
      <Testimonials />
      <FinalCta />
    </main>
  );
}

function Stats() {
  const t = useTranslations("home.stats");

  return (
    <section className="relative">
      <Stagger className="mx-auto grid max-w-content grid-cols-1 gap-10 px-6 py-20 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/5">
        {HOME_STATS.map((stat) => (
          <StaggerItem key={stat.key} className="text-center">
            <Counter
              value={stat.value}
              suffix={stat.suffix}
              className="font-display text-display-md font-bold text-ink-50"
            />
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-ink-400">
              {t(stat.key)}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function PowerOffer() {
  const t = useTranslations("home.powerOffer");
  const cta = useTranslations("cta");
  const common = useTranslations("common");
  const bullets = ["b1", "b2", "b3", "b4"] as const;

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <Reveal>
        <div className="rounded-3xl bg-gradient-to-br from-cdagreen/40 via-white/5 to-cdayellow/25 p-px">
          <div className="glass noise relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cdagreen/15 blur-[100px]"
            />
            <div className="relative grid gap-12 lg:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-cdayellow sm:text-xs">
                  <Zap className="h-3.5 w-3.5" />
                  {t("eyebrow")}
                </p>
                <h2 className="mt-5 font-display text-display-sm font-bold text-ink-50 sm:text-display-md">
                  {t("title")}
                </h2>
                <p className="mt-6 text-sm font-medium text-cdayellow/90">
                  {t("note")}
                </p>
                <a
                  href={waLink(SITE.whatsappNumber, common("waPrefill"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
                >
                  {cta("bookFreeSession")}
                </a>
              </div>
              <ul className="flex flex-col justify-center gap-5">
                {bullets.map((key) => (
                  <li key={key} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cdagreen/15 ring-1 ring-cdagreen/30">
                      <Check className="h-3.5 w-3.5 text-cdagreen-bright" />
                    </span>
                    <span className="text-ink-100">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function ServicesSection() {
  const t = useTranslations("home.services");
  const s = useTranslations("services");

  return (
    <section id="services" className="mx-auto max-w-content scroll-mt-20 px-6 py-section">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_SERVICES.map((slug, i) => {
          const Icon = SERVICE_ICONS[slug];
          return (
            <StaggerItem key={slug} className="h-full">
              <Link
                href="/services"
                className="glass group relative block h-full rounded-2xl p-7 transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-cdagreen/40"
              >
                <span className="absolute right-6 top-6 font-display text-sm font-semibold text-ink-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="inline-flex rounded-xl bg-cdagreen/10 p-3 ring-1 ring-cdagreen/20 transition-transform duration-300 ease-out-expo group-hover:scale-110">
                  <Icon className="h-6 w-6 text-cdagreen-bright" />
                </span>
                <h3 className="mt-6 font-display text-lg font-semibold text-ink-50">
                  {s(`${slug}.name`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  {s(`${slug}.pitch`)}
                </p>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Reveal className="mt-12 text-center">
        <Link
          href="/services"
          className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-ink-100 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
        >
          {t("viewAll")}
        </Link>
      </Reveal>
    </section>
  );
}

function IndustriesSection() {
  const t = useTranslations("home.industriesPreview");
  const ind = useTranslations("industries");

  return (
    <section id="industries" className="scroll-mt-20 overflow-hidden py-section">
      <div className="mx-auto max-w-content px-6">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      </div>

      <Reveal className="mt-12">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 [scrollbar-width:thin] sm:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          {INDUSTRY_SLUGS.map((slug, i) => (
            <Link
              key={slug}
              href={`/industries/${slug}`}
              className="glass block w-[17rem] shrink-0 snap-start rounded-2xl p-6 transition-colors duration-300 hover:border-cdayellow/30"
            >
              <span className="font-display text-sm font-semibold text-ink-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-ink-50">
                {ind(`${slug}.name`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                {ind(`${slug}.hook`)}
              </p>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-6 text-center">
        <Link
          href="/industries"
          className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-ink-100 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
        >
          {t("viewAll")}
        </Link>
      </Reveal>
    </section>
  );
}

function Testimonials() {
  const t = useTranslations("home.testimonials");

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

      <Stagger className="mt-14 grid gap-4 md:grid-cols-3">
        {(["t1", "t2", "t3"] as const).map((key) => (
          <StaggerItem key={key} className="h-full">
            <figure className="glass flex h-full flex-col rounded-2xl p-8">
              <span
                aria-hidden
                className="font-display text-5xl font-bold leading-none text-cdagreen-bright"
              >
                “
              </span>
              <blockquote className="mt-3 flex-1 leading-relaxed text-ink-100">
                {t(`${key}.quote`)}
              </blockquote>
              <figcaption className="mt-6 border-l-2 border-cdagreen/40 pl-4">
                <p className="text-sm font-semibold text-ink-50">{t(`${key}.name`)}</p>
                <p className="mt-0.5 text-xs text-ink-400">{t(`${key}.role`)}</p>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function FinalCta() {
  const t = useTranslations("home.finalCta");
  const cta = useTranslations("cta");
  const common = useTranslations("common");

  return (
    <section id="contact" className="relative scroll-mt-20 overflow-hidden border-t border-white/5">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cdagreen/15 blur-[130px]"
      />
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-section text-center">
        <h2 className="font-display text-display-lg font-bold text-ink-50">
          {t("title")}
        </h2>
        <p className="mt-6 max-w-xl text-ink-300">{t("subtitle")}</p>
        <a
          href={waLink(SITE.whatsappNumber, common("waPrefill"))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-cdagreen px-8 py-4 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
        >
          <MessageCircle className="h-4 w-4" />
          {cta("bookFreeSession")}
        </a>
        <p className="mt-6 text-sm text-ink-400">
          WhatsApp · <span className="text-ink-200">+237 6 50 07 78 12</span>
        </p>
      </Reveal>
    </section>
  );
}
