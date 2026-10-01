/**
 * One-time setup: create the first admin account, then seed starter content.
 *
 * Run it once against the production database:
 *
 *     ADMIN_EMAIL=you@cda.cm ADMIN_PASSWORD='…' npm run seed
 *
 * Design notes:
 *
 *  - It talks to Mongo through the driver directly rather than through
 *    `src/lib/content.ts` or `src/lib/content-schema.ts`. Both import
 *    `server-only`, whose `index.js` throws outside a React Server Component
 *    environment — importing either here would crash the script on line one. The
 *    document shapes are therefore declared locally below; they are kept in step
 *    with `content-schema.ts` by hand.
 *  - Every step is idempotent and additive: an admin that already exists is left
 *    alone, and content is only inserted when the collection is empty. Running it
 *    twice will not duplicate anything or overwrite work done in the admin panel.
 *  - The admin password is never logged, and it is read from the environment
 *    rather than argv so it never lands in shell history or a process listing.
 */

import { MongoClient, ObjectId, type Db } from "mongodb";
import bcrypt from "bcryptjs";

const DB = process.env.MONGODB_DB ?? "cda";

/** Mirrors `Locale2` / `Faq` / `Post` / `Testimonial` from `content-schema.ts`. */
type Locale = "fr" | "en";

type Faq = {
  question: string;
  answer: string;
  category: string;
  locale: Locale;
  order: number;
  featured: boolean;
};

type Testimonial = {
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

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover: null;
  locale: Locale;
  status: "draft" | "published";
  readingTime: number;
  metaTitle?: string;
  metaDescription?: string;
  translationOf: string | null;
};

/** Same formula as `readingTimeFor` in `content-schema.ts`: ~200 words/minute. */
function readingTimeFor(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    console.error(`\n  Missing required environment variable: ${name}\n`);
    process.exit(1);
  }
  return value.trim();
}

// ---------------------------------------------------------------------------
// Starter content
// ---------------------------------------------------------------------------

/**
 * FAQs shipped in both languages.
 *
 * These are the questions that actually block a purchase — price, timelines,
 * payment, what happens after launch. They are a starting point; edit them in
 * `/admin/faqs` once real conversations start coming in.
 */
const FAQ_SEED: Faq[] = [
  {
    question: "Combien coûte un projet avec CDA ?",
    answer:
      "Un site vitrine démarre autour de 350 000 FCFA, une refonte de marque autour de 250 000 FCFA, et une automatisation IA est chiffrée après un appel de 30 minutes. Nous annonçons toujours un prix ferme avant de commencer — pas de « à partir de » qui grossit en cours de route.",
    category: "Tarifs",
    locale: "fr",
    order: 0,
    featured: true,
  },
  {
    question: "Quels sont vos délais ?",
    answer:
      "Un site vitrine : 2 à 3 semaines. Une refonte de marque : 3 semaines. Un agent IA : 4 à 6 semaines selon les intégrations. Vous recevez un calendrier avec les validations entre chaque étape, donc jamais de silence de trois semaines.",
    category: "Tarifs",
    locale: "fr",
    order: 1,
    featured: true,
  },
  {
    question: "Comment se passe le paiement ?",
    answer:
      "50 % à la signature, 50 % à la livraison. Pour les projets au-delà de 1 500 000 FCFA, nous acceptons un paiement en trois fois (50/25/25). Facture Proforma disponible pour les entreprises needing a comptable.",
    category: "Tarifs",
    locale: "fr",
    order: 2,
    featured: false,
  },
  {
    question: "Travaillez-vous avec des entreprises en dehors de Yaoundé ?",
    answer:
      "Oui. Plus de la moitié de nos clients sont à Douala, Bertoua, Bamenda ou en diaspora (France, Canada, Belgique). Tout se fait à distance : appels vidéo, partage d'écran, validation en ligne. Un déplacement n'est jamais facturé en supplément.",
    category: "Logistique",
    locale: "fr",
    order: 0,
    featured: false,
  },
  {
    question: "Et si je ne suis pas satisfait du résultat ?",
    answer:
      "Vous validez avant chaque étape de livraison. Si la dernière retouche ne vous convient pas, nous la refaisons — sans facturer une deuxième fois. La garantie de satisfaction couvre 30 jours après la mise en ligne.",
    category: "Logistique",
    locale: "fr",
    order: 1,
    featured: false,
  },
  {
    question: "Qu'est-ce que c'est qu'un agent IA, concrètement ?",
    answer:
      "C'est un assistant qui répond à vos clients sur WhatsApp 24h/24, qualifie les demandes, et vous transmet uniquement les conversations qui méritent un humain. Il se branche à vos outils actuels (Google Sheets, un logiciel de caisse, votre site) et il est entraîné sur *vos* informations, pas sur des réponses génériques.",
    category: "Technique",
    locale: "fr",
    order: 0,
    featured: false,
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer:
      "Les échanges sont chiffrés, les accès sont nominatifs, et vos données ne sont jamais revendues ni utilisées pour entraîner un modèle tiers. Les Agents IA que nous déployons tournent dans un espace dédié, avec rétention configurable — vous décidez de ce qui est conservé et de la durée.",
    category: "Technique",
    locale: "fr",
    order: 1,
    featured: false,
  },

  // English translations. Bilingual by document: a French FAQ and its English
  // version are two rows, not two fields on one row.
  {
    question: "How much does a project cost?",
    answer:
      "A brochure site starts around €600, a brand refresh around €430, and AI automation is quoted after a 30-minute call. We always give a fixed price before starting — no 'starting from' that quietly grows along the way.",
    category: "Pricing",
    locale: "en",
    order: 0,
    featured: true,
  },
  {
    question: "How long will it take?",
    answer:
      "A brochure site: 2 to 3 weeks. A brand refresh: 3 weeks. An AI agent: 4 to 6 weeks depending on integrations. You get a schedule with approval points between each stage, so nobody goes three weeks without hearing from us.",
    category: "Pricing",
    locale: "en",
    order: 1,
    featured: true,
  },
  {
    question: "How does payment work?",
    answer:
      "50% to start, 50% on delivery. Above €2,500 we accept three instalments (50/25/25). A proforma invoice is available for any accountant.",
    category: "Pricing",
    locale: "en",
    order: 2,
    featured: false,
  },
  {
    question: "Do you work with businesses outside Yaoundé?",
    answer:
      "Yes. More than half our clients are in Douala, Bertoua, Bamenda, or abroad (France, Canada, Belgium). Everything is remote — video calls, screen sharing, online approval. Travel is never billed as an extra.",
    category: "Working together",
    locale: "en",
    order: 0,
    featured: false,
  },
  {
    question: "What if I'm not happy with the result?",
    answer:
      "You approve every stage before delivery. If the final round of changes isn't right, we redo it — at no extra charge. The satisfaction guarantee runs for 30 days after launch.",
    category: "Working together",
    locale: "en",
    order: 1,
    featured: false,
  },
  {
    question: "What actually is an AI agent?",
    answer:
      "An assistant that answers your customers on WhatsApp around the clock, qualifies their requests, and hands over only the conversations that deserve a human. It plugs into the tools you already use (Google Sheets, your POS, your website) and is trained on *your* information rather than generic answers.",
    category: "Technical",
    locale: "en",
    order: 0,
    featured: false,
  },
  {
    question: "Is my data safe?",
    answer:
      "Traffic is encrypted, access is per-person, and your data is never resold or used to train a third-party model. The AI agents we deploy run in a dedicated space with configurable retention — you decide what is kept and for how long.",
    category: "Technical",
    locale: "en",
    order: 1,
    featured: false,
  },
];

/**
 * Approved testimonials.
 *
 * `source: "manual"` marks these as entered by CDA rather than submitted through
 * the public form, which keeps the provenance of every quote on the page
 * distinguishable. Replace them with real ones — invented praise is not worth
 * the credibility it costs.
 */
const TESTIMONIAL_SEED: Testimonial[] = [
  {
    name: "PLACEHOLDER — Camille Njoya",
    role: "Gérante",
    company: "Boutique Adjovi (Douala)",
    quote:
      "PLACEHOLDER — remplacez ce témoignage par un vrai, avec l'accord de la personne. Notez ce qui a changé concrètement : le nombre de clients venus sur WhatsApp après la refonte, le temps gagné sur les devis, la première commande en ligne.",
    rating: 5,
    locale: "fr",
    status: "approved",
    source: "manual",
  },
  {
    name: "PLACEHOLDER — Junior Mbarga",
    role: "Directeur",
    company: "TransLog Cameroun (Yaoundé)",
    quote:
      "PLACEHOLDER — un second témoignage, côté B2B cette fois. L'agent WhatsApp répond la nuit et nous ne perdons plus aucune demande le week-end.",
    rating: 5,
    locale: "fr",
    status: "approved",
    source: "manual",
  },
  {
    name: "PLACEHOLDER — Awa Fotso",
    role: "Fondatrice",
    company: "Fotso Digital (Canada)",
    quote:
      "PLACEHOLDER — an English testimonial, for the diaspora market. Remote, clear, and the site went live on schedule.",
    rating: 5,
    locale: "en",
    status: "approved",
    source: "manual",
  },
];

/**
 * One example post per language, published, so a fresh install has a working
 * article to exercise the blog routes. Delete it from the admin panel once real
 * content exists.
 */
const POST_SEED: Post[] = [
  {
    slug: "exemple-d-article",
    title: "Exemple d'article — remplacez-moi",
    excerpt:
      "Un article de démonstration, publié pour que le blog fonctionne dès l'installation. Supprimez-le depuis le panneau d'administration.",
    category: "CDA",
    content: [
      "# Exemple d'article",
      "",
      "Ceci est un article de démonstration créé par le script de seed. Il sert à",
      "vérifier que le blog, la table des matières et les données structurées",
      "fonctionnent — supprimez-le quand vous aurez vos vrais articles.",
      "",
      "## Comment fonctionne la table des matières",
      "",
      "Les titres de niveau 2 et 3 sont automatiquement ajoutés dans la colonne de",
      "gauche. Cliquez sur un titre pour sauter directement à la section.",
      "",
      "### Un sous-titre de niveau 3",
      "",
      "Les sous-titres sont indentés d'un cran. Les liens du sommaire pointent vers",
      "des ancres générées automatiquement.",
      "",
      "## Ce qui se passe ensuite",
      "",
      "Rédigez votre article en Markdown dans le panneau d'administration, et il",
      "sera publié sur `/blog` sans redéploiement.",
      "",
      "- Le temps de lecture est calculé automatiquement",
      "- L'image de couverture est téléversée sur Cloudinary",
      "- Les données structurées `BlogPosting` sont générées automatiquement",
    ].join("\n"),
    cover: null,
    locale: "fr",
    status: "published",
    readingTime: 1,
    metaTitle: undefined,
    metaDescription: undefined,
    translationOf: null,
  },
  {
    slug: "sample-article-replace-me",
    title: "Sample article — replace me",
    excerpt:
      "A demo post, published so the blog works the moment the site is installed. Delete it from the admin panel.",
    category: "CDA",
    content: [
      "# Sample article",
      "",
      "This is a demo post created by the seed script. It exists to verify the blog,",
      "the table of contents and the structured data — delete it when you have real",
      "content.",
      "",
      "## How the table of contents works",
      "",
      "Level 2 and 3 headings are collected into the sidebar automatically. Click a",
      "heading to jump straight to that section.",
      "",
      "### A level 3 subheading",
      "",
      "Subheadings are indented one step. Every table-of-contents link points at an",
      "anchor generated from the heading text.",
      "",
      "## What happens next",
      "",
      "Write your posts in Markdown in the admin panel and they appear on `/blog`",
      "with no redeploy.",
      "",
      "- Reading time is computed automatically",
      "- Cover images are uploaded to Cloudinary",
      "- `BlogPosting` structured data is generated for you",
    ].join("\n"),
    cover: null,
    locale: "en",
    status: "published",
    readingTime: 1,
    metaTitle: undefined,
    metaDescription: undefined,
    translationOf: null,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const uri = requireEnv("MONGODB_URI");

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  await client.connect();
  const db = client.db(DB);

  console.log(`\n  Seeding database "${DB}"\n`);

  await ensureIndexes(db);

  // --- Admin ---------------------------------------------------------------
  // Password comes from the environment rather than argv so it never lands in
  // the shell history or in a process listing.
  const adminEmail = (process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? "").trim();
  if (!adminEmail) {
    console.log("  ! ADMIN_EMAIL not set — skipping admin creation.");
    console.log("    Set ADMIN_EMAIL (and ADMIN_PASSWORD) to create the first admin.\n");
  } else {
    const existing = await db.collection("admins").findOne({ email: adminEmail.toLowerCase() });
    if (existing) {
      console.log(`  = admin ${adminEmail} already exists — left untouched.`);
    } else {
      const password = requireEnv("ADMIN_PASSWORD");
      if (password.length < 12) {
        console.error("\n  ADMIN_PASSWORD must be at least 12 characters.\n");
        await client.close();
        process.exit(1);
      }

      await db.collection("admins").insertOne({
        email: adminEmail.toLowerCase(),
        name: process.env.ADMIN_NAME?.trim() || "CDA Admin",
        passwordHash: await bcrypt.hash(password, 12),
        createdAt: new Date(),
        lastLoginAt: null,
      });
      console.log(`  + admin created: ${adminEmail}`);
    }
  }

  // --- FAQs ----------------------------------------------------------------
  const faqs = db.collection<Omit<Faq, "_id">>("faqs");
  if ((await faqs.estimatedDocumentCount()) === 0) {
    const now = new Date();
    await faqs.insertMany(
      FAQ_SEED.map((faq) => ({ ...faq, _id: new ObjectId(), createdAt: now, updatedAt: now })),
    );
    console.log(`  + ${FAQ_SEED.length} FAQs seeded (${countByLocale(FAQ_SEED)}).`);
  } else {
    console.log("  = FAQs already present — left untouched.");
  }

  // --- Testimonials --------------------------------------------------------
  const testimonials = db.collection("testimonials");
  if ((await testimonials.estimatedDocumentCount()) === 0) {
    const now = new Date();
    await testimonials.insertMany(
      TESTIMONIAL_SEED.map((item) => ({ ...item, _id: new ObjectId(), createdAt: now, reviewedAt: now })),
    );
    console.log(
      `  + ${TESTIMONIAL_SEED.length} testimonials seeded — REPLACE THE PLACEHOLDERS.`,
    );
  } else {
    console.log("  = testimonials already present — left untouched.");
  }

  // --- Posts ---------------------------------------------------------------
  const posts = db.collection("posts");
  if ((await posts.estimatedDocumentCount()) === 0) {
    const now = new Date();
    await posts.insertMany(
      POST_SEED.map((post) => ({
        ...post,
        _id: new ObjectId(),
        readingTime: readingTimeFor(post.content),
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      })),
    );
    console.log(`  + ${POST_SEED.length} demo posts seeded.`);
  } else {
    console.log("  = posts already present — left untouched.");
  }

  await client.close();
  console.log("\n  Done. Sign in at /admin/login with the admin email above.\n");
}

/** Same index set as `lib/mongo.ts`, so a seed run cannot leave the DB under-indexed. */
async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("posts").createIndexes([
      { key: { slug: 1 }, unique: true },
      { key: { locale: 1, status: 1, publishedAt: -1 } },
      { key: { category: 1 } },
    ]),
    db.collection("testimonials").createIndexes([
      { key: { locale: 1, status: 1, createdAt: -1 } },
      { key: { status: 1, createdAt: -1 } },
    ]),
    db.collection("faqs").createIndexes([{ key: { locale: 1, order: 1 } }]),
    db.collection("admins").createIndexes([{ key: { email: 1 }, unique: true }]),
    db.collection("leads").createIndexes([{ key: { createdAt: -1 } }]),
  ]);
}

function countByLocale(items: { locale: string }[]): string {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.locale, (counts.get(item.locale) ?? 0) + 1);
  }
  return [...counts.entries()].map(([locale, n]) => `${n} ${locale}`).join(", ");
}

main().catch(async (error) => {
  console.error("\n  Seed failed:", error instanceof Error ? error.message : error, "\n");
  process.exit(1);
});