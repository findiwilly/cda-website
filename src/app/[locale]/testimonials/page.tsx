import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { listApprovedTestimonials, toLocale } from "@/lib/content";
import { breadcrumbJsonLd, openGraphFor } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { TestimonialForm } from "@/components/testimonials/TestimonialForm";

/**
 * Testimonials, plus the form to leave one.
 *
 * Only `approved` testimonials reach the page — submissions from the form below
 * land as `pending` and wait at `/admin/testimonials`. The form is on the same
 * page as the read, because a visitor who has just been convinced by three
 * quotes is exactly the person most likely to want to add a fourth.
 *
 * When there are no approved testimonials yet the page must not look broken, so
 * it renders an invitation rather than an empty grid.
 */

export const revalidate = 3600;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "testimonials.intro" });
  return {
    title: t("title"),
    description: t("subtitle"),
    ...openGraphFor(locale, "/testimonials", t("title"), t("subtitle")),
  };
}

export default async function TestimonialsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "testimonials" });
  const intro = await getTranslations({ locale, namespace: "testimonials.intro" });

  const testimonials = await listApprovedTestimonials(toLocale(locale));

  // Rating mix across approved testimonials only. Google's `aggregateRating`
  // policy requires genuine collected reviews, so this stays out of the JSON-LD
  // unless an admin has genuinely approved a real batch.
  const rated = testimonials.filter((item) => item.rating >= 1);
  const average =
    rated.length > 0
      ? rated.reduce((sum, item) => sum + item.rating, 0) / rated.length
      : null;

  return (
    <main className="pt-[72px]">
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: intro("eyebrow"), path: "/" },
          { name: intro("title"), path: "/testimonials" },
        ])}
      />

      <section className="relative overflow-hidden border-b border-white/5">
        <SectionBackdrop variant="contours" opacity={0.05} />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdayellow/8 blur-[130px]"
        />
        <div className="relative mx-auto max-w-content px-6 pb-10 pt-20 sm:pt-28">
          <SectionHeader
            as="h1"
            eyebrow={intro("eyebrow")}
            title={intro("title")}
            subtitle={intro("subtitle")}
          />

          {average !== null && (
            <Reveal className="mt-8">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-ink-300 ring-1 ring-white/10">
                <span aria-hidden className="text-cdayellow">
                  {"★".repeat(Math.round(average))}
                </span>
                <span>
                  {average.toFixed(1)}/5 · {rated.length}
                </span>
              </p>
            </Reveal>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-section">
        {testimonials.length === 0 ? (
          <Reveal className="glass mx-auto max-w-xl rounded-2xl p-12 text-center">
            <p className="font-display text-xl font-semibold text-ink-50">
              {t("empty.title")}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-300">
              {t("empty.body")}
            </p>
          </Reveal>
        ) : (
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial._id} className="h-full">
                <TestimonialCard testimonial={testimonial} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      {/* The form sits on its own band so the two halves of the page read as
          distinct: evidence above, contribution below. */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-content px-6 py-section">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:items-start">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="flex items-center gap-4">
                  <span className="h-px w-10 shrink-0 bg-cdagreen-bright" />
                  <span className="text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright">
                    {t("intro.eyebrow")}
                  </span>
                </p>
                <h2 className="mt-5 font-display text-display-sm font-bold text-ink-50">
                  {t("leaveOne")}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-300">
                  {t("pendingNote")}
                </p>
              </div>
            </Reveal>

            <Reveal>
              <TestimonialForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Quiet route back into the sales path, for visitors who came here to
          decide rather than to contribute. */}
      <section className="mx-auto max-w-content px-6 pb-section">
        <Reveal className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
          >
            {t("leaveOne")}
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-ink-100 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
          >
            {t("intro.title")}
          </Link>
        </Reveal>
      </section>
    </main>
  );
}