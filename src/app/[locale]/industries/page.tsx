import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Link } from "@/i18n/routing";
import { INDUSTRY_SLUGS } from "@/lib/constants";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "industries.intro" });
  return { title: t("title"), description: t("subtitle") };
}

export default function IndustriesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="pt-[72px]">
      <Intro />
      <Grid />
    </main>
  );
}

function Intro() {
  const t = useTranslations("industries.intro");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdayellow/10 blur-[130px]"
      />
      <div className="mx-auto max-w-content px-6 pb-4 pt-20 sm:pt-28">
        <SectionHeader
          as="h1"
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
      </div>
    </section>
  );
}

function Grid() {
  const ind = useTranslations("industries");

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRY_SLUGS.map((slug, i) => (
          <StaggerItem key={slug} className="h-full">
            <Link
              href={`/industries/${slug}`}
              className="glass group flex h-full flex-col rounded-2xl p-7 transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-cdagreen/40"
            >
              <span className="font-display text-sm font-semibold text-ink-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink-50">
                {ind(`${slug}.name`)}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-300">
                {ind(`${slug}.hook`)}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-cdagreen-bright">
                {ind("discover")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
