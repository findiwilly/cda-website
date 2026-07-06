"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");
  const other = locale === "fr" ? "en" : "fr";

  return (
    <button
      type="button"
      aria-label={t("languageToggle")}
      onClick={() => router.replace(pathname, { locale: other })}
      className="group flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium tracking-widest text-ink-200 transition-colors duration-300 hover:border-white/30 hover:text-white"
    >
      <Globe className="h-3.5 w-3.5 text-cdagreen-bright transition-transform duration-500 ease-out-expo group-hover:rotate-180" />
      {other.toUpperCase()}
    </button>
  );
}
