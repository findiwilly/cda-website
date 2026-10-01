import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

/** PWA manifest — makes the site installable and fixes theme colour in the browser UI. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.city}`,
    short_name: SITE.shortName,
    description:
      "Agence de transformation digitale IA à Yaoundé. Sites web, identité de marque, contenu, automatisation IA et agents virtuels.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0B",
    theme_color: "#0A0A0B",
    lang: "fr",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
