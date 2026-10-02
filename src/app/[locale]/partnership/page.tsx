import { getTranslations } from "next-intl/server";
import { siteMetadata } from "@/lib/seo";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  const title = locale === "fr" ? "Partenariat & Investissement" : "Partnerships & Investment";
  const description =
    locale === "fr"
      ? "Devenez partenaire ou investisseur de Cameroon Digital Agency pour accélérer la digitalisation du Cameroun."
      : "Partner or invest with Cameroon Digital Agency to accelerate Cameroon's digital transformation.";
  return siteMetadata(locale, {
    title,
    description,
    path: "/partnership",
  });
}

export default async function PartnershipPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  const fr = locale === "fr";

  return (
    <main className="mx-auto flex max-w-content flex-col gap-16 px-6 py-12 md:gap-20 md:py-16">
      <header className="text-center">
        <p className="eyebrow">{fr ? "Partenariat & Investissement" : "Partnerships & Investment"}</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-50 md:text-5xl lg:text-6xl">
          {fr
            ? "Construisons ensemble la digitalisation du Cameroun"
            : "Building Cameroon's Digital Future Together"}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-400">
          {fr
            ? "Rejoignez Cameroon Digital Agency (CDA) en tant que partenaire stratégique ou investisseur. Nous créons des opportunités concrètes pour accélérer l'adoption numérique et générer de la valeur partagée."
            : "Join Cameroon Digital Agency (CDA) as a strategic partner or investor. Together, we create real opportunities to accelerate digital adoption while generating shared value."}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-cdagreen px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-cdagreen/90"
          >
            {fr ? "Nous contacter" : "Get in touch"}
          </Link>
        </div>
      </header>

      <section className="grid gap-8 md:grid-cols-3">
        {[
          {
            title: fr ? "Vision commune" : "Shared Vision",
            desc: fr
              ? "Aligner nos forces pour accélérer la transformation numérique du Cameroun, en faveur des entreprises, des jeunes et des communautés."
              : "Align our strengths to accelerate Cameroon's digital transformation for businesses, youth, and communities.",
          },
          {
            title: fr ? "Impact mesurable" : "Measurable Impact",
            desc: fr
              ? "Projets concrets (automatisations, sites, IA, infrastructures, vidéosurveillance, IoT) générant des résultats tangibles."
              : "Concrete projects (automation, websites, AI, infrastructure, CCTV, IoT) delivering tangible outcomes.",
          },
          {
            title: fr ? "Valeur partagée" : "Shared Value",
            desc: fr
              ? "Un modèle gagnant-gagnant : croissance, création d'emplois, renforcement des compétences et retours sur investissement."
              : "Win-win model: growth, job creation, skills development, and sustainable returns.",
          },
        ].map((b) => (
          <div key={b.title} className="glass rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-ink-50">{b.title}</h3>
            <p className="mt-2 text-sm text-ink-400">{b.desc}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-ink-50 md:text-3xl">
          {fr ? "Pourquoi devenir partenaire ?" : "Why Partner With Us?"}
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: fr ? "Couverture nationale" : "National Reach",
              desc: fr
                ? "Présence active à Yaoundé et Douala, avec capacité d'intervention sur tout le territoire."
                : "Active in Yaoundé and Douala, with capacity to serve across Cameroon.",
            },
            {
              title: fr ? "Offre technique complète" : "Full Technical Stack",
              desc: fr
                ? "Réseaux, vidéosurveillance, IoT, maintenance IT, IA, automatisation, web, données."
                : "Networks, CCTV, IoT, IT maintenance, AI, automation, web, data.",
            },
            {
              title: fr ? "Exécution pragmatique" : "Pragmatic Delivery",
              desc: fr
                ? "Solutions adaptées au contexte camerounais (connexion 3G, budgets réalistes, fiabilité)."
                : "Solutions built for Cameroon (3G realities, realistic budgets, reliability).",
            },
            {
              title: fr ? "Développement des talents" : "Talent Development",
              desc: fr
                ? "Formation, mentorat et opportunités pour les jeunes talents tech locaux."
                : "Training, mentoring, and opportunities for local tech talent.",
            },
            {
              title: fr ? "Modèles flexibles" : "Flexible Models",
              desc: fr
                ? "Partenariat commercial, co-développement, investissement ou joint-venture selon vos objectifs."
                : "Commercial partnerships, co-development, investment, or JV based on goals.",
            },
            {
              title: fr ? "Automatisation & IA" : "Automation & AI",
              desc: fr
                ? "YouTube Automation, SM Automation & Monétisation pour générer des revenus scalables."
                : "YouTube Automation, Social Media Automation & Monetization for scalable revenue.",
            },
          ].map((b) => (
            <div key={b.title} className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-ink-50">{b.title}</h3>
              <p className="mt-2 text-sm text-ink-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-ink-50 md:text-3xl">
          {fr ? "Types de partenariat" : "Partnership Opportunities"}
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[
            {
              title: fr ? "Partenaire stratégique" : "Strategic Partner",
              points: fr
                ? ["Co-développement de projets", "Accès à notre réseau client", "Référencements croisés"]
                : ["Co-develop projects", "Access to our client network", "Cross-referrals"],
            },
            {
              title: fr ? "Investisseur" : "Investor",
              points: fr
                ? ["Expansion des capacités", "Outils & infrastructures", "Scaling des offres IA/automatisation"]
                : ["Capacity expansion", "Tools & infrastructure", "Scale AI/automation offerings"],
            },
            {
              title: fr ? "Revendeur / Agent" : "Reseller / Agent",
              points: fr
                ? ["Commission attractive", "Formation & support", "Dossier de vente clé en main"]
                : ["Attractive commission", "Training & support", "Ready-to-sell packages"],
            },
            {
              title: fr ? "Académique / Institutionnel" : "Academic / Institutional",
              points: fr
                ? ["Stages, bootcamps, digitalisation des écoles", "Projets à impact social"]
                : ["Internships, bootcamps, school digitization", "High-impact projects"],
            },
          ].map((b) => (
            <div key={b.title} className="glass rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-ink-50">{b.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink-400">
                {b.points.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl border border-white/10 p-8 text-center">
        <h2 className="text-2xl font-bold text-ink-50 md:text-3xl">
          {fr ? "Prêt à collaborer ?" : "Ready to Partner?"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-400">
          {fr
            ? "Expliquez-nous vos objectifs de partenariat ou d'investissement. Nous vous recontacterons rapidement avec une proposition adaptée."
            : "Tell us about your partnership or investment goals. We'll get back to you quickly with a tailored proposal."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-cdagreen px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-cdagreen/90"
          >
            {fr ? "Écrire à CDA" : "Contact CDA"}
          </Link>
          <a
            href="mailto:info@cameroondigitalagency.com"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-ink-50 transition hover:bg-white/5"
          >
            info@cameroondigitalagency.com
          </a>
        </div>
      </section>
    </main>
  );
}