/**
 * Legal document registry.
 *
 * Kept out of the page module on purpose: Next.js requires page files to export
 * only a known set of names, so a `LEGAL_SLUGS` constant declared in
 * `app/[locale]/legal/[slug]/page.tsx` fails the type check.
 */

export const LEGAL_SLUGS = ["privacy", "terms", "cookies"] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value);
}

/** One legal section: a heading, prose paragraphs, and optional bullets. */
export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};
