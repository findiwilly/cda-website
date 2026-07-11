import { CascadeHeading } from "@/components/motion/CascadeHeading";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/** The one section-header skeleton: eyebrow hairline → cascade heading → subtitle */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  center = false,
  as = "h2",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <Reveal>
        <div className={cn("flex items-center gap-4", center && "justify-center")}>
          <span className="h-px w-10 shrink-0 bg-cdagreen-bright" />
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright sm:text-xs">
            {eyebrow}
          </p>
          {center && <span className="h-px w-10 shrink-0 bg-cdagreen-bright" />}
        </div>
      </Reveal>
      <CascadeHeading
        as={as}
        className="mt-5 font-display text-display-md font-bold text-ink-50"
      >
        {title}
      </CascadeHeading>
      {subtitle && (
        <Reveal>
          <p className="mt-4 text-ink-300">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
