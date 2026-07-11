import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { LeadForm } from "@/components/ui/LeadForm";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE } from "@/lib/constants";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "contact.intro" });
  return { title: t("title"), description: t("subtitle") };
}

export default function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <main className="pt-[72px]">
      <Intro />
      <BookingAndForm />
      <Faq />
    </main>
  );
}

function Intro() {
  const t = useTranslations("contact.intro");

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdagreen/15 blur-[130px]"
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

function BookingAndForm() {
  const t = useTranslations("contact");

  return (
    <section className="mx-auto max-w-content px-6 py-section">
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <Reveal>
          <div className="rounded-3xl bg-gradient-to-br from-cdagreen/40 via-white/5 to-cdayellow/20 p-px">
            <div className="glass flex h-full flex-col rounded-3xl p-8 sm:p-10">
              <span className="inline-flex w-fit rounded-xl bg-cdagreen/10 p-3 ring-1 ring-cdagreen/20">
                <CalendarDays className="h-6 w-6 text-cdagreen-bright" />
              </span>
              <h2 className="mt-6 font-display text-display-sm font-bold text-ink-50">
                {t("booking.title")}
              </h2>
              <p className="mt-4 flex-1 text-ink-300">{t("booking.body")}</p>
              <a
                href={SITE.calcomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
              >
                {t("booking.button")}
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div>
            <h2 className="mb-6 font-display text-xl font-semibold text-ink-50">
              {t("form.title")}
            </h2>
            <LeadForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  const t = useTranslations("contact.faq");

  return (
    <section className="border-t border-white/5">
      <div className="mx-auto max-w-3xl px-6 py-section">
        <SectionHeader eyebrow="FAQ" title={t("title")} />
        <div className="mt-10">
          <Accordion
            items={FAQ_KEYS.map((key) => ({
              q: t(`${key}.q`),
              a: t(`${key}.a`),
            }))}
          />
        </div>
      </div>
    </section>
  );
}
