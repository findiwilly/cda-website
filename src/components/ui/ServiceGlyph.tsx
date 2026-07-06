import type { ServiceSlug } from "@/lib/constants";

/**
 * Minimal stroke glyphs for the Home services preview. Placeholders until the
 * 3D service icons ship with the full Services page.
 */
const GLYPHS: Partial<Record<ServiceSlug, React.ReactNode>> = {
  branding: (
    <>
      <path d="M12 3l7.5 7.2L12 21 4.5 10.2 12 3Z" />
      <path d="M4.5 10.2h15" />
    </>
  ),
  "digital-strategy": (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  "social-media-marketing": (
    <>
      <path d="M3.5 5.5h11v8h-7l-4 3.5v-11.5Z" />
      <path d="M17.5 9.5h3v8L17 15h-5.5" />
    </>
  ),
  "web-development": (
    <>
      <path d="m8 8-4.5 4L8 16" />
      <path d="m16 8 4.5 4L16 16" />
      <path d="M13.5 5.5 10.5 18.5" />
    </>
  ),
  "ai-automation": (
    <>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="18" cy="7.5" r="2.4" />
      <circle cx="12" cy="18" r="2.4" />
      <path d="M8.2 7 15.6 8M7 8.2l4 7.6M16.9 9.6 13 16" />
    </>
  ),
  "data-analytics": (
    <>
      <path d="M4 20h16" />
      <path d="M6.5 20v-6M12 20V5.5M17.5 20v-9" />
    </>
  ),
};

export function ServiceGlyph({
  slug,
  className,
}: {
  slug: ServiceSlug;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {GLYPHS[slug]}
    </svg>
  );
}
