import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-cdagreen text-white shadow-glow-green hover:bg-cdagreen-bright hover:shadow-glow-green",
  ghost:
    "border border-white/15 text-ink-100 hover:border-white/40 hover:bg-white/5",
} as const;

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-medium transition-all duration-300 ease-out-expo",
        variants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
