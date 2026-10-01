import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/content-schema";
import { useTranslations } from "next-intl";

/**
 * One approved testimonial.
 *
 * The five stars are rendered twice on purpose: a filled row for sighted users
 * and an `sr-only` sentence for screen readers. A row of bare `★` glyphs would
 * otherwise be announced as "black star black star black star…", which conveys
 * nothing.
 *
 * The rating is an `<img>`-free, purely decorative flourish — the meaning lives
 * in the sr-only text, so nothing here depends on colour or shape alone.
 */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const t = useTranslations("testimonials");

  const attribution = [testimonial.role, testimonial.company]
    .filter(Boolean)
    .join(", ");

  return (
    <figure className="glass flex h-full flex-col rounded-2xl p-7">
      <Quote aria-hidden className="h-6 w-6 shrink-0 text-cdagreen/50" />

      <div className="mt-5 flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            aria-hidden
            className={
              index < testimonial.rating
                ? "h-4 w-4 fill-cdayellow text-cdayellow"
                : "h-4 w-4 fill-transparent text-ink-600"
            }
          />
        ))}
        <span className="sr-only">
          {t("form.ratingValue", { count: testimonial.rating })}
        </span>
      </div>

      <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink-200">
        {testimonial.quote}
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
        {/* Initials stand in for a photo: a testimonial needs a person, not a
            stock avatar, and inventing faces for real quotes would be worse
            than an initial. */}
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cdagreen/15 text-sm font-semibold text-cdagreen-bright ring-1 ring-cdagreen/25"
        >
          {initialsOf(testimonial.name)}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink-50">
            {testimonial.website ? (
              <a
                href={testimonial.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="transition-colors duration-300 hover:text-cdagreen-bright"
              >
                {testimonial.name}
              </a>
            ) : (
              testimonial.name
            )}
          </span>
          {attribution && (
            <span className="block truncate text-xs text-ink-400">{attribution}</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

/** First letter of the first and last word: "Camille Njoya" → "CN". */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}