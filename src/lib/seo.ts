import { routing } from "@/i18n/routing";
import { env, siteUrl } from "@/lib/env";
import { SITE } from "@/lib/constants";

/**
 * SEO helpers.
 *
 * Every page needs the same four things: a canonical URL, hreflang alternates
 * for fr/en, OpenGraph + Twitter cards, and — on the home page — schema.org
 * `LocalBusiness` JSON-LD. Centralised here so a page cannot forget one of them.
 */

export function absoluteUrl(path = "/"): string {
  const base = siteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Locale-prefixed path, matching `localePrefix: 'as-needed'`: French is bare,
 * English carries the `/en` prefix. Used for canonicals and hreflang so the
 * two always agree with what the router actually serves.
 */
export function localePath(locale: string, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return clean || "/";
  return `/en${clean}`;
}

/** hreflang set for a localized path: fr, en, plus x-default pointing at French. */
export function languageAlternates(path = "/") {
  return {
    canonical: absoluteUrl(localePath(routing.defaultLocale, path)),
    languages: {
      fr: absoluteUrl(localePath("fr", path)),
      en: absoluteUrl(localePath("en", path)),
      "x-default": absoluteUrl(localePath("fr", path)),
    },
  };
}

/** OpenGraph + Twitter block for a localized page. */
export function openGraphFor(
  locale: string,
  path: string,
  title: string,
  description: string,
  image?: string,
) {
  const url = absoluteUrl(localePath(locale, path));
  const ogImage = image ?? defaultOgImage(locale);

  return {
    metadataBase: new URL(siteUrl()),
    alternates: languageAlternates(path),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
      type: "website" as const,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImage],
    },
  };
}

/** The site-wide social card. Rendered by `src/app/opengraph-image.tsx`. */
export function defaultOgImage(locale: string): string {
  return absoluteUrl(`/api/og?locale=${locale}`);
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

const ORGANIZATION_ID = `${absoluteUrl("/")}#organization`;

/**
 * schema.org LocalBusiness for the Yaoundé office.
 *
 * Emitted as a JSON-LD `<script>` on the home page and about page. Ratings are
 * deliberately absent: `aggregateRating` is only legal when it reflects genuine
 * collected reviews, so it ships only once approved testimonials exist and is
 * then added explicitly rather than hardcoded here.
 */
export function localBusinessJsonLd(locale: string) {
  const isFrench = locale === "fr";

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon"),
    image: defaultOgImage(locale),
    description: isFrench
      ? "Agence de transformation digitale IA à Yaoundé, Cameroun. Sites web, identité de marque, contenu, automatisation IA et agents virtuels pour les PME camerounaises."
      : "AI-powered digital transformation agency in Yaoundé, Cameroon. Websites, brand identity, content, AI automation and virtual agents for Cameroonian SMEs.",
    telephone: SITE.whatsappNumber,
    email: env.smtp.user,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city,
      addressRegion: "Centre",
      addressCountry: SITE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      // Yaoundé city centre
      latitude: 3.848,
      longitude: 11.502,
    },
    areaServed: [
      { "@type": "Country", name: "Cameroun" },
      { "@type": "AdministrativeArea", name: "Yaoundé" },
      { "@type": "AdministrativeArea", name: "Douala" },
    ],
    knowsLanguage: ["fr", "en"],
    sameAs: [
      "https://www.facebook.com/CameroonDigitalAgency",
      "https://www.linkedin.com/company/cameroondigitalagency",
      "https://www.instagram.com/cameroondigitalagency",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: SITE.whatsappNumber,
      contactOption: "TollFree",
      areaServed: "CM",
      availableLanguage: ["French", "English"],
    },
  };
}

/** BreadcrumbList — rendered on every page except the home page. */
export function breadcrumbJsonLd(
  locale: string,
  crumbs: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(localePath(locale, crumb.path)),
    })),
  };
}

/** BlogPosting — title, dates, author and cover image for an article page. */
export function articleJsonLd(
  locale: string,
  post: {
    title: string;
    excerpt: string;
    slug: string;
    publishedAt: string | null;
    updatedAt: string;
    cover: string | null;
  },
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    inLanguage: locale,
    mainEntityOfPage: absoluteUrl(localePath(locale, `/blog/${post.slug}`)),
    ...(post.cover ? { image: [post.cover] } : {}),
    datePublished: post.publishedAt ?? post.updatedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon") },
    },
  };
}

/** FAQPage — mirrors the visible accordion so rich results stay honest. */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** Serialize JSON-LD for a `<script type="application/ld+json">` tag. */
export function jsonLdScript(data: unknown): string {
  // `<` is escaped so a stray `</script>` in content cannot close the tag early.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}


export function siteMetadata(locale = "fr" as "fr" | "en", opts: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
} = {}) {
  const title = opts.title ? opts.title + " | " + SITE.name : SITE.name;
  const description = opts.description ?? SITE.description[locale];
  const url = absoluteUrl(localePath(locale, opts.path ?? "/"));
  const image = opts.image ?? absoluteUrl("/og.jpg");
  return {
    title,
    description,
    alternates: languageAlternates(opts.path ?? "/"),
    robots: { index: !opts.noIndex, follow: !opts.noIndex },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
