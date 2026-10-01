import { cn } from "@/lib/utils";

/**
 * Decorative background imagery for a section.
 *
 * Three variants:
 *  - `variant="photo"`   — a real photograph (`src` required). Preferred.
 *  - `variant="grid"`    — tiled fine grid, for "structured / engineered" sections
 *  - `variant="contours"`— a wide topographic field, for "mapping / reach"
 *
 * `photo` is the target state. The two SVG variants are what ships today,
 * because photo bytes could not be downloaded in the build environment. See
 * `src/lib/images.ts` for the drop-in path — it is a one-file change.
 *
 * Everything here is `aria-hidden` and `pointer-events-none`: it must never be
 * reachable by a screen reader and must never intercept a click meant for the
 * content sitting on top of it.
 *
 * The parent's `overflow-hidden` clips the oversized offsets, which is what lets
 * a single asset cover any section height.
 */
export function SectionBackdrop({
  variant = "grid",
  src,
  className,
  opacity = 0.06,
}: {
  variant?: "photo" | "grid" | "contours";
  /** Required when `variant="photo"`. */
  src?: string;
  className?: string;
  /**
   * Kept low on purpose. Above ~0.12 the text loses contrast against the layer.
   * A photograph needs a *lower* value than an SVG does, not a higher one —
   * photographs have high local variance, so the same opacity reads darker and
   * noisier over body copy.
   */
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {variant === "photo" && src ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${src})`, opacity }}
        />
      ) : variant === "grid" ? (
        <div
          className="absolute inset-0 bg-[url('/img/grid.svg')] bg-[length:120px_120px]"
          style={{ opacity }}
        />
      ) : (
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-[url('/img/contours.svg')] bg-cover bg-center"
          style={{ opacity }}
        />
      )}

      {/*
        Fade the layer out towards the edges so it never forms a visible
        rectangle boundary against the page background. A photograph leans on
        this harder than an SVG does — it is what keeps the top of a masthead
        from reading as a pasted-in rectangle.
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/60 to-ink-950" />
    </div>
  );
}