import { useTranslations } from "next-intl";
import { SITE } from "@/lib/constants";

export function WhatsAppButton() {
  const t = useTranslations("common");
  const href = `https://wa.me/${SITE.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappLabel")}
      className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cdagreen text-white shadow-glow-green transition-transform duration-300 ease-out-expo hover:scale-105"
    >
      <span
        className="absolute inset-0 -z-10 rounded-full bg-cdagreen/50 animate-pulse-soft"
        aria-hidden
      />
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
        <path
          d="M12 3a9 9 0 0 0-7.85 13.4L3 21l4.75-1.1A9 9 0 1 0 12 3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.1 8.4c.2-.45.44-.47.72-.48l.61-.01c.19 0 .45.07.63.5l.79 1.88c.07.16.05.37-.07.54l-.47.6c-.13.17-.17.4-.03.65a6.6 6.6 0 0 0 2.62 2.4c.28.13.5.1.68-.09l.63-.72c.16-.19.38-.25.58-.16l1.84.87c.24.11.36.28.34.48-.08.86-.77 1.7-1.6 1.82-1.5.21-5.2-1.2-6.8-4.55-.56-1.17-.75-2.5-.47-3.73Z"
          fill="currentColor"
        />
      </svg>
    </a>
  );
}
