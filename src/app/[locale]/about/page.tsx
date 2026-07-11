import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { StoryParallax } from "@/components/about/StoryParallax";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE } from "@/lib/constants";
import { waLink } from "@/lib/utils";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "about.hero" });
  return { title: t("title"), description: t("subtitle") };
}

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="pt-[72px]">
      <AboutHero />
      <Story />
      <Pillars />
      <PageCta />
    </main>
  );
}

function AboutHero() {
  const t = useTranslations("about.hero");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdagreen/15 blur-[130px]"
      />
      <div className="mx-auto max-w-content px-6 pb-8 pt-20 sm:pt-28">
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

function Story() {
  const t = useTranslations("about.story");

  return (
    <StoryParallax>
      <div className="mx-auto max-w-content px-6 py-section">
        <div className="flex flex-col gap-16">
          {(["p1", "p2", "p3", "p4"] as const).map((key, i) => (
            <Reveal
              key={key}
              className={cn("max-w-2xl", i % 2 === 1 && "lg:ml-auto")}
            >
              <p
                className={cn(
                  "border-l-2 pl-6 text-xl leading-relaxed text-ink-100 sm:text-2xl",
                  i === 3 ? "border-cdayellow/60 font-medium text-ink-50" : "border-cdagreen/40"
                )}
              >
                {t(key)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </StoryParallax>
  );
}

function Pillars() {
  const t = useTranslations("about.pillars");

  return (
    <section className="border-y border-white/5 bg-ink-900/30">
      <div className="mx-auto max-w-content px-6 py-section">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["purpose", "vision", "mission", "values"] as const).map((key, i) => (
            <StaggerItem key={key} className="h-full">
              <div className="glass h-full rounded-2xl p-7">
                <span className="font-display text-sm font-semibold text-ink-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink-50">
                  {t(`${key}.title`)}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-300">
                  {t(`${key}.body`)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function PageCta() {
  const cta = useTranslations("cta");
  const common = useTranslations("common");

  return (
    <Reveal className="mx-auto flex max-w-3xl flex-col items-center px-6 py-section text-center">
      <a
        href={waLink(SITE.whatsappNumber, common("waPrefill"))}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 rounded-full bg-cdagreen px-8 py-4 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
      >
        <MessageCircle className="h-4 w-4" />
        {cta("bookFreeSession")}
      </a>
    </Reveal>
  );
}
