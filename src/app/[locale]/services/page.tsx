import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { ServicesJourney } from "@/components/services/ServicesJourney";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SERVICE_ICONS } from "@/components/ui/service-icons";
import { SERVICE_SLUGS, SITE } from "@/lib/constants";
import { waLink } from "@/lib/utils";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "services.intro" });
  return { title: t("title"), description: t("subtitle") };
}

export default function ServicesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="pt-[72px]">
      <Intro />
      <ServicesJourney />
      <AllServices />
      <PageCta />
    </main>
  );
}

function Intro() {
  const t = useTranslations("services.intro");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-20 h-[26rem] w-[26rem] rounded-full bg-cdagreen/15 blur-[130px]"
      />
      <div className="mx-auto max-w-content px-6 pb-16 pt-20 sm:pt-28">
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

function AllServices() {
  const s = useTranslations("services");

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_SLUGS.map((slug, i) => {
          const Icon = SERVICE_ICONS[slug];
          return (
            <StaggerItem key={slug} className="h-full">
              <article className="glass group relative h-full rounded-2xl p-7 transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-cdagreen/40">
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
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Reveal className="mt-10">
        <p className="text-center text-sm text-ink-400">{s("intro.tease")}</p>
      </Reveal>
    </section>
  );
}

function PageCta() {
  const cta = useTranslations("cta");
  const common = useTranslations("common");

  return (
    <section className="border-t border-white/5">
      <Reveal className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
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
    </section>
  );
}
