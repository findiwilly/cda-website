/**
 * Shared site data — single source of truth for nav, services and industries.
 * Slugs are locale-neutral; display names come from src/messages/*.json.
 */

export const SITE = {
  name: "Cameroon Digital Agency",
  shortName: "CDA",
  city: "Yaoundé",
  country: "CM",
  // TODO: replace with the real business number before launch
  whatsappNumber: "+237600000000",
  calcomUrl: "https://cal.com/cda/strategy-session",
} as const;

export const NAV_ITEMS = [
  { key: "services", href: "/services" },
  { key: "aiAgents", href: "/ai-agents" },
  { key: "industries", href: "/industries" },
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
  { key: "resources", href: "/resources" },
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
  "e-invitations",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

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
