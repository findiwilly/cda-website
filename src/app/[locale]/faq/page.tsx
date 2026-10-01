import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { listFaqs, toLocale } from "@/lib/content";
import type { Faq } from "@/lib/content-schema";
import { breadcrumbJsonLd, faqJsonLd, openGraphFor } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/motion/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";

/**
 * The FAQ page.
 *
 * Content is admin-managed in Mongo and grouped by the `category` field, so
 * adding a question needs no deploy. `faqJsonLd` mirrors exactly the questions
 * rendered below — schema.org requires the structured data to match visible
 * content, so the same array feeds both.
 *
 * Ordering: featured questions first, then each category in the order the
 * admin sorted them (`order`), categories alphabetically so the page is stable
 * even as questions are added.
 */

export const revalidate = 3600;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "faq.intro" });
  return {
    title: t("title"),
    description: t("subtitle"),
    ...openGraphFor(locale, "/faq", t("title"), t("subtitle")),
  };
}

export default async function FaqPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "faq" });
  const intro = await getTranslations({ locale, namespace: "faq.intro" });

  const faqs = await listFaqs(toLocale(locale));

  // Featured answers, shown once at the top regardless of category — these are
  // the questions that block a purchase, so they should not be hunted for.
  const featured = faqs.filter((faq) => faq.featured);
  const featuredIds = new Set(featured.map((faq) => faq._id));
  const rest = faqs.filter((faq) => !featuredIds.has(faq._id));

  const groups = groupByCategory(rest);

  return (
    <main className="pt-[72px]">
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: intro("eyebrow"), path: "/" },
          { name: intro("title"), path: "/faq" },
        ])}
      />
      {/* Only what is actually on the page goes into the structured data. */}
      <JsonLd
        data={faqJsonLd(faqs.map((faq) => ({ question: faq.question, answer: faq.answer })))}
      />

      <section className="relative overflow-hidden border-b border-white/5">
        <SectionBackdrop variant="grid" opacity={0.05} />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdagreen/10 blur-[130px]"
        />
        <div className="relative mx-auto max-w-content px-6 pb-10 pt-20 sm:pt-28">
          <SectionHeader
            as="h1"
            eyebrow={intro("eyebrow")}
            title={intro("title")}
            subtitle={intro("subtitle")}
          />
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-section">
        {faqs.length === 0 ? (
          <Reveal className="glass rounded-2xl p-12 text-center">
            <p className="font-display text-xl font-semibold text-ink-50">
              {t("empty.title")}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-300">
              {t("empty.body")}
            </p>
          </Reveal>
        ) : (
          <>
            {featured.length > 0 && (
              <Reveal>
                <section aria-labelledby="faq-featured">
                  <h2
                    id="faq-featured"
                    className="text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright"
                  >
                    {t("featured")}
                  </h2>
                  <div className="mt-6">
                    <Accordion items={toAccordionItems(featured)} />
                  </div>
                </section>
              </Reveal>
            )}

            {groups.map(([category, items]) => (
              <Reveal key={category}>
                <section aria-labelledby={`faq-${slugOf(category)}`} className="mt-16">
                  <h2
                    id={`faq-${slugOf(category)}`}
                    className="font-display text-display-sm font-semibold text-ink-50"
                  >
                    {category}
                  </h2>
                  <div className="mt-6">
                    <Accordion items={toAccordionItems(items)} />
                  </div>
                </section>
              </Reveal>
            ))}
          </>
        )}
      </div>

      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-6 py-section text-center">
          <Reveal>
            <p className="font-display text-display-sm font-semibold text-ink-50">
              {t("stillStuck")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
              >
                {t("cta")}
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-ink-100 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
              >
                {t("secondary")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

/** Accordion items are `{ q, a }`; keep the mapping in one place. */
function toAccordionItems(faqs: Faq[]) {
  return faqs.map((faq) => ({ q: faq.question, a: faq.answer }));
}

/**
 * Group by category, preserving the admin's `order` inside each group and
 * sorting the groups themselves by name.
 */
function groupByCategory(faqs: Faq[]): [string, Faq[]][] {
  const map = new Map<string, Faq[]>();

  for (const faq of faqs) {
    const bucket = map.get(faq.category);
    if (bucket) bucket.push(faq);
    else map.set(faq.category, [faq]);
  }

  return [...map.entries()]
    .map(([category, items]) => {
      items.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
      return [category, items] as [string, Faq[]];
    })
    .sort(([a], [b]) => a.localeCompare(b));
}

/** Accents are common in French categories, so ids are normalised. */
function slugOf(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}