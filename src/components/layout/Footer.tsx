import { useTranslations } from "next-intl";
import { MapPin, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { NAV_ITEMS, SITE } from "@/lib/constants";
import { waLink } from "@/lib/utils";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const common = useTranslations("common");

  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-ink-900/30">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-cdagreen/10 blur-[120px]"
      />
      <div className="relative mx-auto max-w-content px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold tracking-tight text-ink-50">
                CDA
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-cdayellow" aria-hidden />
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
              {t("tagline")}
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm text-ink-400">
              <MapPin className="h-4 w-4 text-cdagreen-bright" />
              {t("location")}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-400">
              {t("explore")}
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-ink-200 transition-colors hover:text-white"
                  >
                    {nav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-ink-400">
              {t("contactCol")}
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={waLink(SITE.whatsappNumber, common("waPrefill"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-ink-200 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 text-cdagreen-bright" />
                  +237 6 50 07 78 12
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-ink-200 transition-colors hover:text-white"
                >
                  {nav("bookSession")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.name}. {t("rights")}
          </p>
          <p>{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
