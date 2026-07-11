import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

const POSTS = ["p1", "p2", "p3"] as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "blog.intro" });
  return { title: t("title"), description: t("subtitle") };
}

export default function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="pt-[72px]">
      <Intro />
      <Posts />
    </main>
  );
}

function Intro() {
  const t = useTranslations("blog.intro");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdayellow/8 blur-[130px]"
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

function Posts() {
  const t = useTranslations("blog");

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <Stagger className="grid gap-4 md:grid-cols-3">
        {POSTS.map((key) => (
          <StaggerItem key={key} className="h-full">
            <article className="glass flex h-full flex-col rounded-2xl p-7">
              <span className="inline-flex w-fit rounded-full bg-cdagreen/10 px-3 py-1 text-xs text-cdagreen-bright ring-1 ring-cdagreen/20">
                {t(`posts.${key}.category`)}
              </span>
              <h2 className="mt-5 flex-1 font-display text-xl font-semibold leading-snug text-ink-50">
                {t(`posts.${key}.title`)}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                {t(`posts.${key}.excerpt`)}
              </p>
              <p className="mt-6 flex items-center gap-2 text-xs text-ink-400">
                <Clock className="h-3.5 w-3.5" />
                {t(`posts.${key}.readTime`)} {t("readTime")}
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-12">
        <p className="text-center text-sm text-ink-400">{t("comingSoon")}</p>
      </Reveal>
    </section>
  );
}
