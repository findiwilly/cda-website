import { ImageResponse } from "next/og";
import { defaultLocale } from "@/i18n/routing";

/**
 * Social share card, 1200×630.
 *
 * Served from a fixed, predictable URL (`/api/og?locale=fr`) rather than the
 * file-based `opengraph-image` convention, because schema.org `image` fields and
 * `metadata.openGraph.images` both need a stable absolute URL they can cite.
 * Next caches the response at the edge, so this is generated once per locale.
 *
 * Uses only inline styles — no external font fetch, no image assets — so it
 * renders identically in CI, on Vercel and on a laptop with no network.
 */

export const runtime = "edge";

const INK_950 = "#0A0A0B";
const INK_800 = "#17171A";
const INK_50 = "#F2F2F5";
const INK_300 = "#7C7C87";
const GREEN = "#007A5E";
const GREEN_BRIGHT = "#00A67E";
const YELLOW = "#FCD116";
const RED = "#CE1126";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : defaultLocale;

  // Copy lives inline rather than in next-intl: this route runs on the edge
  // runtime, where pulling the full message bundle in just for two strings
  // would cost more than it saves. Both locales are kept here deliberately.
  const copy = {
    en: {
      headline: "World-class digital presence for your business.",
      subline: "AI, web, brand, content — one senior team in Yaoundé.",
      place: "Yaoundé · Cameroon",
    },
    fr: {
      headline: "Une présence digitale de classe mondiale pour votre entreprise.",
      subline: "IA, web, marque, contenu — une seule équipe senior à Yaoundé.",
      place: "Yaoundé · Cameroun",
    },
  }[locale];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: INK_950,
          backgroundImage: `radial-gradient(circle at 15% 0%, ${GREEN}44 0%, transparent 55%), radial-gradient(circle at 95% 100%, ${YELLOW}22 0%, transparent 45%)`,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top row: monogram + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "76px",
              height: "76px",
              borderRadius: "20px",
              background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_BRIGHT} 100%)`,
              fontSize: "34px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "white",
            }}
          >
            C
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: INK_50,
                letterSpacing: "-0.01em",
              }}
            >
              Cameroon Digital Agency
            </span>
            <span
              style={{
                fontSize: "17px",
                color: INK_300,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                marginTop: "4px",
              }}
            >
              {copy.place}            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "900px" }}>
          <div
            style={{
              display: "flex",
              height: "6px",
              width: "110px",
              backgroundColor: GREEN_BRIGHT,
              marginBottom: "34px",
            }}
          />
          <span
            style={{
              fontSize: "62px",
              lineHeight: 1.1,
              fontWeight: 700,
              color: INK_50,
              letterSpacing: "-0.03em",
            }}
          >
            {copy.headline}
          </span>
          <span
            style={{
              fontSize: "26px",
              color: INK_300,
              marginTop: "26px",
              letterSpacing: "0.01em",
            }}
          >
            {copy.subline}
          </span>
        </div>

        {/* Flag rule */}
        <div style={{ display: "flex", height: "8px", width: "100%" }}>
          <div style={{ flex: 1, backgroundColor: GREEN }} />
          <div style={{ flex: 1, backgroundColor: RED }} />
          <div style={{ flex: 1, backgroundColor: YELLOW }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
