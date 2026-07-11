"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageToggle } from "./LanguageToggle";
import { dropIn } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

const LINKS = [
  { key: "services", href: "/services" },
  { key: "aiAgents", href: "/ai-agents" },
  { key: "industries", href: "/industries" },
  { key: "about", href: "/about" },
  { key: "resources", href: "/resources" },
  { key: "blog", href: "/blog" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-out-expo",
        scrolled || open ? "glass bg-ink-950/70" : "border-b border-transparent"
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-content items-center justify-between px-6">
        {/* Wordmark */}
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink-50">
            CDA
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cdayellow" aria-hidden />
          <span className="ml-2 hidden text-[0.6rem] uppercase tracking-[0.25em] text-ink-400 xl:block">
            Cameroon Digital Agency
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "group relative text-sm transition-colors duration-300 hover:text-white",
                  active ? "text-white" : "text-ink-200"
                )}
              >
                {t(link.key)}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-cdagreen-bright transition-all duration-300 ease-out-expo",
                    active ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Link
            href="/contact"
            className="rounded-full bg-cdagreen px-5 py-2.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
          >
            {t("bookSession")}
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 lg:hidden">
          <LanguageToggle />
          <button
            type="button"
            aria-label={open ? common("close") : common("menu")}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink-100"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropIn}
            className="glass absolute inset-x-0 top-full border-t border-white/5 bg-ink-950/90 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-3 font-display text-lg text-ink-100"
                >
                  {t(link.key)}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-3 rounded-full bg-cdagreen px-5 py-3 text-center text-sm font-medium text-white"
              >
                {t("bookSession")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
