import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { locales } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import {
  getPostBySlug,
  getPublishedPostSlugs,
  listPublishedPosts,
  toLocale,
} from "@/lib/content";
import { extractHeadings, renderMarkdown } from "@/lib/markdown";
import { articleJsonLd, breadcrumbJsonLd, openGraphFor } from "@/lib/seo";

/**
 * A single blog article.
 *
 * Content is admin-authored markdown held in Mongo, so the page is three moving
 * parts: safe HTML (`renderMarkdown`), a table of contents derived from the same
 * heading outline, and `BlogPosting` JSON-LD. Reads are tag-cached, so a publish
 * in the admin panel revalidates this route without a redeploy.
 *
 * Unknown or unpublished slugs 404. A draft must never leak by guessing its URL,
 * so `getPostBySlug` filters on `status: "published"` itself.
 */

export const revalidate = 3600;

export async function generateStaticParams() {
  // Slugs come from the database, so this is empty on a build without
  // credentials. Next then falls back to on-demand rendering and the route
  // still works — `dynamicParams` stays true.
  const slugs = await getPublishedPostSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(slug, toLocale(locale));
  if (!post) return {};

  // Admin-supplied overrides first, falling back to the post's own fields. The
  // schema caps these at 70/180 chars, which is what search engines truncate to
  // anyway — a longer override would be silently cut in the SERP.
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  // `openGraphFor` supplies canonical, hreflang and OG/Twitter together. Slugs
  // are unique per document, not per locale, so a translation has to be linked
  // from its sibling explicitly — but only when it is actually published, or
  // hreflang would advertise a URL that 404s.
  const og = openGraphFor(locale, `/blog/${post.slug}`, title, description, post.cover?.url);

  return { title, description, ...og };
}

export default async function BlogPostPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);

  const post = await getPostBySlug(slug, toLocale(locale));
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });
  const intro = await getTranslations({ locale, namespace: "blog.intro" });

  const html = renderMarkdown(post.content);
  const headings = extractHeadings(post.content);

  // Same category first, then anything else, so the closing block always offers
  // somewhere to go next.
  const related = (await listPublishedPosts(toLocale(locale)))
    .filter((candidate) => candidate.slug !== post.slug)
    .sort((a, b) => {
      const aMatch = a.category === post.category ? 0 : 1;
      const bMatch = b.category === post.category ? 0 : 1;
      return aMatch - bMatch;
    })
    .slice(0, 3);

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "en" ? "en-GB" : "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const published = post.publishedAt ?? post.updatedAt;
  // Only worth stating when the post was genuinely revised after publication.
  const wasUpdated =
    post.publishedAt !== null &&
    new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86_400_000;

  return (
    <main className="pt-[72px]">
      <JsonLd
        data={articleJsonLd(locale, {
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          cover: post.cover?.url ?? null,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: intro("eyebrow"), path: "/" },
          { name: intro("title"), path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      {/* Masthead */}
      <article>
        <header className="relative overflow-hidden border-b border-white/5">
          <SectionBackdrop variant="grid" opacity={0.04} />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-0 h-[26rem] w-[26rem] rounded-full bg-cdayellow/8 blur-[130px]"
          />

          <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-16 sm:pt-24">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-sm text-ink-400 transition-colors duration-300 hover:text-cdagreen-bright"
            >
              <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">
                ←
              </span>
              {t("post.backToBlog")}
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs">
              <Link
                href="/blog"
                className="rounded-full bg-cdagreen/10 px-3 py-1 text-cdagreen-bright ring-1 ring-cdagreen/20 transition-colors duration-300 hover:bg-cdagreen/20"
              >
                {post.category}
              </Link>
              <span className="text-ink-500">{post.readingTime} {t("readTime")}</span>
            </div>

            <h1 className="mt-6 font-display text-display-md font-bold text-ink-50">
              {post.title}
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-ink-300">{post.excerpt}</p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-400">
              <time dateTime={published}>{dateFormatter.format(new Date(published))}</time>
              {wasUpdated && (
                <span>
                  {t("post.updatedOn")}{" "}
                  <time dateTime={post.updatedAt}>
                    {dateFormatter.format(new Date(post.updatedAt))}
                  </time>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Cover image sits below the text header, so the headline is the first
            thing painted and the image never blocks LCP. */}
        {post.cover && (
          <div className="mx-auto max-w-4xl px-6 pt-12">
            {/* Plain <img>: `cover.url` is already a Cloudinary delivery URL, so
                Next's optimiser would only add a hop. Dimensions are known from
                the upload, so there is no layout shift. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover.url}
              alt={post.cover.alt ?? ""}
              width={post.cover.width}
              height={post.cover.height}
              // Above the fold on a phone, so eager — but still not preloaded by
              // the layout, which would double-fetch it.
              loading="eager"
              decoding="async"
              className="w-full rounded-2xl border border-white/[0.06] object-cover"
            />
          </div>
        )}

        {/* Body + table of contents. The TOC is `lg:` and above, so it sits
            before the article in the DOM and comes first in the tab order. */}
        <div className="mx-auto max-w-content px-6 py-16">
          <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
            <TableOfContents
              headings={headings}
              label={t("post.inThisArticle")}
            />

            <div className="min-w-0">
              <ArticleBody html={html} />

              <footer className="mt-16 border-t border-white/[0.06] pt-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-ink-400 transition-colors duration-300 hover:text-cdagreen-bright"
                >
                  <span aria-hidden>←</span>
                  {t("post.backToBlog")}
                </Link>
              </footer>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-content px-6 py-section">
            <Reveal>
              <h2 className="font-display text-display-sm font-semibold text-ink-50">
                {t("post.moreFrom")}
              </h2>
            </Reveal>

            <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <StaggerItem key={item._id} className="h-full">
                  <article className="glass group flex h-full flex-col rounded-2xl p-6 transition-colors duration-300 hover:border-cdagreen/30">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-cdagreen/10 px-3 py-1 text-cdagreen-bright ring-1 ring-cdagreen/20">
                        {item.category}
                      </span>
                      <span className="text-ink-500">
                        {item.readingTime} {t("readTime")}
                      </span>
                    </div>
                    <h3 className="mt-4 flex-1 font-display text-lg font-semibold leading-snug text-ink-50">
                      <Link
                        href={`/blog/${item.slug}`}
                        className="transition-colors duration-300 hover:text-cdagreen-bright"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-300">{item.excerpt}</p>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}
    </main>
  );
}