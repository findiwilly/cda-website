/**
 * Shared site data — single source of truth for nav, services and industries.
 * Slugs are locale-neutral; display names come from src/messages/*.json.
 */

export const SITE = {
  name: "Cameroon Digital Agency",
  shortName: "CDA",
  city: "Yaoundé",
  country: "CM",
  whatsappNumber: "+237650077812",
  calcomUrl: "https://cal.com/cda/strategy-session",
  description: {
    fr: "Cameroon Digital Agency (CDA) : branding, stratégie digitale, IA, automatisation, réseaux, vidéosurveillance, IoT et développement web.",
    en: "Cameroon Digital Agency (CDA): branding, digital strategy, AI, automation, networks, CCTV, IoT, and web development.",
  },
} as const;

/**
 * How long a contact-form submission survives, in days.
 *
 * The privacy policy publishes this figure, so it is enforced rather than
 * aspirational: `scripts/seed.ts` turns it into a MongoDB TTL index on
 * `leads.createdAt`, and Mongo reaps the document itself. Nothing in the app
 * depends on a lead outliving this window.
 *
 * The one consequence worth knowing: a lead that later becomes a client is
 * reaped from this collection too. Accounting records live in the books, not
 * here, so the five-year obligation in the policy is unaffected — but if you
 * want enquiry history kept longer, raise this number and re-run
 * `npm run seed`, which drops and recreates the index. Mongo will not widen an
 * existing TTL on its own.
 */
export const LEAD_RETENTION_DAYS = 90;

export const NAV_ITEMS = [
  { key: "services", href: "/services" },
  { key: "aiAgents", href: "/ai-agents" },
  { key: "industries", href: "/industries" },
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
  { key: "resources", href: "/resources" },
  { key: "testimonials", href: "/testimonials" },
  { key: "faq", href: "/faq" },
  { key: "partnership", href: "/partnership" },
  { key: "contact", href: "/contact" },
] as const;

export const SERVICE_SLUGS = [
  "branding",
  "digital-strategy",
  "social-media-marketing",
  "content-marketing",
  "email-sms-marketing",
  "experiential-marketing",
  "billboard-led-advertising",
  "web-development",
  "custom-software",
  "ai-automation",
  "seo-geo-aeo",
  "data-analytics",
  "it-consulting",
  "network-systems",
      "cctv",
      "iot",
      "it-maintenance",
      "it-consultancy",
      "e-invitations",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/** Services page: category panels for the pinned horizontal journey */
export const SERVICE_CATEGORIES = [
  {
    key: "marketing",
    slugs: [
      "branding",
      "digital-strategy",
      "social-media-marketing",
      "content-marketing",
      "email-sms-marketing",
      "experiential-marketing",
      "billboard-led-advertising",
    ],
  },
  {
    key: "tech",
    slugs: ["web-development", "custom-software", "it-consulting", "e-invitations"],
  },
  {
    key: "ai",
    slugs: ["ai-automation", "seo-geo-aeo", "data-analytics"],
  },
] as const;

/** Core levers highlighted on every industry page */
export const INDUSTRY_CORE_SERVICES: readonly ServiceSlug[] = [
  "ai-automation",
  "web-development",
  "branding",
  "social-media-marketing",
  "seo-geo-aeo",
  "data-analytics",
] as const;

/** Subset shown in the Home services preview grid */
export const FEATURED_SERVICES: readonly ServiceSlug[] = [
  "branding",
  "digital-strategy",
  "social-media-marketing",
  "web-development",
  "ai-automation",
  "data-analytics",
] as const;

export const INDUSTRY_SLUGS = [
  "hospitality",
  "beauty-cosmetics",
  "interior-design",
  "schools-training",
  "insurance",
  "travel-agencies",
  "finance",
  "construction",
  "fashion-retail",
  "manufacturing",
  "gyms-fitness",
  "automotive",
  "laundry",
  "legal-services",
  "talent-management",
] as const;

export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];
