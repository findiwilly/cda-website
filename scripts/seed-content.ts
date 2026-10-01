/**
 * Seed content: FAQs, testimonials and blog posts.
 *
 * Split out of `seed.ts` so the content can be reviewed and edited as data
 * rather than buried in the seeding logic.
 *
 * ── Editorial rules this file follows ──────────────────────────────────────
 *
 * 1. **No invented claims about the business.** No fabricated client counts,
 *    client names, testimonials, awards, guarantees or statistics about CDA.
 *    Anything a seed script invents about a real company reads as fact to a
 *    visitor, which is how false advertising happens.
 *
 * 2. **Commercial terms come from the site copy, not from here.** Pricing,
 *    timelines, payment methods and after-delivery terms are already stated in
 *    `src/messages/*.json` under `contact.faq`. These FAQs restate them in the
 *    same terms. If you change one, change the other — a visitor reading the
 *    contact page and the FAQ page must not see two different answers.
 *
 * 3. **Market figures are researched and attributable.** Population, internet
 *    penetration, connection speeds and price ranges are public data. They are
 *    stated with their figure and date so a reader can check them. Sources are
 *    listed at the bottom of this file.
 *
 * 4. **FAQ answers are plain text.** `faq/page.tsx` renders `answer` straight
 *    into the accordion *and* into the FAQPage JSON-LD. Markdown is not parsed
 *    there, so asterisks would appear literally and would also leak into the
 *    structured data.
 *
 * 5. **Blog bodies start at `##`.** The article page renders
 *    `<h1>{post.title}</h1>` itself. `outlineOf()` only collects `#{2,3}`, so a
 *    leading `# ` would produce a second h1 and a heading the table of contents
 *    never sees.
 *
 * ── Sources ────────────────────────────────────────────────────────────────
 *
 *  - DataReportal, *Digital 2025: Cameroon* (Kemp, March 2025) — population,
 *    connections, penetration, social media, speeds. Figures dated January 2025.
 *  - honadi.com, *Combien coûte un site web au Cameroun ?* — price tiers and
 *    annual running costs.
 *  - sinedev.com, *Création de site web au Cameroun : prix, agences et
 *    conseils 2025* — price tiers with timelines, and the mobile-money
 *    aggregator landscape.
 *
 * Price ranges are what the market charges, not what CDA charges. CDA quotes
 * individually per the site copy.
 */

export type Locale = "fr" | "en";

export type FaqSeed = {
  /**
   * Stable identifier, shared by both languages of the same question.
   *
   * The question text cannot serve this purpose: it is translated, so the
   * French and English rows legitimately differ. This is the join key.
   */
  key: string;
  question: string;
  answer: string;
  category: string;
  locale: Locale;
  order: number;
  featured: boolean;
};

export type TestimonialSeed = {
  name: string;
  role?: string;
  company?: string;
  quote: string;
  rating: number;
  website?: string;
  locale: Locale;
  status: "pending" | "approved" | "rejected";
  source: "form" | "manual";
};

export type PostSeed = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  locale: Locale;
  status: "draft" | "published";
  metaTitle?: string;
  metaDescription?: string;
  /** Slug of the post in the other language; resolved to an `_id` by `seed.ts`. */
  translationOfSlug: string | null;
};

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------
//
// Bilingual by document: a French FAQ and its English version are two rows,
// not two fields on one row. `question` is the search key used to pair them, so
// each translation carries the same question text.

export const FAQ_SEED: FaqSeed[] = [
  // ---------------------------------------------------------------- Tarifs --
  {
    key: "market-price-ranges",
    question: "Combien coûte un site web au Cameroun ?",
    answer:
      "Les prix constatés sur le marché camerounais en 2025-2026 vont de 70 000 FCFA pour un mini-site d'une page à plus de 1 500 000 FCFA pour un portail sur mesure. Un site vitrine professionnel de 4 à 7 pages se situe entre 150 000 et 400 000 FCFA. Un site avec blog et référencement démarre vers 300 000 à 750 000 FCFA. Une boutique en ligne commence autour de 300 000 FCFA pour 20 à 50 produits avec paiement Mobile Money, et dépasse facilement 600 000 à 800 000 FCFA dès qu'il faut gérer les stocks. Chez CDA, chaque projet est chiffré sur mesure : vous repartez de la session stratégique avec une fourchette claire avant tout engagement.",
    category: "Tarifs",
    locale: "fr",
    order: 0,
    featured: true,
  },
  {
    key: "annual-running-cost",
    question: "Combien coûte un site par an, une fois livré ?",
    answer:
      "Un site est un budget récurrent, pas un achat ponctuel. Sur le marché camerounais, comptez 8 000 à 20 000 FCFA par an pour un nom de domaine selon l'extension, 30 000 à 80 000 FCFA par an pour un hébergement de qualité, et 10 000 à 25 000 FCFA par mois pour la maintenance, les mises à jour et la sécurité. Une offre à 5 000 FCFA par an paraît économique, mais elle cache le plus souvent un serveur lent, des pannes fréquentes et aucun support technique.",
    category: "Tarifs",
    locale: "fr",
    order: 1,
    featured: false,
  },
  {
    key: "too-cheap-quote",
    question: "Pourquoi certaines agences annoncent-elles 50 000 FCFA ?",
    answer:
      "C'est le prix d'un thème prêt à l'emploi, pas d'un site construit pour votre activité. Une agence qui promet un site livré en 48 heures pour 60 000 FCFA réutilise un modèle générique sans personnalisation réelle. Vous obtenez une page qui ressemble à des centaines d'autres, sans référencement local, sans optimisation mobile et sans votre charte. Un devis qui ne mentionne ni le nombre de pages, ni les contenus à fournir, ni l'hébergement inclus, est un devis de modèle.",
    category: "Tarifs",
    locale: "fr",
    order: 2,
    featured: false,
  },
  {
    key: "european-agency-premium",
    question: "Une agence européenne coûte-t-elle forcément plus cher ?",
    answer:
      "Pour un résultat comparable, une agence européenne facture généralement le même travail entre 400 000 et 1 500 000 FCFA. L'écart se justifie par la proximité, la connaissance du marché local, la facturation en FCFA et l'acceptation de Mobile Money. Il se justifie mal si l'échange se fait uniquement en anglais et que personne ne connaît le terrain.",
    category: "Tarifs",
    locale: "fr",
    order: 3,
    featured: false,
  },

  // ------------------------------------------------------- Marché camerounais
  {
    key: "facebook-versus-website",
    question: "J'ai déjà une page Facebook. Un site, pour quoi faire ?",
    answer:
      "Facebook reste le premier canal social du pays : environ 5,45 millions d'utilisateurs au Cameroun début 2025, soit 18,5 % de la population. Mais c'est une vitrine louée : l'algorithme décide qui vous voit, et la portée d'une publication reste à la merci d'un changement de règles. Votre site est votre terrain : une adresse que vous possédez, que Google indexe, qui reçoit vos campagnes et qui convertit sans intermédiaire. Les deux se complètent, Facebook capte l'attention et le site transforme.",
    category: "Marché camerounais",
    locale: "fr",
    order: 0,
    featured: true,
  },
  {
    key: "seo-effectiveness",
    question: "Le référencement naturel fonctionne-t-il vraiment au Cameroun ?",
    answer:
      "Oui, mais il ne joue pas le même rôle qu'en Europe. Le taux de pénétration internet était de 41,9 % début 2025, avec 12,4 millions d'internautes. Votre audience est plus petite mais plus qualifiée : quelqu'un qui cherche votre service sur Google a déjà l'intention d'acheter. C'est pourquoi le référencement local et la recherche vocale comptent davantage ici, une large part des recherches se faisant sur un téléphone, en français, et souvent à voix haute.",
    category: "Marché camerounais",
    locale: "fr",
    order: 1,
    featured: false,
  },
  {
    key: "customers-really-online",
    question: "Mes futurs clients sont-ils vraiment en ligne ?",
    answer:
      "Une partie importante ne l'est pas : environ 58,1 % de la population, soit 17,1 millions de personnes, n'utilisaient pas internet début 2025. Un site seul ne couvre donc pas tout le marché. La combinaison qui fonctionne associe un site qui explique et rassure, un numéro WhatsApp joignable en un clic, et des campagnes qui touchent aussi hors ligne. Nous concevons le site comme le point de conversion vers WhatsApp, pas comme un remplacement de la relation.",
    category: "Marché camerounais",
    locale: "fr",
    order: 2,
    featured: false,
  },
  {
    key: "advertising-channel-choices",
    question: "Dans quels canaux placer mon budget publicitaire ?",
    answer:
      "Les chiffres de début 2025 sont assez nets. Facebook concentrait environ 5,45 millions d'utilisateurs au Cameroun, LinkedIn environ 1,40 million, et la portée publicitaire d'Instagram équivalait à 2,0 % de la population. Facebook reste donc le canal de masse. LinkedIn n'a de sens que pour une offre B2B ou une clientèle internationale. Instagram ne justifie pas, à lui seul, un budget important. Le bon critère n'est pas l'audience totale mais le coût par contact obtenu.",
    category: "Marché camerounais",
    locale: "fr",
    order: 3,
    featured: false,
  },

  // -------------------------------------------------------------- Technique
  {
    key: "slow-website",
    question: "Pourquoi mon site est-il si lent ?",
    answer:
      "La connexion fixe médiane au Cameroun était de 9,48 Mb/s début 2025, et 83,6 % des connexions mobiles sont compatibles haut débit. Sur un réseau réel, une page de plusieurs mégaoctets met plusieurs secondes à s'afficher, et le délai s'aggrave sur les terminaux d'entrée de gamme, majoritaires ici. Les causes les plus fréquentes sont des images non compressées, des polices non optimisées, des scripts de suivi empilés et un site testé uniquement depuis une connexion rapide. Visez moins de 1 Mo pour la première page.",
    category: "Technique",
    locale: "fr",
    order: 0,
    featured: false,
  },
  {
    key: "taking-payments",
    question: "Comment encaisser des paiements sur mon site ?",
    answer:
      "Deux opérateurs dominent le paiement mobile au Cameroun : Orange Money et MTN Mobile Money. Les couvrir tous les deux est le minimum, sinon vous renoncez à une part importante du marché. Plutôt que deux intégrations séparées, un agrégateur local simplifie le développement : NotchPay regroupe Orange Money, MTN Money et la carte bancaire dans une seule intégration, et Monetbil comme PayDunya sont des alternatives établies. La carte bancaire seule ne suffit pas, une large part de la population paie avec son téléphone.",
    category: "Technique",
    locale: "fr",
    order: 1,
    featured: false,
  },
  {
    key: "online-store-reality",
    question: "Une boutique en ligne, comment ça se vend vraiment ?",
    answer:
      "Le catalogue WhatsApp reste un canal de vente à part entière, souvent avant le site. Sur le marché, une boutique simple de 20 à 50 produits avec paiement MTN Mobile Money démarre autour de 300 000 FCFA. Une boutique avec gestion des stocks et tableau de bord dépasse facilement 600 000 à 800 000 FCFA, et les projets les plus complets se situent entre 500 000 et 1 800 000 FCFA sur 4 à 8 semaines. L'ordre qui fonctionne le mieux : un catalogue WhatsApp pour valider la demande, puis un site pour convertir et fidéliser.",
    category: "Technique",
    locale: "fr",
    order: 2,
    featured: false,
  },
  {
    key: "what-is-an-ai-agent",
    question: "Qu'est-ce qu'un agent IA, concrètement ?",
    answer:
      "C'est un assistant qui répond à vos clients sur WhatsApp 24h/24, qualifie les demandes, et vous transmet uniquement les conversations qui méritent un humain. Il se branche sur les outils que vous utilisez déjà, une feuille de calcul, votre logiciel de caisse, votre site, et il est entraîné sur vos informations plutôt que sur des réponses génériques. Dans un marché où l'échange se fait majoritairement sur WhatsApp, c'est le canal où une réponse immédiate change réellement le résultat.",
    category: "Technique",
    locale: "fr",
    order: 3,
    featured: false,
  },
  {
    key: "data-security",
    question: "Mes données sont-elles en sécurité ?",
    answer:
      "Les échanges sont chiffrés, les accès sont nominatifs, et vos données ne sont ni revendues ni utilisées pour entraîner un modèle tiers. Les agents que nous déployons tournent dans un espace dédié, avec une durée de conservation configurable : vous décidez de ce qui est conservé et pendant combien de temps.",
    category: "Technique",
    locale: "fr",
    order: 4,
    featured: false,
  },

  // ------------------------------------------------------------ Organisation
  {
    key: "timelines",
    question: "Quels sont vos délais ?",
    answer:
      "Un site vitrine : 2 à 4 semaines. Une identité complète : 3 semaines. L'Offre Signature : 30 jours. Les projets logiciels dépendent du périmètre, et nous nous engageons sur des dates plutôt que sur des promesses. Ces repères sont cohérents avec le marché camerounais, où un site professionnel se compte en 3 à 5 semaines et une boutique en ligne en 4 à 8 semaines. Vous recevez un calendrier avec un point de validation entre chaque étape.",
    category: "Organisation",
    locale: "fr",
    order: 0,
    featured: true,
  },
  {
    key: "payment-terms",
    question: "Comment se passe le paiement ?",
    answer:
      "MTN Mobile Money, Orange Money ou virement bancaire. Un paiement échelonné est possible sur la plupart des projets. Le montant et l'échéancier sont confirmés avant le démarrage, pour que la facturation ne soit jamais une surprise en cours de route.",
    category: "Organisation",
    locale: "fr",
    order: 1,
    featured: true,
  },
  {
    key: "after-delivery",
    question: "Et après la livraison ?",
    answer:
      "Nous ne disparaissons pas. Maintenance, mise à jour de contenu et campagnes : des formules d'accompagnement mensuel existent, sans engagement forcé. Sur le marché, la maintenance se situe entre 10 000 et 25 000 FCFA par mois. C'est le budget qui maintient le site en ligne et vos tarifs à jour.",
    category: "Organisation",
    locale: "fr",
    order: 2,
    featured: false,
  },
  {
    key: "working-outside-yaounde",
    question: "Travaillez-vous avec des clients hors de Yaoundé ?",
    answer:
      "Oui, et c'est le fonctionnement normal. Tout se fait à distance, par appel vidéo et partage d'écran, avec validation en ligne. Un déplacement n'est pas facturé en supplément. Pour la facturation, MTN Mobile Money et Orange Money couvrent l'ensemble du pays.",
    category: "Organisation",
    locale: "fr",
    order: 3,
    featured: false,
  },
  {
    key: "not-satisfied",
    question: "Et si je ne suis pas satisfait du résultat ?",
    answer:
      "Vous validez avant chaque étape de livraison, pas seulement à la fin. Si la dernière retouche ne vous convient pas, nous la refaisons sans la facturer une deuxième fois. L'objectif est que vous ne découvriez jamais le résultat final pour la première fois le jour de la mise en ligne.",
    category: "Organisation",
    locale: "fr",
    order: 4,
    featured: false,
  },

  // =========================================================== English (en) ==
  {
    key: "market-price-ranges",
    question: "How much does a website cost in Cameroon?",
    answer:
      "Prices observed on the Cameroonian market in 2025-2026 range from 70,000 FCFA for a single-page mini-site to more than 1,500,000 FCFA for a custom portal. A professional brochure site of 4 to 7 pages sits between 150,000 and 400,000 FCFA. A site with a blog and SEO starts around 300,000 to 750,000 FCFA. An online store starts near 300,000 FCFA for 20 to 50 products with mobile-money payment, and easily passes 600,000 to 800,000 FCFA once stock management is required. At CDA every project is quoted individually: you leave the strategy session with a clear range before any commitment.",
    category: "Pricing",
    locale: "en",
    order: 0,
    featured: true,
  },
  {
    key: "annual-running-cost",
    question: "How much does a website cost per year?",
    answer:
      "A website is a recurring budget, not a one-off purchase. On the Cameroonian market, expect 8,000 to 20,000 FCFA per year for a domain name depending on the extension, 30,000 to 80,000 FCFA per year for decent hosting, and 10,000 to 25,000 FCFA per month for maintenance, updates and security. A 5,000 FCFA per year offer looks attractive, but it usually hides a slow server, frequent outages and no technical support.",
    category: "Pricing",
    locale: "en",
    order: 1,
    featured: false,
  },
  {
    key: "too-cheap-quote",
    question: "Why do some agencies quote 50,000 FCFA?",
    answer:
      "That is the price of a ready-made theme, not of a site built for your business. An agency promising a site delivered in 48 hours for 60,000 FCFA is reusing a generic template with no real customisation. You get a page that looks like hundreds of others, with no local SEO, no mobile optimisation and none of your brand. A quote that mentions neither the number of pages, nor who supplies the content, nor whether hosting is included, is a quote for a template.",
    category: "Pricing",
    locale: "en",
    order: 2,
    featured: false,
  },
  {
    key: "european-agency-premium",
    question: "Is a European agency necessarily more expensive?",
    answer:
      "For a comparable result, a European agency generally charges between 400,000 and 1,500,000 FCFA for the same work. The difference is justified by proximity, knowledge of the local market, invoicing in FCFA and acceptance of mobile money. It is not well justified if the conversation happens only in English and nobody knows the market.",
    category: "Pricing",
    locale: "en",
    order: 3,
    featured: false,
  },
  {
    key: "facebook-versus-website",
    question: "I already have a Facebook page. What does a website add?",
    answer:
      "Facebook remains the country's largest social channel: about 5.45 million users in Cameroon in early 2025, or 18.5% of the population. But it is rented ground: the algorithm decides who sees you, and the reach of a post stays at the mercy of a rule change. Your website is your own land: an address you own, that Google indexes, that receives your campaigns and that converts without an intermediary. The two work together: Facebook captures attention, the website converts it.",
    category: "Cameroon market",
    locale: "en",
    order: 0,
    featured: true,
  },
  {
    key: "seo-effectiveness",
    question: "Does SEO actually work in Cameroon?",
    answer:
      "Yes, but it does not play the same role as in Europe. Internet penetration stood at 41.9% in early 2025, with 12.4 million users online. Your audience is smaller but better qualified: someone searching Google for your service has already decided to buy. That is why local SEO and voice search matter more here, since a large share of searches happens on a phone, in French, and often out loud.",
    category: "Cameroon market",
    locale: "en",
    order: 1,
    featured: false,
  },
  {
    key: "customers-really-online",
    question: "Are my future customers really online?",
    answer:
      "A large share are not: about 58.1% of the population, or 17.1 million people, were not using the internet in early 2025. A website alone therefore does not cover the whole market. What works is a website that explains and reassures, a WhatsApp number reachable in one tap, and campaigns that also reach people offline. We design the site as the conversion point towards WhatsApp, not as a replacement for the relationship.",
    category: "Cameroon market",
    locale: "en",
    order: 2,
    featured: false,
  },
  {
    key: "advertising-channel-choices",
    question: "Which channels should my advertising budget go to?",
    answer:
      "The early-2025 numbers are fairly clear. Facebook had about 5.45 million users in Cameroon, LinkedIn about 1.40 million, and Instagram's advertising reach was equivalent to 2.0% of the population. Facebook is therefore the mass channel. LinkedIn only makes sense for a B2B offer or an international clientele. Instagram does not justify a large budget on its own. The right measure is not total audience but cost per lead.",
    category: "Cameroon market",
    locale: "en",
    order: 3,
    featured: false,
  },
  {
    key: "slow-website",
    question: "Why is my website so slow?",
    answer:
      "The median fixed connection in Cameroon was 9.48 Mbps in early 2025, and 83.6% of mobile connections are broadband-capable. On a real network, a page of several megabytes takes several seconds to appear, and the delay gets worse on entry-level phones, which are the majority here. The usual causes are uncompressed images, unoptimised fonts, stacked tracking scripts and a site tested only from a fast connection. Aim for under 1 MB on the first page.",
    category: "Technical",
    locale: "en",
    order: 0,
    featured: false,
  },
  {
    key: "taking-payments",
    question: "How do I take payments on my website?",
    answer:
      "Two operators dominate mobile payments in Cameroon: Orange Money and MTN Mobile Money. Supporting both is the minimum, otherwise you give up a large part of the market. Rather than two separate integrations, a local aggregator simplifies the build: NotchPay brings Orange Money, MTN Money and card payments into a single integration, and Monetbil and PayDunya are established alternatives. Card payments alone are not enough, a large share of the population pays with their phone.",
    category: "Technical",
    locale: "en",
    order: 1,
    featured: false,
  },
  {
    key: "online-store-reality",
    question: "How does an online store actually sell?",
    answer:
      "A WhatsApp catalogue remains a sales channel in its own right, often before the website. On the market, a simple store of 20 to 50 products with MTN Mobile Money payment starts around 300,000 FCFA. A store with stock management and an admin dashboard easily passes 600,000 to 800,000 FCFA, and the most complete projects sit between 500,000 and 1,800,000 FCFA over 4 to 8 weeks. The order that works best: a WhatsApp catalogue to validate demand, then a website to convert and retain.",
    category: "Technical",
    locale: "en",
    order: 2,
    featured: false,
  },
  {
    key: "what-is-an-ai-agent",
    question: "What is an AI agent, concretely?",
    answer:
      "It is an assistant that answers your customers on WhatsApp around the clock, qualifies their requests, and hands over only the conversations that deserve a human. It connects to the tools you already use: a spreadsheet, your point-of-sale software, your website. And it is trained on your information rather than on generic answers. In a market where conversation happens mostly on WhatsApp, that is the channel where an immediate reply genuinely changes the outcome.",
    category: "Technical",
    locale: "en",
    order: 3,
    featured: false,
  },
  {
    key: "data-security",
    question: "Is my data safe?",
    answer:
      "Traffic is encrypted, access is per-person, and your data is never resold or used to train a third-party model. The agents we deploy run in a dedicated space with configurable retention: you decide what is kept and for how long.",
    category: "Technical",
    locale: "en",
    order: 4,
    featured: false,
  },
  {
    key: "timelines",
    question: "What are your timelines?",
    answer:
      "A brochure site: 2 to 4 weeks. A full identity: 3 weeks. The Signature Offer: 30 days. Software projects depend on scope, and we commit to dates rather than to promises. These benchmarks match the Cameroonian market, where a professional site takes 3 to 5 weeks and an online store 4 to 8 weeks. You get a schedule with an approval point between each stage.",
    category: "How we work",
    locale: "en",
    order: 0,
    featured: true,
  },
  {
    key: "payment-terms",
    question: "How does payment work?",
    answer:
      "MTN Mobile Money, Orange Money or bank transfer. Instalment plans are available on most projects. The amount and the schedule are confirmed before we start, so billing is never a surprise halfway through.",
    category: "How we work",
    locale: "en",
    order: 1,
    featured: true,
  },
  {
    key: "after-delivery",
    question: "What happens after delivery?",
    answer:
      "We do not disappear. Maintenance, content updates and campaigns: monthly support plans exist, with no forced commitment. On the market, maintenance sits between 10,000 and 25,000 FCFA per month. That is the budget that keeps the site online and your prices up to date.",
    category: "How we work",
    locale: "en",
    order: 2,
    featured: false,
  },
  {
    key: "working-outside-yaounde",
    question: "Do you work with clients outside Yaoundé?",
    answer:
      "Yes, and it is the normal way we work. Everything happens remotely, by video call and screen sharing, with online approval. Travel is not billed as an extra. For billing, MTN Mobile Money and Orange Money cover the whole country.",
    category: "How we work",
    locale: "en",
    order: 3,
    featured: false,
  },
  {
    key: "not-satisfied",
    question: "What if I am not happy with the result?",
    answer:
      "You approve before each delivery stage, not only at the end. If the final round of changes is not right, we redo it without charging you a second time. The goal is that you never see the finished result for the first time on launch day.",
    category: "How we work",
    locale: "en",
    order: 4,
    featured: false,
  },
];

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

/**
 * Intentionally empty.
 *
 * Testimonials are the one thing a seed script must never invent. A fabricated
 * quote attributed to a named person at a named company is a false claim about
 * a real business, and unlike marketing copy the visitor reads it as a factual
 * statement about someone else's experience.
 *
 * The collection is seeded empty so the page renders its empty state. Add
 * testimonials from `/admin/testimonials`, or let real clients submit them
 * through the public form: those arrive as `pending` and only an admin can
 * publish them.
 */
export const TESTIMONIAL_SEED: TestimonialSeed[] = [];

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------
//
// Three topics, each published in both languages. `translationOfSlug` links a
// post to its counterpart; `seed.ts` resolves it to the counterpart's `_id`.
//
// Bodies start at `##` on purpose: the article page renders the title as the
// only h1, and `outlineOf()` collects only `##` and `###` for the table of
// contents.

export const POST_SEED: PostSeed[] = [
  // ============================================ 1. FR — le prix d'un site ==
  {
    slug: "prix-site-web-cameroun",
    title: "Combien coûte un site web au Cameroun ?",
    excerpt:
      "Les prix réellement observés en 2025-2026, du mini-site à 70 000 FCFA au portail sur mesure à plus de 1,5 million, et les trois signaux qui doivent vous faire fuir un devis trop bas.",
    category: "Prix & budget",
    locale: "fr",
    status: "published",
    metaTitle: "Prix d'un site web au Cameroun en 2026 : fourchettes réelles",
    metaDescription:
      "Mini-site, site vitrine, boutique en ligne ou portail sur mesure : les fourchettes de prix réellement observées sur le marché camerounais en 2025-2026, le budget annuel, et comment lire un devis.",
    translationOfSlug: "cost-of-a-website-in-cameroon",
    content: [
      "Les prix des sites web au Cameroun varient d'un facteur dix. Cette variation n'a rien de",
      "mystérieux : elle suit le type de projet. Voici les fourchettes réellement observées sur le",
      "marché en 2025-2026, et la manière de lire un devis.",
      "",
      "## La fourchette en un coup d'œil",
      "",
      "- **Mini-site ou one-page** : 70 000 à 120 000 FCFA. C'est le niveau d'entrée.",
      "- **Site vitrine professionnel (4 à 7 pages)** : 150 000 à 400 000 FCFA. La solution la plus répandue pour une PME.",
      "- **Site professionnel avec blog et référencement** : 300 000 à 750 000 FCFA, sur 3 à 5 semaines.",
      "- **Boutique en ligne** : 300 000 à plus d'1 000 000 FCFA, selon le nombre de produits et les moyens de paiement.",
      "- **Portail ou application sur mesure** : à partir de 800 000 FCFA, souvent au-delà de 1 500 000 FCFA.",
      "",
      "## Ce qui fait grimper le prix d'une boutique",
      "",
      "Une boutique simple de 20 à 50 produits avec paiement MTN Mobile Money démarre autour de",
      "300 000 FCFA. Dès qu'il faut gérer les stocks, un tableau de bord et plusieurs moyens de",
      "paiement, on dépasse facilement 600 000 à 800 000 FCFA. Les projets les plus complets, avec",
      "formation et intégration d'Orange Money, se situent entre 500 000 et 1 800 000 FCFA sur 4 à",
      "8 semaines de développement.",
      "",
      "## Le budget annuel qu'on oublie toujours",
      "",
      "Un site n'est pas un achat ponctuel. Chaque année, il faut prévoir le nom de domaine (8 000",
      "à 20 000 FCFA selon l'extension), l'hébergement (30 000 à 80 000 FCFA par an pour un service",
      "sérieux) et la maintenance (10 000 à 25 000 FCFA par mois). Un hébergement à 5 000 FCFA par an",
      "paraît économique, mais il signifie le plus souvent un serveur lent, des pannes fréquentes et",
      "aucun support technique.",
      "",
      "## Une agence européenne coûte-t-elle plus cher ?",
      "",
      "Pour un résultat comparable, une agence européenne facture généralement le même travail",
      "entre 400 000 et 1 500 000 FCFA. L'écart se justifie par la proximité, la maîtrise du",
      "contexte local, la facturation en FCFA et l'acceptation de Mobile Money. Il ne se justifie pas",
      "si la communication se limite à l'anglais et que personne ne connaît votre marché.",
      "",
      "## Une agence locale peut-elle être moins chère sans être moins bonne ?",
      "",
      "Oui. Un freelance local peut proposer un site vitrine autour de 80 000 FCFA. La question",
      "n'est donc pas « local ou européen », mais ce qui est inclus. Un prestataire qui annonce",
      "50 000 FCFA à 200 000 FCFA de plus que son concurrent fournit très probablement moins de",
      "pages, moins de contenus et aucun suivi. Comparez des périmètres, pas des montants.",
      "",
      "## Trois signaux d'alerte dans un devis",
      "",
      "1. **Un prix sans détail.** Si le devis ne mentionne ni le nombre de pages, ni les contenus à fournir, ni l'hébergement inclus, vous n'achetez pas un site : vous achetez un thème.",
      "2. **Un délai déraisonnablement court.** Un site livré en 48 heures pour 60 000 FCFA est un modèle générique non personnalisé.",
      "3. **Une garantie de positionnement.** Personne ne peut garantir une place sur Google. Une promesse de ce type doit vous alerter sur la compétence de celui qui la formule.",
      "",
      "## Comment comparer deux devis",
      "",
      "Posez les mêmes six questions à chaque prestataire :",
      "",
      "- combien de pages sont incluses ;",
      "- qui fournit les textes et les photos ;",
      "- ce que couvre la première année d'hébergement ;",
      "- le coût mensuel de la maintenance ;",
      "- qui possède le code source et le nom de domaine ;",
      "- ce qui se passe si le projet est abandonné en cours de route.",
      "",
      "Un prestataire sérieux répond sans hésiter. Le prix le plus bas n'est pas le moins cher.",
      "",
      "## Ce que le prix ne dit pas",
      "",
      "Le coût réel d'un site se mesure à son poids. Sur un marché où la vitesse fixe médiane est",
      "de 9,48 Mb/s, une page lourde est une page que vos visiteurs ne voient pas. Un site rapide,",
      "léger et correctement référencé vaut souvent plus, à prix égal, qu'un site riche en effets et",
      "incapable de se charger.",
    ].join("\n"),
  },
  {
    slug: "cost-of-a-website-in-cameroon",
    title: "How much does a website cost in Cameroon?",
    excerpt:
      "The prices actually observed in 2025-2026, from a 70,000 FCFA mini-site to a custom portal above 1.5 million, and the three signals that should make you walk away from a quote that is too cheap.",
    category: "Pricing",
    locale: "en",
    status: "published",
    metaTitle: "Website prices in Cameroon 2026: real price ranges",
    metaDescription:
      "Mini-site, brochure site, online store or custom portal: the price ranges actually observed on the Cameroonian market in 2025-2026, the annual running cost, and how to read a quote.",
    translationOfSlug: "prix-site-web-cameroun",
    content: [
      "Website prices in Cameroon vary by a factor of ten. That variation is not mysterious: it",
      "follows the type of project. Here are the ranges actually observed on the market in",
      "2025-2026, and how to read a quote.",
      "",
      "## The range at a glance",
      "",
      "- **Mini-site or one-pager**: 70,000 to 120,000 FCFA. The entry level.",
      "- **Professional brochure site (4 to 7 pages)**: 150,000 to 400,000 FCFA. The most common choice for an SME.",
      "- **Professional site with blog and SEO**: 300,000 to 750,000 FCFA, over 3 to 5 weeks.",
      "- **Online store**: 300,000 to over 1,000,000 FCFA, depending on product count and payment methods.",
      "- **Custom portal or application**: from 800,000 FCFA, often beyond 1,500,000 FCFA.",
      "",
      "## What pushes a store's price up",
      "",
      "A simple store of 20 to 50 products with MTN Mobile Money payment starts around 300,000",
      "FCFA. As soon as you need stock management, an admin dashboard and several payment methods,",
      "you easily pass 600,000 to 800,000 FCFA. The most complete projects, with training and",
      "Orange Money integration, sit between 500,000 and 1,800,000 FCFA over 4 to 8 weeks of",
      "development.",
      "",
      "## The annual budget nobody remembers",
      "",
      "A website is not a one-off purchase. Every year you need to allow for the domain name (8,000",
      "to 20,000 FCFA depending on the extension), hosting (30,000 to 80,000 FCFA per year for a",
      "serious service) and maintenance (10,000 to 25,000 FCFA per month). A 5,000 FCFA per year",
      "hosting deal looks economical, but it usually means a slow server, frequent outages and no",
      "technical support.",
      "",
      "## Does a European agency cost more?",
      "",
      "For a comparable result, a European agency generally charges between 400,000 and 1,500,000",
      "FCFA for the same work. The difference is justified by proximity, knowledge of the local",
      "context, invoicing in FCFA and acceptance of mobile money. It is not justified when the",
      "conversation happens only in English and nobody knows your market.",
      "",
      "## Can a local agency be cheaper without being worse?",
      "",
      "Yes. A local freelancer can put together a brochure site for around 80,000 FCFA. So the",
      "question is not \"local or European\" but what is included. A provider quoting 50,000 to",
      "200,000 FCFA more than a competitor is very probably delivering fewer pages, less content and",
      "no follow-up. Compare scopes, not amounts.",
      "",
      "## Three warning signs in a quote",
      "",
      "1. **A price with no detail.** If the quote mentions neither the number of pages, nor who supplies the content, nor whether hosting is included, you are not buying a site: you are buying a theme.",
      "2. **An impossibly short deadline.** A site delivered in 48 hours for 60,000 FCFA is an unpersonalised generic template.",
      "3. **A ranking guarantee.** Nobody can guarantee a position on Google. A promise of that kind should tell you something about whoever is making it.",
      "",
      "## How to compare two quotes",
      "",
      "Ask every provider the same six questions:",
      "",
      "- how many pages are included;",
      "- who supplies the copy and the photos;",
      "- what the first year of hosting covers;",
      "- the monthly cost of maintenance;",
      "- who owns the source code and the domain name;",
      "- what happens if the project is abandoned halfway.",
      "",
      "A serious provider answers without hesitating. The lowest price is not the cheapest option.",
      "",
      "## What the price does not tell you",
      "",
      "The real cost of a website shows up in its weight. On a market where the median fixed speed",
      "is 9.48 Mbps, a heavy page is a page your visitors never see. A fast, light, properly",
      "optimised site is often worth more at the same price than a site full of effects that cannot",
      "load.",
    ].join("\n"),
  },

  // ==================================== 2. FR — pourquoi le mobile d'abord ==
  {
    slug: "web-mobile-first-cameroun",
    title: "41,9 % : pourquoi votre site doit être conçu pour le mobile",
    excerpt:
      "Les chiffres d'accès à internet au Cameroun début 2025 expliquent pourquoi un site se conçoit d'abord pour un téléphone, sur un réseau contraint.",
    category: "Stratégie",
    locale: "fr",
    status: "published",
    metaTitle: "Mobile-first au Cameroun : ce que disent les chiffres 2025",
    metaDescription:
      "86,3 % de connexions cellulaires, 41,9 % de pénétration internet, 9,48 Mb/s en fixe : pourquoi votre site camerounais doit être pensé pour un téléphone, sur un réseau contraint.",
    translationOfSlug: "mobile-first-website-cameroon",
    content: [
      "L'habitude est de concevoir pour le poste de bureau et d'adapter ensuite au mobile. Au",
      "Cameroun, l'ordre inverse n'est pas une préférence esthétique : il découle des chiffres.",
      "",
      "## Les chiffres de début 2025",
      "",
      "La population du Cameroun s'élevait à 29,5 millions d'habitants début 2025. Sur cette période :",
      "",
      "- **25,5 millions de connexions cellulaires actives**, soit 86,3 % de la population ;",
      "- **12,4 millions d'internautes**, soit un taux de pénétration de 41,9 % ;",
      "- **5,45 millions d'identités sur les réseaux sociaux**, soit 18,5 % de la population et 35,4 % des adultes ;",
      "- **17,1 millions de personnes hors ligne**, soit 58,1 % de la population ;",
      "- une **vitesse de téléchargement fixe médiane de 9,48 Mb/s**.",
      "",
      "L'âge médian de la population est de 18 ans : la majorité de vos clients a grandi avec le",
      "téléphone.",
      "",
      "## 86,3 % : le téléphone est le premier point de contact",
      "",
      "Avec 25,5 millions de connexions cellulaires pour 29,5 millions d'habitants, le téléphone",
      "est le premier point de contact de votre audience. Un site conçu pour le bureau oblige vos",
      "visiteurs à zoomer, à faire défiler latéralement, et les fait souvent quitter la page avant",
      "votre première phrase. Ce geste a un prix : un client perdu.",
      "",
      "## 9,48 Mb/s : la page doit tenir sur un réseau contraint",
      "",
      "La vitesse fixe médiane est de 9,48 Mb/s, et 83,6 % des connexions mobiles sont compatibles",
      "haut débit. Ce sont des médianes : la moitié de vos visiteurs se situe en dessous. Une page",
      "de plusieurs mégaoctets met alors plusieurs secondes à s'afficher, et le délai s'aggrave sur",
      "les terminaux d'entrée de gamme.",
      "",
      "Concrètement, cela impose de :",
      "",
      "- **compresser les images** et les servir dans des formats modernes ;",
      "- **ramener la première page sous 1 Mo** ;",
      "- **limiter les polices** et les scripts de suivi, qui s'empilent vite ;",
      "- **différer** ce qui n'est pas visible immédiatement.",
      "",
      "## 58,1 % hors ligne : le site ne suffit pas seul",
      "",
      "Plus de la moitié de la population n'utilise pas internet. Concevoir comme si tout le monde",
      "était connecté conduit à laisser une partie du marché de côté. La combinaison efficace",
      "associe un site qui explique et rassure, un numéro WhatsApp joignable en un clic, et des",
      "campagnes qui touchent aussi hors ligne.",
      "",
      "## Ce que cela change dans votre projet",
      "",
      "Une page qui s'affiche en moins de trois secondes sur une connexion 3G. Un numéro de",
      "téléphone lisible sans zoomer. Des formulaires utilisables au pouce. Un chemin vers WhatsApp",
      "en un clic. Ce ne sont pas des détails : c'est le seuil en dessous duquel vous perdez la",
      "majorité de votre audience.",
      "",
      "## Ce que cela ne change pas",
      "",
      "Le mobile-first n'est pas une excuse pour un site bâclé. Une page trop allégée au point de",
      "manquer d'informations convertit moins bien qu'une page complète. L'objectif est la vitesse",
      "et la lisibilité, pas le nombre de kilo-octets.",
    ].join("\n"),
  },
  {
    slug: "mobile-first-website-cameroon",
    title: "41.9%: why your website has to be built mobile-first",
    excerpt:
      "Cameroon's internet access figures in early 2025 explain why a website should be designed for a phone first, on a constrained network.",
    category: "Strategy",
    locale: "en",
    status: "published",
    metaTitle: "Mobile-first in Cameroon: what the 2025 numbers say",
    metaDescription:
      "86.3% cellular connections, 41.9% internet penetration, 9.48 Mbps fixed: why your Cameroonian website must be designed for a phone on a constrained network.",
    translationOfSlug: "web-mobile-first-cameroun",
    content: [
      "The habit is to design for the desktop and adapt to mobile afterwards. In Cameroon the",
      "reverse order is not an aesthetic preference: it follows from the numbers.",
      "",
      "## The early-2025 numbers",
      "",
      "Cameroon's population stood at 29.5 million in early 2025. Over that period:",
      "",
      "- **25.5 million active cellular connections**, or 86.3% of the population;",
      "- **12.4 million internet users**, or 41.9% penetration;",
      "- **5.45 million social media identities**, or 18.5% of the population and 35.4% of adults;",
      "- **17.1 million people offline**, or 58.1% of the population;",
      "- a **median fixed download speed of 9.48 Mbps**.",
      "",
      "The median age is 18: most of your customers grew up with a phone.",
      "",
      "## 86.3%: the phone is the first point of contact",
      "",
      "With 25.5 million cellular connections for 29.5 million inhabitants, the phone is the first",
      "point of contact with your audience. A site designed for the desktop forces visitors to zoom",
      "and scroll sideways, and regularly makes them leave before your first sentence. That gesture",
      "has a price: a lost customer.",
      "",
      "## 9.48 Mbps: the page has to hold up on a constrained network",
      "",
      "Median fixed speed is 9.48 Mbps, and 83.6% of mobile connections are broadband-capable.",
      "These are medians: half of your visitors are below them. A page of several megabytes then",
      "takes several seconds to appear, and the delay gets worse on entry-level devices.",
      "",
      "In practice that means:",
      "",
      "- **compressing images** and serving them in modern formats;",
      "- **keeping the first page under 1 MB**;",
      "- **limiting fonts and tracking scripts**, which pile up quickly;",
      "- **deferring** anything not immediately visible.",
      "",
      "## 58.1% offline: a website is not enough on its own",
      "",
      "More than half the population does not use the internet. Designing as if everyone were",
      "connected leaves part of the market unserved. What works is a website that explains and",
      "reassures, a WhatsApp number reachable in one tap, and campaigns that also reach people",
      "offline.",
      "",
      "## What this changes in your project",
      "",
      "A page that displays in under three seconds on a 3G connection. A phone number readable",
      "without zooming. Forms that work with a thumb. A path to WhatsApp in one tap. These are not",
      "details: they are the threshold below which you lose the majority of your audience.",
      "",
      "## What this does not change",
      "",
      "Mobile-first is not an excuse for a careless site. A page stripped so thin that it omits the",
      "information that converts will convert less well than a complete page. The goal is speed and",
      "legibility, not a low byte count.",
    ].join("\n"),
  },

  // ================================ 3. FR — le paiement Mobile Money =======
  {
    slug: "paiement-mobile-money-en-ligne",
    title: "Orange Money, MTN Money, NotchPay : quel paiement en ligne ?",
    excerpt:
      "Deux opérateurs couvrent l'essentiel du marché camerounais. La vraie question n'est pas lesquels intégrer, mais comment éviter d'en maintenir deux.",
    category: "Technique",
    locale: "fr",
    status: "published",
    metaTitle: "Paiement en ligne au Cameroun : MoMo, OM et agrégateurs",
    metaDescription:
      "Orange Money et MTN Mobile Money couvrent l'essentiel du marché camerounais. Comment choisir entre intégrations directes et agrégateur comme NotchPay, Monetbil ou PayDunya.",
    translationOfSlug: "mobile-money-payments-cameroon",
    content: [
      "Le paiement en ligne au Cameroun ne se décide pas comme en Europe. Deux opérateurs",
      "concentrent l'essentiel du marché, et la carte bancaire ne couvre qu'une partie de la",
      "population.",
      "",
      "## Les deux opérateurs à couvrir en priorité",
      "",
      "Le Cameroun compte deux opérateurs dominants : **Orange Money** et **MTN Mobile Money**. C'est",
      "la particularité du marché. Une boutique qui n'accepte que la carte bancaire exclut une large",
      "part de la population ; une boutique qui n'accepte qu'un seul opérateur mobile exclut l'autre",
      "moitié du pays. Aucune des deux intégrations n'est optionnelle.",
      "",
      "## Un agrégateur plutôt que deux intégrations",
      "",
      "Chaque intégration directe a son propre SDK, son propre cycle de vie et ses propres cas",
      "d'erreur. Un **agrégateur** les regroupe derrière une seule interface. Le plus répandu au",
      "Cameroun est **NotchPay**, qui rassemble Orange Money, MTN Money et la carte bancaire dans",
      "une intégration unique. **Monetbil** et **PayDunya** sont des alternatives établies, la",
      "seconde étant panafricaine.",
      "",
      "Le choix se joue sur trois points :",
      "",
      "- la **couverture** : les deux opérateurs et la carte doivent être inclus ;",
      "- le **délai de règlement** et les frais par transaction ;",
      "- la **stabilité** du service et l'existence d'un support joignable.",
      "",
      "## Ce que le Mobile Money change dans votre tunnel",
      "",
      "Le paiement mobile n'est pas la carte bancaire sur un téléphone : le client valide sur son",
      "téléphone, puis quitte souvent l'onglet. Conséquence directe, votre page de confirmation doit",
      "être explicite sur ce qui se passe ensuite, et le client doit pouvoir reprendre son panier.",
      "Une boutique qui perd la commande entre le clic et la validation perd de l'argent réel.",
      "",
      "## Le coût et les délais",
      "",
      "Une boutique simple de 20 à 50 produits avec paiement MTN Mobile Money démarre autour de",
      "300 000 FCFA. Dès qu'il faut gérer les stocks, un tableau de bord et plusieurs moyens de",
      "paiement, on dépasse facilement 600 000 à 800 000 FCFA. Les projets les plus complets se",
      "situent entre 500 000 et 1 800 000 FCFA, sur 4 à 8 semaines de développement.",
      "",
      "## Trois pièges à éviter",
      "",
      "1. **Tester en production.** Un paiement Mobile Money réel engage des frais. Prévoyez un environnement de test et une procédure de remboursement avant la mise en ligne.",
      "2. **Confondre catalogue et boutique.** Un catalogue WhatsApp ne traite aucun paiement : il génère des demandes à traiter manuellement. C'est utile pour valider la demande, mais cela ne remplace pas une boutique.",
      "3. **Ignorer le rapprochement.** Chaque paiement doit être rapproché de la commande. Sans cela, vous ignorez ce qui a réellement été encaissé.",
      "",
      "## L'ordre qui fonctionne",
      "",
      "Un catalogue WhatsApp pour valider la demande, puis une boutique avec paiement Mobile Money",
      "pour convertir et fidéliser. Dans un marché où l'on paie avec son téléphone, le site doit",
      "conclure la vente là où elle se décide, pas renvoyer vers un appel.",
    ].join("\n"),
  },
  {
    slug: "mobile-money-payments-cameroon",
    title: "Orange Money, MTN Money, NotchPay: which online payments?",
    excerpt:
      "Two operators cover most of the Cameroonian market. The real question is not which ones to integrate, but how to avoid maintaining two.",
    category: "Technical",
    locale: "en",
    status: "published",
    metaTitle: "Online payments in Cameroon: MoMo, OM and aggregators",
    metaDescription:
      "Orange Money and MTN Mobile Money cover most of the Cameroonian market. How to choose between direct integrations and an aggregator such as NotchPay, Monetbil or PayDunya.",
    translationOfSlug: "paiement-mobile-money-en-ligne",
    content: [
      "Online payments in Cameroon are not decided the way they are in Europe. Two operators",
      "concentrate most of the market, and card payments cover only part of the population.",
      "",
      "## The two operators to support first",
      "",
      "Cameroon has two dominant operators: **Orange Money** and **MTN Mobile Money**. That is the",
      "particularity of this market. A store that accepts only cards excludes a large share of the",
      "population; a store that accepts only one mobile operator excludes the other half of the",
      "country. Neither integration is optional.",
      "",
      "## An aggregator beats two integrations",
      "",
      "Each direct integration has its own SDK, its own lifecycle and its own failure modes. An",
      "**aggregator** puts them behind a single interface. The most widespread in Cameroon is",
      "**NotchPay**, which brings Orange Money, MTN Money and card payments together in one",
      "integration. **Monetbil** and **PayDunya** are established alternatives, the latter being",
      "pan-African.",
      "",
      "The decision comes down to three things:",
      "",
      "- **coverage**: both operators and cards should be included;",
      "- **settlement delay** and per-transaction fees;",
      "- **stability** of the service and whether support is reachable.",
      "",
      "## What mobile money changes in your funnel",
      "",
      "Mobile payment is not card payment on a phone: the customer approves on their device and then",
      "often closes the tab. The direct consequence is that your confirmation page has to be",
      "explicit about what happens next, and the customer must be able to resume their basket. A",
      "store that loses the order between the click and the approval loses real money.",
      "",
      "## Cost and timelines",
      "",
      "A simple store of 20 to 50 products with MTN Mobile Money payment starts around 300,000",
      "FCFA. As soon as you need stock management, an admin dashboard and several payment methods,",
      "you easily pass 600,000 to 800,000 FCFA. The most complete projects sit between 500,000 and",
      "1,800,000 FCFA, over 4 to 8 weeks of development.",
      "",
      "## Three traps to avoid",
      "",
      "1. **Testing in production.** A real mobile-money transaction costs money. Set up a test environment and a refund procedure before launch.",
      "2. **Confusing a catalogue with a store.** A WhatsApp catalogue processes no payment: it generates requests to handle by hand. Useful for validating demand, but not a substitute for a store.",
      "3. **Ignoring reconciliation.** Every payment must be matched to an order. Without that, you do not know what was actually collected.",
      "",
      "## The order that works",
      "",
      "A WhatsApp catalogue to validate demand, then a store with mobile-money payment to convert",
      "and retain. In a market where people pay with their phone, the website has to close the sale",
      "where it is decided, not send the customer off to make a phone call.",
    ].join("\n"),
  },
];