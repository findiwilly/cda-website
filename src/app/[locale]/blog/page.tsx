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

      {/* Category filter — visual only for now; the list below is already
          scoped to this locale. */}
      {categories.length > 1 && (
        <div className="mx-auto max-w-content px-6 pt-10">
          <Reveal>
            <h2 className="text-[0.65rem] uppercase tracking-[0.35em] text-ink-500">
              {t("filters.label")}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <li
                  key={category}
                  className="rounded-full bg-white/5 px-4 py-2 text-xs text-ink-300 ring-1 ring-white/10"
                >
                  {category}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      )}

      {/* Posts */}
      <section className="mx-auto max-w-content px-6 py-section">
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <StaggerItem key={post._id} className="h-full">
                <article className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:border-cdagreen/30">
                  {post.cover && (
                    /* Plain <img>: the source is a fully-formed Cloudinary
                       delivery URL, so Next's optimiser has nothing to do. */
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.cover.url}
                      alt={post.cover.alt ?? ""}
                      width={post.cover.width}
                      height={post.cover.height}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/9] w-full object-cover"
                    />
                  )}

                  <div className="flex flex-1 flex-col p-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cdagreen/10 px-3 py-1 text-xs text-cdagreen-bright ring-1 ring-cdagreen/20">
                        {post.category}
                      </span>
                      <span className="text-xs text-ink-500">
                        {post.readingTime} {t("readTime")}
                      </span>
                    </div>

                    <h2 className="mt-5 flex-1 font-display text-xl font-semibold leading-snug text-ink-50">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors duration-300 after:absolute after:inset-0 hover:text-cdagreen-bright"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-ink-300">
                      {post.excerpt}
                    </p>

                    <time
                      dateTime={post.publishedAt ?? post.updatedAt}
                      className="mt-6 text-xs text-ink-400"
                    >
                      {dateFormatter.format(new Date(post.publishedAt ?? post.updatedAt))}
                    </time>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
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