import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["fr", "en"],
  // French first — this is a Cameroonian agency.
  defaultLocale: "fr",
  // `/` is French, `/en/...` is English.
  localePrefix: "as-needed",
  // ON, and deliberately so. With this off, next-intl's middleware skips
  // `syncLocaleCookie` entirely (see middleware.js: `localeDetection &&
  // localeCookie`), so the navbar toggle wrote NEXT_LOCALE on the client and
  // nothing ever read it back: the language choice silently reset on the next
  // visit, and the cookie policy's description of this cookie was false.
  //
  // Resolution order is cookie, then Accept-Language, then `defaultLocale`. So
  // this only changes what happens to someone arriving with *no* prior choice:
  // an English-language browser now gets English instead of being forced onto
  // French, and everyone with no signal still lands on French. Reverting to
  // `false` restores the old behaviour in one line.
  localeDetection: true,
  // Stated explicitly rather than inherited, because the retention figure is
  // published in the cookie policy and must not drift when next-intl changes.
  localeCookie: {
    name: "NEXT_LOCALE",
    // one year, matching the cookie policy
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  },
});

export type Locale = (typeof routing.locales)[number];

/** Re-exported for code that needs a locale at edge or module scope. */
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;

// Locale-aware drop-ins for next/navigation — always import these,
// never the next/link or next/navigation originals, for internal links.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
