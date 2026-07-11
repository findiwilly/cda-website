import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Sparkle, Users } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { LeadForm } from "@/components/ui/LeadForm";
import { SERVICE_ICONS } from "@/components/ui/service-icons";
import {
  INDUSTRY_CORE_SERVICES,
  INDUSTRY_SLUGS,
  type IndustrySlug,
} from "@/lib/constants";

export function generateStaticParams() {
  return INDUSTRY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  if (!INDUSTRY_SLUGS.includes(slug as IndustrySlug)) return {};
  const t = await getTranslations({ locale, namespace: "industries" });
  return { title: t(`${slug}.name`), description: t(`${slug}.hook`) };
}

export default function IndustryPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  if (!INDUSTRY_SLUGS.includes(slug as IndustrySlug)) notFound();
  setRequestLocale(locale);
  const industry = slug as IndustrySlug;

  return (
    <main className="pt-[72px]">
      <IndustryHero industry={industry} />
      <Transform industry={industry} />
      <Plan />
      <Trust industry={industry} />
    </main>
  );
}

function IndustryHero({ industry }: { industry: IndustrySlug }) {
  const ind = useTranslations("industries");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-24 h-[26rem] w-[26rem] rounded-full bg-cdagreen/15 blur-[130px]"
      />
      <div className="mx-auto max-w-content px-6 pb-16 pt-20 sm:pt-28">
        <SectionHeader
          as="h1"
          eyebrow={ind(`${industry}.name`)}
          title={ind(`${industry}.hook`)}
        />
      </div>
    </section>
  );
}

function Transform({ industry }: { industry: IndustrySlug }) {
  const t = useTranslations("industryPage");
  const ind = useTranslations("industries");
  const s = useTranslations("services");

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <div className="grid items-center gap-14 lg:grid-cols-[3fr_2fr]">
        <div>
          <SectionHeader eyebrow={t("servicesTitle")} title={t("transformTitle")} />

          <Stagger className="mt-10 grid gap-3 sm:grid-cols-2">
            {INDUSTRY_CORE_SERVICES.map((slug) => {
              const Icon = SERVICE_ICONS[slug];
              return (
                <StaggerItem key={slug}>
                  <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/40 px-4 py-3">
                    <Icon className="h-4 w-4 shrink-0 text-cdagreen-bright" />
                    <span className="text-sm text-ink-100">{s(`${slug}.name`)}</span>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal className="mt-10">
            <div className="rounded-2xl border-l-2 border-cdayellow/60 bg-ink-900/40 p-6">
              <p className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-cdayellow">
                <Sparkle className="h-3.5 w-3.5" />
                {t("flagshipLabel")}
              </p>
              <p className="mt-3 text-lg leading-relaxed text-ink-100">
                {ind(`${industry}.flagship`)}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal className="hidden lg:block">
          <PhoneMockup title={ind(`${industry}.name`)} />
        </Reveal>
      </div>
    </section>
  );
}

function Plan() {
  const t = useTranslations("industryPage");

  return (
    <section className="border-y border-white/5 bg-ink-900/30">
      <div className="mx-auto max-w-content px-6 py-section">
        <SectionHeader eyebrow={t("planSubtitle")} title={t("planTitle")} />

        <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
          {(["p1", "p2", "p3"] as const).map((phase, i) => (
            <StaggerItem key={phase} className="h-full">
              <div className="glass h-full rounded-2xl p-7">
                <span className="font-display text-4xl font-bold text-ink-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-50">
                  {t(`${phase}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  {t(`${phase}.desc`)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Trust({ industry }: { industry: IndustrySlug }) {
  const t = useTranslations("industryPage");

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="inline-flex rounded-xl bg-cdagreen/10 p-3 ring-1 ring-cdagreen/20">
              <Users className="h-6 w-6 text-cdagreen-bright" />
            </span>
          </Reveal>
          <SectionHeader eyebrow={t("formSubtitle")} title={t("trustTitle")} />
          <Reveal>
            <p className="mt-4 max-w-md text-ink-300">{t("trustBody")}</p>
          </Reveal>
          <Reveal>
            <h3 className="mt-10 font-display text-xl font-semibold text-ink-50">
              {t("formTitle")}
            </h3>
          </Reveal>
        </div>

        <Reveal>
          <LeadForm defaultNiche={industry} />
        </Reveal>
      </div>
    </section>
  );
}
