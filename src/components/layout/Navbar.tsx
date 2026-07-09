"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";
import { SITE } from "@/lib/constants";
import { cn, waLink } from "@/lib/utils";

/**
 * Anchor navigation while the site is a single crafted page — every link
 * lands somewhere real. Swap hrefs to routes as inner pages ship.
 */
const LINKS = [
  { key: "services", href: "#services" },
  { key: "industries", href: "#industries" },
  { key: "contact", href: "#contact" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bookHref = waLink(SITE.whatsappNumber, common("waPrefill"));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-out-expo",
        scrolled || open ? "glass bg-ink-950/70" : "border-b border-transparent"
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-content items-center justify-between px-6">
        {/* Wordmark */}
        <a href="#top" className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink-50">
            CDA
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-cdayellow" aria-hidden />
          <span className="ml-2 hidden text-[0.6rem] uppercase tracking-[0.25em] text-ink-400 md:block">
            Cameroon Digital Agency
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="group relative text-sm text-ink-200 transition-colors duration-300 hover:text-white"
            >
              {t(link.key)}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-cdagreen-bright transition-all duration-300 ease-out-expo group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <a
            href={bookHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-cdagreen px-5 py-2.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
          >
            {t("bookSession")}
          </a>
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/5 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {LINKS.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-3 font-display text-lg text-ink-100"
                >
                  {t(link.key)}
                </a>
              ))}
              <a
                href={bookHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 rounded-full bg-cdagreen px-5 py-3 text-center text-sm font-medium text-white"
              >
                {t("bookSession")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
