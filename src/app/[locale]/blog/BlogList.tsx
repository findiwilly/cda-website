"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function BlogList({
  posts,
  categories,
  locale,
}: {
  posts: any[];
  categories: string[];
  locale: string;
}) {
  const t = useTranslations("blog");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "en" ? "en-GB" : "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const filtered = posts.filter((post) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      post.title?.toLowerCase().includes(q) ||
      post.excerpt?.toLowerCase().includes(q) ||
      post.category?.toLowerCase().includes(q) ||
      post.tags?.some((x: string) => x.toLowerCase().includes(q));
    const matchC = !selected || post.category === selected;
    return matchQ && matchC;
  });

  return (
    <>
      <div className="mx-auto max-w-content px-6 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "fr" ? "Rechercher des articles..." : "Search posts..."}
            className="w-full max-w-sm rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-ink-50 placeholder:text-ink-400"
          />
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelected(null)}
                className={`rounded-full px-4 py-2 text-xs ring-1 ring-white/10 ${selected === null ? "bg-cdagreen/20 text-cdagreen-bright" : "bg-white/5 text-ink-300"}`}
              >
                {locale === "fr" ? "Tous" : "All"}
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelected(c)}
                  className={`rounded-full px-4 py-2 text-xs ring-1 ring-white/10 ${selected === c ? "bg-cdagreen/20 text-cdagreen-bright" : "bg-white/5 text-ink-300"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="mx-auto max-w-content px-6 py-section">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-ink-400">{t("empty.title")}</p>
        ) : (
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post: any) => (
              <StaggerItem key={post._id} className="h-full">
                <article className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:border-cdagreen/30">
                  {post.cover && (
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
                      {post.tags?.length > 0 && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-ink-400 ring-1 ring-white/10">
                          {post.tags[0]}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-5 flex-1 font-display text-xl font-semibold leading-snug text-ink-50">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="line-clamp-3 transition hover:text-cdagreen-bright focus:outline-none focus:ring-2 focus:ring-cdagreen/40 focus:ring-offset-2 focus:ring-offset-ink-950"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p className="mt-4 line-clamp-3 text-sm text-ink-400">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5 text-xs text-ink-500">
                      <time dateTime={post.publishedAt ?? post.createdAt}>
                        {dateFormatter.format(new Date(post.publishedAt ?? post.createdAt))}
                      </time>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}