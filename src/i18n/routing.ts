import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["fr", "en"],
  // French first — this is a Cameroonian agency.
  defaultLocale: "fr",
  // `/` is French, `/en/...` is English. next-intl persists the visitor's
  // choice in the NEXT_LOCALE cookie, so the toggle survives revisits.
  localePrefix: "as-needed",
  // Don't sniff Accept-Language: the Cameroon market lands on French at `/`
  // regardless of browser settings; the navbar toggle is the way to switch.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

// Locale-aware drop-ins for next/navigation — always import these,
// never the next/link or next/navigation originals, for internal links.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
