import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Side-by-side section: media on one side, copy on the other.
 *
 * The `reverse` prop flips which side the media takes. On mobile both stack, and
 * the media always comes first — on a phone that is the only way the section
 * still reads top-to-bottom as "look, then read".
 *
 * Media is rendered through `next/image` with explicit dimensions, so the
 * browser reserves the box before the bytes arrive. A missing `sizes` hint would
 * make Next download desktop-width art on a 360px screen.
 */
export function SplitMedia({
  src,
  alt,
  width,
  height,
  eyebrow,
  title,
  body,
  aside,
  reverse = false,
  priority = false,
  caption,
}: {
  src: string;
  /**
   * Required, and it must describe the content. `alt=""` is only correct when
   * the image is purely decorative — which for a section illustration it usually
   * is not, since it carries meaning the copy does not repeat.
   */
  alt: string;
  width: number;
  height: number;
  eyebrow?: string;
  title: string;
  body: React.ReactNode;
  /** Optional supporting line under the body — a stat, a caveat, a link. */
  aside?: React.ReactNode;
  /** Put the media on the right. */
  reverse?: boolean;
  /** Above the fold on a phone, so load eagerly and skip lazy loading. */
  priority?: boolean;
  caption?: string;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn(reverse && "lg:order-2")}>
        <figure>
          <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 40rem"
              className="h-full w-full object-cover"
            />
          </div>
          {caption && (
            <figcaption className="mt-3 text-center text-xs text-ink-500">
              {caption}
            </figcaption>
          )}
        </figure>
      </div>

      <div className={cn(reverse && "lg:order-1")}>
        {eyebrow && (
          <div className="flex items-center gap-4">
            <span className="h-px w-10 shrink-0 bg-cdagreen-bright" aria-hidden />
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright">
              {eyebrow}
            </p>
          </div>
        )}

        <h2 className="mt-5 font-display text-display-sm font-bold text-ink-50">{title}</h2>

        <div className="mt-5 space-y-4 text-ink-300">{body}</div>

        {aside && <div className="mt-8">{aside}</div>}
      </div>
    </div>
  );
}