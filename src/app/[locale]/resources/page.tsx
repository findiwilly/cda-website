import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Calculators } from "@/components/ui/Calculators";
import { SectionHeader } from "@/components/ui/SectionHeader";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "resources.intro" });
  return { title: t("title"), description: t("subtitle") };
}

export default function ResourcesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="pt-[72px]">
      <Intro />
      <section className="mx-auto max-w-content px-6 py-section">
        <Calculators />
      </section>
    </main>
  );
}

function Intro() {
  const t = useTranslations("resources.intro");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdagreen/12 blur-[130px]"
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
