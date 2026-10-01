import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Syne, Space_Grotesk } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/env";
import { SITE } from "@/lib/constants";
import {
  defaultOgImage,
  languageAlternates,
  localBusinessJsonLd,
} from "@/lib/seo";
import "../globals.css";

const displayFont = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  const ogImage = defaultOgImage(locale);

  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: title,
      template: `%s — ${SITE.name}`,
    },
    description,
    applicationName: SITE.name,
    // Only the email is a real link; no phone/death-birth metadata.
    alternates: languageAlternates("/"),
    manifest: "/manifest.webmanifest",
    openGraph: {
      title,
      description,
      url: languageAlternates("/").canonical,
      siteName: SITE.name,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? "en_US" : "fr_FR",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icon.svg" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        {/* LocalBusiness markup on every page: it is a single physical
            business, so repeating it site-wide is correct and improves
            eligibility for local results. */}
        <JsonLd data={localBusinessJsonLd(locale)} />
      </head>
      <body className="relative min-h-dvh noise">
        <NextIntlClientProvider messages={messages}>
          <SmoothScroll>
            <Navbar />
            {children}
            <Footer />
            <WhatsAppButton />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
