import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { INDUSTRY_SLUGS, NAV_ITEMS } from "@/lib/constants";
import { listPublishedPosts } from "@/lib/content";
import { localePath, absoluteUrl } from "@/lib/seo";

/**
 * Dynamic sitemap covering both locales, all pages, all 15 industry pages, and
 * every published blog post. Regenerated hourly so a newly published post
 * appears without a redeploy.
 */

export const revalidate = 3600;

const STATIC_PATHS: {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/ai-agents", changeFrequency: "monthly", priority: 0.9 },
  { path: "/industries", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/resources", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
  { path: "/testimonials", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.9 },
  // Legal
  { path: "/legal/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/legal/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/legal/cookies", changeFrequency: "yearly" as const, priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const item of STATIC_PATHS) {
      entries.push({
        url: absoluteUrl(localePath(locale, item.path)),
        lastModified: new Date(),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
      });
    }

    for (const slug of INDUSTRY_SLUGS) {
      entries.push({
        url: absoluteUrl(localePath(locale, `/industries/${slug}`)),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    // Blog posts, only for the locale they were written in.
    const posts = await listPublishedPosts(locale);
    for (const post of posts) {
      entries.push({
        url: absoluteUrl(localePath(locale, `/blog/${post.slug}`)),
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
