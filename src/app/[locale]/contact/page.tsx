import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { Link } from "@/i18n/routing";
import { LeadForm } from "@/components/ui/LeadForm";
import { Accordion } from "@/components/ui/Accordion";
import { CalEmbed } from "@/components/booking/CalEmbed";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";

/**
 * Five starter questions live in the message files under `contact.faq`.
 *
 * They are the objections that block a booking, in the order they come up on a
 * call. The full, admin-managed set lives at `/faq` — this block is a teaser
 * that links there, so the two cannot drift into competing copies.
 */
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
      <SectionBackdrop variant="contours" opacity={0.05} />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdagreen/15 blur-[130px]"
      />
      <div className="relative mx-auto max-w-content px-6 pb-4 pt-20 sm:pt-28">
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
                <CalendarDays aria-hidden className="h-6 w-6 text-cdagreen-bright" />
              </span>
              <h2 className="mt-6 font-display text-display-sm font-bold text-ink-50">
                {t("booking.title")}
              </h2>
              <p className="mt-4 flex-1 text-ink-300">{t("booking.body")}</p>

              {/* Inline calendar. It expands into the card, so the section grows
                  once loaded — acceptable because the button that triggers it
                  sits at the bottom of a fixed-height block. */}
              <div className="mt-8">
                <CalEmbed />
              </div>
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
  const faqT = useTranslations("faq");

  return (
    <section className="border-t border-white/5">
      <div className="mx-auto max-w-3xl px-6 py-section">
        {/* Eyebrow and link copy come from the `faq` namespace, not a hardcoded
            "FAQ" string, so the teaser matches the page it points at in both
            languages. */}
        <SectionHeader eyebrow={faqT("intro.eyebrow")} title={t("title")} />
        <div className="mt-10">
          <Accordion
            items={FAQ_KEYS.map((key) => ({
              q: t(`${key}.q`),
              a: t(`${key}.a`),
            }))}
          />
        </div>

        <Reveal className="mt-10 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-sm text-cdagreen-bright transition-colors duration-300 hover:text-ink-50"
          >
            {faqT("stillStuck")}
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
