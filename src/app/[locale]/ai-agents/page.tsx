import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Lock, MessageCircle } from "lucide-react";
import { AgentConstellation } from "@/components/ui/AgentConstellation";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE } from "@/lib/constants";
import { waLink } from "@/lib/utils";

const AGENTS = ["cso", "cmo", "coo", "cto", "cfo", "cco"] as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "aiAgents.hero" });
  return { title: t("title"), description: t("subtitle") };
}

export default function AiAgentsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="pt-[72px]">
      <AgentsHero />
      <Exclusive />
      <AgentsGrid />
      <How />
      <PageCta />
    </main>
  );
}

function AgentsHero() {
  const t = useTranslations("aiAgents.hero");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-20 h-[30rem] w-[36rem] -translate-x-1/2 rounded-full bg-cdagreen/12 blur-[140px]"
      />
      <div className="relative mx-auto max-w-content px-6 pt-20 sm:pt-28">
        <SectionHeader
          as="h1"
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />
        <div className="mt-8">
          <AgentConstellation />
        </div>
      </div>
    </section>
  );
}

function Exclusive() {
  const t = useTranslations("aiAgents.exclusive");

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <Reveal>
        <div className="rounded-3xl bg-gradient-to-br from-cdayellow/30 via-white/5 to-cdagreen/25 p-px">
          <div className="glass noise relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <span className="inline-flex shrink-0 rounded-xl bg-cdayellow/10 p-3 ring-1 ring-cdayellow/25">
                <Lock className="h-6 w-6 text-cdayellow" />
              </span>
              <div>
                <h2 className="font-display text-display-sm font-bold text-ink-50">
                  {t("title")}
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-ink-300">
                  {t("body")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function AgentsGrid() {
  const t = useTranslations("aiAgents.agents");

  return (
    <section className="mx-auto max-w-content px-6 pb-section">
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((key) => (
          <StaggerItem key={key} className="h-full">
            <article className="glass h-full rounded-2xl p-7 transition-colors duration-300 hover:border-cdagreen/40">
              <span className="font-display text-2xl font-bold text-cdagreen-bright">
                {key.toUpperCase()}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink-50">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">
                {t(`${key}.desc`)}
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function How() {
  const t = useTranslations("aiAgents.how");

  return (
    <section className="border-y border-white/5 bg-ink-900/30">
      <div className="mx-auto max-w-content px-6 py-section">
        <SectionHeader eyebrow="Co-pilot" title={t("title")} />
        <Reveal className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-ink-200">
          <p>{t("p1")}</p>
          <p className="font-medium text-ink-50">{t("p2")}</p>
        </Reveal>
      </div>
    </section>
  );
}

function PageCta() {
  const t = useTranslations("aiAgents.cta");
  const cta = useTranslations("cta");
  const common = useTranslations("common");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cdagreen/15 blur-[120px]"
      />
      <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-section text-center">
        <h2 className="font-display text-display-md font-bold text-ink-50">
          {t("title")}
        </h2>
        <p className="mt-4 text-ink-300">{t("subtitle")}</p>
        <a
          href={waLink(SITE.whatsappNumber, common("waPrefill"))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-cdagreen px-8 py-4 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
        >
          <MessageCircle className="h-4 w-4" />
          {cta("requestDeployment")}
        </a>
      </Reveal>
    </section>
  );
}
