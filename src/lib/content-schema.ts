import "server-only";

import { z } from "zod";

/**
 * Content model for everything an admin can author: blog posts, testimonials
 * and FAQs. Schemas are Zod so the same shape validates on the way in (admin
 * forms, API routes) and on the way out (database reads).
 *
 * Two rules shape these types:
 *
 *  1. **Bilingual by document, not by field.** A French post and its English
 *     translation are two documents sharing a `translationOf` pointer. This
 *     keeps admin editing simple — no side-by-side fields — and lets one
 *     language ship before its translation exists.
 *  2. **Nothing is trusted at render time.** Slugs, status and locale are
 *     enums derived from closed sets, so a bad write can't produce an
 *     unrenderable page.
 */

export const LOCALES = ["fr", "en"] as const;
export const POST_STATUSES = ["draft", "published"] as const;
export const TESTIMONIAL_STATUSES = ["pending", "approved", "rejected"] as const;

export type Locale2 = (typeof LOCALES)[number];

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

/**
 * A Cloudinary asset. `publicId` is the source of truth — we store and read the
 * CDN URL back out of it so transforms can be applied at render time without
 * re-uploading.
 */
export const imageAssetSchema = z.object({
  publicId: z.string().min(1),
  /** Secure delivery URL captured at upload time.
   *  Stored so client components can render a preview without importing the
   *  server-only Cloudinary module. Responsive transforms are still applied at
   *  render time from `publicId` (see `lib/cloudinary.ts`). */
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().max(200).optional(),
});

export type ImageAsset = z.infer<typeof imageAssetSchema>;

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

export const postSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens"),
  title: z.string().min(3).max(160),
  excerpt: z.string().min(10).max(320),
  /** Markdown. Rendered through `marked` then `sanitize-html` — see lib/markdown.ts. */
  content: z.string().min(1),
  category: z.string().min(2).max(48),
  cover: imageAssetSchema.nullable(),
  locale: z.enum(LOCALES),
  status: z.enum(POST_STATUSES),
  /** Minutes. Derived from content length on write, never typed by hand. */
  readingTime: z.number().int().nonnegative(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(180).optional(),
  translationOf: z.string().nullable(),
});

export type PostInput = z.infer<typeof postSchema>;

/** A post as stored, with database-managed fields added. */
export type Post = PostInput & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export const testimonialSchema = z.object({
  name: z.string().min(2).max(80),
  role: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  quote: z.string().min(20).max(900),
  rating: z.number().int().min(1).max(5),
  /** Optional proof of identity — a real person is more persuasive than an initial. */
  website: z.string().url().max(200).optional().or(z.literal("")),
  locale: z.enum(LOCALES),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export type Testimonial = TestimonialInput & {
  _id: string;
  status: (typeof TESTIMONIAL_STATUSES)[number];
  /** How it arrived — public form, or typed in by CDA. */
  source: "form" | "manual";
  createdAt: string;
  reviewedAt: string | null;
};

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export const faqSchema = z.object({
  question: z.string().min(5).max(200),
  answer: z.string().min(5).max(2000),
  category: z.string().min(2).max(48),
  locale: z.enum(LOCALES),
  /** Manual sort position within its category. Lower comes first. */
  order: z.number().int().nonnegative(),
  /** Pinned to the top of the FAQ page. */
  featured: z.boolean(),
});

export type FaqInput = z.infer<typeof faqSchema>;

export type Faq = FaqInput & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Contact leads
// ---------------------------------------------------------------------------

export const leadSchema = z.object({
  name: z.string().min(2).max(120),
  business: z.string().max(160).optional(),
  niche: z.string().max(64).optional(),
  /** Always stored E.164 digits without `+`, e.g. `237650077812`. */
  whatsapp: z.string().min(9).max(15).regex(/^\d+$/),
  email: z.string().email().max(200).optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
  locale: z.enum(LOCALES),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Roughly 200 words per minute, the usual editorial convention. */
export function readingTimeFor(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
