import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { listPublishedPosts, toLocale } from "@/lib/content";
import { breadcrumbJsonLd, openGraphFor } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { BlogList } from "./BlogList";

/**
 * Blog index, driven by the database.
 *
 * Reads are cached with a one-hour TTL and revalidated by tag on every admin
 * write, so publishing a post makes it appear here without a redeploy. When
 * Mongo is unconfigured the list is simply empty and the page still renders —
 * important, because preview builds on Vercel run without secrets.
 */

export const revalidate = 3600;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "blog.intro" });
  return {
    title: t("title"),
    description: t("subtitle"),
    ...openGraphFor(locale, "/blog", t("title"), t("subtitle")),
  };
}

export default async function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const intro = await getTranslations({ locale, namespace: "blog.intro" });

  const posts = await listPublishedPosts(toLocale(locale));

  // Category pills, derived rather than hand-maintained so a new category in the
  // admin panel shows up here without a code change.
  const categories = [...new Set(posts.map((post) => post.category))].sort();

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "en" ? "en-GB" : "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <main className="pt-[72px]">
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: intro("eyebrow"), path: "/" },
          { name: intro("title"), path: "/blog" },
        ])}
      />

      {/* Masthead */}
      <section className="relative overflow-hidden border-b border-white/5">
        <SectionBackdrop variant="contours" opacity={0.05} />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdayellow/8 blur-[130px]"
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

      <BlogList posts={posts} categories={categories} locale={locale} />
    </main>
  );
}

/**
 * Shown when there are no published posts — but never as a dead end. It closes
 * with the two things a reader actually wants at that point: the blog feed and
 * a way to ask the question directly.
 */
function EmptyState() {
  const t = useTranslations("blog.empty");

  return (
    <Reveal className="glass mx-auto max-w-xl rounded-2xl p-12 text-center">
      <p className="font-display text-xl font-semibold text-ink-50">{t("title")}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-300">
        {t("body")}
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
  );
}