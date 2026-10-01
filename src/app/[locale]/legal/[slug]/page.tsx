import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { locales, Link } from "@/i18n/routing";
import { Reveal } from "@/components/motion/Reveal";
import { isLegalSlug, LEGAL_SLUGS, type LegalSection } from "@/lib/legal";
import { breadcrumbJsonLd, languageAlternates, jsonLdScript, openGraphFor } from "@/lib/seo";

/**
 * Legal pages.
 *
 * Every legal document on the site shares this one dynamic route, because the
 * documents have identical structure (numbered sections with paragraphs and
 * bullet lists) and identical SEO needs. Copy lives in the message files as
 * structured data, not as JSX — a lawyer handing us revised wording should
 * never need to touch a component.
 *
 * Structure per document:
 *   sections: [{ heading, paragraphs: string[], bullets?: string[] }]
 *
 * Slug list is explicit rather than derived from the message file, so a typo
 * yields a 404 instead of a silently missing document.
 */

export function generateStaticParams() {
  return locales.flatMap((locale) => LEGAL_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  if (!isLegalSlug(slug)) notFound();

  const t = await getTranslations({ locale, namespace: `legal.${slug}` });
  const doc = t;
  const title = doc("meta.title");
  const description = doc("meta.description");

  return {
    title,
    description,
    // Legal pages are reference material — searchable, but not competing with
    // the money pages.
    // `openGraphFor` already supplies alternates, canonical and metadataBase.
    ...openGraphFor(locale, `/legal/${slug}`, title, description),
    robots: { index: true, follow: true },
  };
}

export default function LegalPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);

  if (!isLegalSlug(slug)) notFound();

  const t = useTranslations(`legal.${slug}`);
  const lg = useTranslations("legal");

  const sections = t.raw("sections") as LegalSection[];
  const updated = t("updated");
  const order = LEGAL_SLUGS.filter((s) => s !== slug);

  const breadcrumbs = [
    { name: lg("homeLabel"), path: "/" },
    { name: t("meta.title"), path: `/legal/${slug}` },
  ];

  return (
    <main className="pt-[72px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(breadcrumbJsonLd(locale, breadcrumbs)),
        }}
      />

      {/* Masthead */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdagreen/12 blur-[130px]"
        />
        <div className="relative mx-auto max-w-content px-6 pb-10 pt-20 sm:pt-28">
          <p className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright sm:text-xs">
            <span className="h-px w-10 bg-cdagreen-bright" />
            {t("eyebrow")}
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-display-md font-bold text-ink-50">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-ink-300">{t("intro")}</p>
          <p className="mt-6 text-xs text-ink-500">{updated}</p>
        </div>
      </section>

      {/* Body: sticky section index on desktop, linear on mobile */}
      <section className="mx-auto max-w-content px-6 py-section">
        <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
          <nav
            aria-label={lg("indexLabel")}
            className="lg:sticky lg:top-28 lg:h-fit"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-ink-500">
              {lg("indexLabel")}
            </p>
            <ol className="mt-5 space-y-3 border-l border-white/5 pl-5">
              {sections.map((section, i) => (
                <li key={section.heading}>
                  <a
                    href={`#section-${i + 1}`}
                    className="text-sm leading-snug text-ink-400 transition-colors duration-300 hover:text-cdagreen-bright"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-white/5 pt-6">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-ink-500">
                {lg("otherDocs")}
              </p>
              <ul className="mt-4 space-y-2">
                {order.map((other) => (
                  <li key={other}>
                    <Link
                      href={`/legal/${other}`}
                      className="text-sm text-ink-300 underline decoration-white/10 underline-offset-4 transition-colors duration-300 hover:text-cdagreen-bright hover:decoration-cdagreen-bright/40"
                    >
                      {lg(`docs.${other}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="max-w-2xl">
            {sections.map((section, i) => (
              <Reveal key={section.heading}>
                <article
                  id={`section-${i + 1}`}
                  className="scroll-mt-28 border-b border-white/5 py-10 first:pt-0 last:border-0"
                >
                  <h2 className="font-display text-display-sm font-semibold text-ink-50">
                    <span className="mr-3 font-mono text-sm text-cdagreen-bright">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </h2>

                  {section.paragraphs.map((paragraph, p) => (
                    <p
                      key={p}
                      className="mt-5 leading-relaxed text-ink-300"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="mt-6 space-y-3">
                      {section.bullets.map((bullet, b) => (
                        <li
                          key={b}
                          className="flex gap-3.5 leading-relaxed text-ink-300"
                        >
                          <span
                            aria-hidden
                            className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-cdagreen-bright"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </Reveal>
            ))}

            {/* Contact block — the legally meaningful way to reach us about any
                of these documents. */}
            <Reveal>
              <aside className="glass mt-12 rounded-2xl p-8">
                <h2 className="font-display text-lg font-semibold text-ink-50">
                  {lg("questionsTitle")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-300">
                  {lg("questionsBody")}
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-ink-100 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
                >
                  {lg("questionsCta")}
                </Link>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
