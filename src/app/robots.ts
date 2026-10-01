import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/**
 * Rebuilt on every request so a change to `NEXT_PUBLIC_SITE_URL` takes effect
 * immediately rather than at the next deploy.
 */
export const dynamic = "force-dynamic";

/**
 * robots.txt — the public site is fully crawlable. The admin panel and API are
 * excluded: they need auth, hold no indexable content, and crawling them only
 * burns crawl budget.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
