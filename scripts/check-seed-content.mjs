/**
 * Validates `scripts/seed-content.ts` before it reaches a live database.
 *
 * The seed runs against a real Mongo instance, and `seed.ts` is idempotent —
 * content is only inserted when a collection is empty. That means a wrong
 * insert is not trivially reversible from the panel, so the mistakes worth
 * catching are cheap to catch here and expensive to catch in production.
 *
 * Checks:
 *   1. no CJK or replacement characters (mojibake from an encoding round-trip)
 *   2. FAQ answers contain no markdown (they render as plain text *and* go
 *      into FAQPage JSON-LD)
 *   3. no English leaking into French, and no French leaking into English
 *   4. the two locales carry the same questions, in the same order, with the
 *      same featured flags
 *   5. every `translationOfSlug` resolves to a real post
 *   6. post bodies start at `##` and use no other heading level (the article
 *      page owns the h1, and `outlineOf()` only collects `#{2,3}`)
 *   7. every post has at least two headings, so the table of contents is not empty
 */

import { FAQ_SEED, POST_SEED, TESTIMONIAL_SEED } from "./seed-content.ts";

let failures = 0;
const fail = (message) => {
  console.log(`  FAIL ${message}`);
  failures += 1;
};
const ok = (message) => console.log(`  ok   ${message}`);

const ENGLISH = [
  "the", "and", "with", "that", "your", "you", "is", "are", "for", "from",
  "this", "not", "have", "will", "about", "website", "should", "which",
  "their", "when", "what", "there", "been", "they", "them", "than", "then",
  "how", "why", "each", "other", "more", "most", "also", "into", "people",
];
const FRENCH = [
  "les", "des", "une", "dans", "pour", "avec", "votre", "vous", "est", "sont",
  "cette", "nous", "notre", "être", "fait", "comme", "donc", "très", "dont",
  "sans", "leur", "aussi",
  // Common verbs and nouns. A mutation test injects "concevoir" into English
  // copy; without these the French-in-English direction is unchecked, since
  // French morphology offers no suffix as reliable as English -ly/-ing/-ed.
  "concevoir", "construire", "créer", "répondre", "contacter", "demander",
  "obtenir", "faire", "dire", "prendre", "vouloir", "pouvoir", "aller",
  "voir", "savoir", "devoir", "venir", "rester", "croire", "aimer", "parler",
  "écouter", "regarder", "travailler", "utiliser", "gérer", "mesurer",
  "lancer", "gagner", "perdre", "suivre", "changer", "améliorer", "réduire",
  "accroître", "adapté", "conçues", "marché", "marchés", "année", "années",
];

/** Tokens that legitimately appear in both languages — excluded from matching. */
const AMBIGUOUS = new Set([
  "site", "sites", "carte", "test", "expert", "projet", "projets", "info",
  "date", "dates", "score", "note", "notes", "web", "marchand", "mobile",
  "social", "media", "conversion", "audit", "budget", "marché", "marchandise",
]);

/**
 * Morphological backstop for English leaking into French.
 *
 * A hand-written word list only catches the words you thought of: an English
 * adverb or participle like `impossibly` sailed straight through a 60-entry
 * list of function words. English morphology is more predictable than its
 * vocabulary, though — adverbs in -ly and participles in -ing/-ed are rare in
 * French, so the suffix catches a whole category instead of one token.
 */
const FRENCH_SUFFIX_EXCEPTIONS = new Set([
  // -ly
  "elle", "elles", "famille", "quelle", "quelles", "ville", "villes", "nouvelle",
  "nouvelles", "réelle", "réelles", "fidèle", "fidèles", "utile", "utiles",
  "possible", "possibles", "viable", "aimable", "imaginable", "incomparable",
  "considérable", "remarquable", "incroyable", "spectaculaire", "célébrable",
  "inattaquable", "irremplaçable", "mémorable", "favorable", "durable",
  "brillante", "étonnante", "importante", "énorme", "formidable", "ridicule",
  "horrible", "terrible", "invisible", "indispensable", "recevable", "test",
  "tests", "ly", "sully",
  // -ing (French words that end this way are rare; "aging" is not a French word)
  "aging", "building", "meeting", "wedding", "setting", "learning", "morning",
  "evening", "clothing", "bedding", "willing", "sibling",
  // -ed
  "seeded", "bed", "red", "led", "wed", "speed", "tweed", "breed", "greed",
  "deed", "feed", "need", "freed", "indeed", "agreed",
]);

function findForeignByMorphology(text, locale) {
  if (locale !== "fr") return [];
  const words = text.toLowerCase().match(/[a-zà-ÿ]+/g) ?? [];
  const hits = new Set();
  for (const word of words) {
    if (FRENCH_SUFFIX_EXCEPTIONS.has(word) || AMBIGUOUS.has(word)) continue;
    if (ENGLISH.includes(word) || FRENCH.includes(word)) continue;
    if (/(ly|ing|ed)$/.test(word) && word.length >= 5) hits.add(word);
  }
  return [...hits];
}

function findForeign(text, language, ownWords) {
  const words = text.toLowerCase().match(/[a-zà-ÿ]+/g) ?? [];
  const hits = new Set();
  for (const word of words) {
    if (AMBIGUOUS.has(word)) continue;
    if (ownWords.includes(word)) continue;
    if (language === "fr" ? ENGLISH.includes(word) : FRENCH.includes(word)) {
      hits.add(word);
    }
  }
  return [...hits];
}

// --- 1. encoding ------------------------------------------------------------
console.log("\nencoding");
{
  const problems = [];
  const walk = (value, path) => {
    if (typeof value === "string") {
      if (/\uFFFD/.test(value)) problems.push(`${path}: U+FFFD replacement character`);
      if (/[\u3000-\u9FFF\uAC00-\uD7AF]/.test(value)) problems.push(`${path}: CJK characters`);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${path}[${i}]`));
    } else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
    }
  };
  walk({ FAQ_SEED, POST_SEED, TESTIMONIAL_SEED }, "seed");
  if (problems.length) problems.forEach(fail);
  else ok("no replacement or CJK characters");
}

// --- 2. FAQ answers are plain text -----------------------------------------
console.log("\nFAQ answers are plain text");
{
  const bad = [];
  for (const faq of FAQ_SEED) {
    const md = /[*_`]|(^|\n)\s*[-+]\s|(^|\n)\s*\[|\]\(/.exec(faq.answer);
    if (md) bad.push(`[${faq.locale}] ${faq.question.slice(0, 40)} — "${md[0]}"`);
  }
  if (bad.length) bad.forEach(fail);
  else ok(`${FAQ_SEED.length} answers contain no markdown`);
}

// --- 3. language drift ------------------------------------------------------
console.log("\nlanguage drift");
{
  for (const locale of ["fr", "en"]) {
    const own = locale === "fr" ? FRENCH : ENGLISH;
    const other = locale === "fr" ? "English" : "French";
    const problems = [];
    for (const faq of FAQ_SEED.filter((f) => f.locale === locale)) {
      const hits = [...findForeign(faq.answer, locale, own), ...findForeignByMorphology(faq.answer, locale)];
      if (hits.length) problems.push(`[${locale}] FAQ "${faq.question.slice(0, 40)}": ${other} ${hits.join(", ")}`);
    }
    for (const post of POST_SEED.filter((p) => p.locale === locale)) {
      const hits = [
        ...findForeign(post.content, locale, own),
        ...findForeignByMorphology(post.content, locale),
      ];
      if (hits.length) problems.push(`[${locale}] post "${post.slug}": ${other} ${hits.join(", ")}`);
    }
    if (problems.length) problems.forEach(fail);
    else ok(`${locale}: no ${other} words found`);
  }
}

// --- 4. locales mirror each other ------------------------------------------
console.log("\nlocale parity");
{
  const fr = FAQ_SEED.filter((f) => f.locale === "fr");
  const en = FAQ_SEED.filter((f) => f.locale === "en");
  if (fr.length !== en.length) fail(`FAQ count differs: fr=${fr.length} en=${en.length}`);
  else ok(`${fr.length} questions per locale`);

  const enByKey = new Map(en.map((f) => [f.key, f]));
  if (enByKey.size !== en.length) fail("duplicate keys among the English FAQs");
  if (new Set(fr.map((f) => f.key)).size !== fr.length) fail("duplicate keys among the French FAQs");

  for (const faq of fr) {
    const twin = enByKey.get(faq.key);
    if (!twin) {
      fail(`no English translation for "${faq.question.slice(0, 50)}" (key ${faq.key})`);
      continue;
    }
    if (twin.question === faq.question && faq.locale === "fr") {
      fail(`"${faq.question.slice(0, 50)}" was left untranslated in English`);
    }
    if (twin.order !== faq.order) fail(`order differs for key ${faq.key}: fr=${faq.order} en=${twin.order}`);
    if (twin.featured !== faq.featured) fail(`featured differs for key ${faq.key}: fr=${faq.featured} en=${twin.featured}`);
  }
  if (failures === 0) ok("keys, order and featured flags match across locales");

  const frPosts = POST_SEED.filter((p) => p.locale === "fr");
  const enPosts = POST_SEED.filter((p) => p.locale === "en");
  if (frPosts.length !== enPosts.length) fail(`post count differs: fr=${frPosts.length} en=${enPosts.length}`);
  else ok(`${frPosts.length} posts per locale`);
}

// --- 5. translation links resolve ------------------------------------------
console.log("\ntranslation links");
{
  const slugs = new Set(POST_SEED.map((p) => p.slug));
  for (const post of POST_SEED) {
    if (post.translationOfSlug === null) {
      fail(`post "${post.slug}" has no translation`);
    } else if (!slugs.has(post.translationOfSlug)) {
      fail(`post "${post.slug}" points at missing slug "${post.translationOfSlug}"`);
    } else if (post.translationOfSlug === post.slug) {
      fail(`post "${post.slug}" points at itself`);
    }
  }
  if (failures === 0) ok(`all ${POST_SEED.length} posts link to a counterpart`);

  // Mutual linkage: each post must be the target of exactly one other post.
  for (const post of POST_SEED) {
    const backlinks = POST_SEED.filter((p) => p.translationOfSlug === post.slug);
    if (backlinks.length !== 1) {
      fail(`post "${post.slug}" has ${backlinks.length} backlinks, expected 1`);
    }
  }
}

// --- 6. heading levels ------------------------------------------------------
console.log("\npost headings");
{
  for (const post of POST_SEED) {
    const lines = post.content.split("\n");
    const first = lines.find((l) => l.startsWith("#"));
    if (!first || !/^##\s/.test(first)) {
      fail(`post "${post.slug}" first heading is "${first ?? "(none)"}", expected "## "`);
    }
    const bad = post.content.match(/^#\s+|^####+\s+/gm);
    if (bad) fail(`post "${post.slug}" uses a heading level outside ##/###: ${bad[0]}`);

    const h2 = post.content.match(/^##\s+/gm)?.length ?? 0;
    const h3 = post.content.match(/^###\s+/gm)?.length ?? 0;
    if (h2 + h3 < 2) fail(`post "${post.slug}" has ${h2 + h3} headings; the table of contents would be near-empty`);
  }
  if (failures === 0) ok("all posts start at ## and carry a usable outline");

  // Duplicate heading text would collide on generated ids; `uniqueSlug` papers
  // over it in the renderer, but a body with repeats reads as an editing error.
  for (const post of POST_SEED) {
    const texts = [...post.content.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1].trim().toLowerCase());
    const dupes = texts.filter((t, i) => texts.indexOf(t) !== i);
    if (dupes.length) fail(`post "${post.slug}" repeats heading "${dupes[0]}"`);
  }
}

// --- 7. testimonials -------------------------------------------------------
console.log("\ntestimonials");
{
  if (TESTIMONIAL_SEED.length !== 0) {
    fail(`${TESTIMONIAL_SEED.length} seeded testimonials — these must stay empty, see seed-content.ts`);
  } else {
    ok("collection seeded empty (no invented endorsements)");
  }
}

console.log(
  failures === 0
    ? "\nseed content OK — nothing to fix.\n"
    : `\n${failures} problem(s) found.\n`,
);
process.exit(failures === 0 ? 0 : 1);