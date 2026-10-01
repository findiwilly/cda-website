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
 *    content lives in `seed-content.ts`, which has no such import, and declares
 *    its own shapes.
 *  - Every step is idempotent and additive: an admin that already exists is left
 *    alone, and content is only inserted when the collection is empty. Running it
 *    twice will not duplicate anything or overwrite work done in the admin panel.
 *  - The admin password is never logged, and it is read from the environment
 *    rather than argv so it never lands in shell history or a process listing.
 *  - `.env.local` is read here because Node does not load it on its own. Next
 *    loads it for the app; a bare `node` invocation has to be told.
 */

import { readFileSync } from "node:fs";
import { MongoClient, ObjectId, type Db } from "mongodb";
import bcrypt from "bcryptjs";
import {
  FAQ_SEED,
  POST_SEED,
  TESTIMONIAL_SEED,
  type FaqSeed,
  type Locale,
  type PostSeed,
  type TestimonialSeed,
} from "./seed-content.ts";

const DB = process.env.MONGODB_DB ?? "cda";

// `next` loads this file for the app. A bare `node scripts/seed.ts` does not,
// so read it directly. Values may be quoted; a quoted value is unwrapped,
// because the Gmail app password contains spaces and truncating it at the first
// space produces a baffling "535 Invalid login credentials".
function loadEnvFile(): void {
  let raw: string;
  try {
    raw = readFileSync(".env.local", "utf8");
  } catch {
    return; // no local file; rely on the ambient environment
  }
  for (const line of raw.split(/\r?\n/)) {
    if (line.trimStart().startsWith("#")) continue;
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    const quoted = /^"(.*)"$|^'(.*)'$/.exec(match[2]);
    process.env[match[1]] ??= quoted ? (quoted[1] ?? quoted[2]) : match[2];
  }
}

loadEnvFile();

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
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim();
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
  const faqs = db.collection<Omit<FaqSeed, "key"> & { key?: string }>("faqs");
  if ((await faqs.estimatedDocumentCount()) === 0) {
    const now = new Date();
    await faqs.insertMany(
      FAQ_SEED.map(({ key: _pairingKey, ...faq }) => ({
        ...faq,
        _id: new ObjectId(),
        createdAt: now,
        updatedAt: now,
      })),
    );
    console.log(`  + ${FAQ_SEED.length} FAQs seeded (${countByLocale(FAQ_SEED)}).`);
  } else {
    console.log("  = FAQs already present — left untouched.");
  }

  // --- Testimonials --------------------------------------------------------
  const testimonials = db.collection("testimonials");
  if (TESTIMONIAL_SEED.length === 0) {
    console.log("  = testimonials seeded empty, by design.");
    console.log("    Real quotes only: add them in /admin/testimonials, or let clients");
    console.log("    submit them through the form (those arrive as `pending`).");
  } else if ((await testimonials.estimatedDocumentCount()) === 0) {
    const now = new Date();
    await testimonials.insertMany(
      TESTIMONIAL_SEED.map((item: TestimonialSeed) => ({
        ...item,
        _id: new ObjectId(),
        createdAt: now,
        reviewedAt: now,
      })),
    );
    console.log(`  + ${TESTIMONIAL_SEED.length} testimonials seeded.`);
  } else {
    console.log("  = testimonials already present — left untouched.");
  }

  // --- Posts ---------------------------------------------------------------
  const posts = db.collection("posts");
  if ((await posts.estimatedDocumentCount()) === 0) {
    const now = new Date();
    // `_id` has to exist before insert, because `translationOf` references the
    // counterpart's id. Assign them up front rather than relying on Mongo's
    // client-side id generation, which leaves no handle to link against.
    const ids = new Map<string, ObjectId>(POST_SEED.map((post) => [post.slug, new ObjectId()]));

    await posts.insertMany(
      POST_SEED.map((post: PostSeed) => {
        // `translationOfSlug` is a seed-time convenience: it lets the content
        // file stay readable. The stored document holds the counterpart's id.
        const { translationOfSlug, ...rest } = post;
        const translationId = translationOfSlug ? ids.get(translationOfSlug) : undefined;
        if (translationOfSlug && !translationId) {
          throw new Error(`post "${post.slug}" points at missing slug "${translationOfSlug}"`);
        }
        return {
          ...rest,
          translationOf: translationId ? translationId.toHexString() : null,
          cover: null,
          _id: ids.get(post.slug)!,
          readingTime: readingTimeFor(post.content),
          createdAt: now,
          updatedAt: now,
          publishedAt: now,
        };
      }),
    );
    console.log(`  + ${POST_SEED.length} posts seeded (${countByLocale(POST_SEED)}).`);
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

function countByLocale(items: { locale: Locale }[]): string {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.locale, (counts.get(item.locale) ?? 0) + 1);
  }
  return [...counts.entries()].map(([locale, n]) => `${n} ${locale}`).join(", ");
}

main().catch((error) => {
  console.error("\n  Seed failed:", error instanceof Error ? error.message : error, "\n");
  process.exit(1);
});