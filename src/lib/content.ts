import "server-only";

import { ObjectId } from "mongodb";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { COLLECTIONS, collection, getDb } from "@/lib/mongo";
import {
  readingTimeFor,
  type Faq,
  type FaqInput,
  type ImageAsset,
  type LeadInput,
  type Locale2,
  type Post,
  type PostInput,
  type Testimonial,
  type TestimonialInput,
} from "@/lib/content-schema";

/**
 * Content repository.
 *
 * Every read is wrapped in `unstable_cache` with a tag, and every write
 * revalidates the matching tag. That gives admin edits near-instant
 * propagation while the public pages keep serving cached HTML — the site's
 * mobile/low-bandwidth budget depends on pages not re-rendering per request.
 *
 * Every function tolerates an absent database and returns an empty result
 * rather than throwing, so a build with no credentials still produces a full,
 * valid site.
 */

const REVALIDATE = 3600;

/**
 * Loosely typed Mongo document.
 *
 * `_id` is optional because the driver's `insertOne` accepts a document without
 * one and generates it. Reads are always given `_id` by the server.
 */
type Doc = Record<string, unknown> & { _id?: ObjectId };

function toIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  return null;
}

/**
 * Mongo document → plain object safe to pass across the RSC boundary.
 *
 * `T` is the *output* shape (with a string `_id` and ISO dates), which is
 * deliberately not constrained by the input: the whole point is to change those
 * two types.
 */
function serialize<T>(doc: Doc): T {
  const { _id, ...rest } = doc;
  const out = { ...rest, _id: _id?.toHexString() ?? "" } as Record<string, unknown>;

  for (const key of ["createdAt", "updatedAt", "publishedAt", "reviewedAt"]) {
    if (key in out) out[key] = toIso(out[key]);
  }
  return out as T;
}

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

/**
 * Created once per process. `createIndexes` is idempotent server-side, and
 * unique indexes on `slug`/`translationOf` are what stop a double-submitted
 * admin form from creating duplicate posts.
 */
async function ensureIndexes(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await Promise.all([
    db.collection(COLLECTIONS.posts).createIndexes([
      { key: { slug: 1 }, unique: true },
      { key: { locale: 1, status: 1, publishedAt: -1 } },
      { key: { category: 1 } },
    ]),
    db.collection(COLLECTIONS.testimonials).createIndexes([
      { key: { locale: 1, status: 1, createdAt: -1 } },
      { key: { status: 1, createdAt: -1 } },
    ]),
    db.collection(COLLECTIONS.faqs).createIndexes([
      { key: { locale: 1, order: 1 } },
    ]),
    db.collection(COLLECTIONS.admins).createIndexes([
      { key: { email: 1 }, unique: true },
    ]),
    db.collection(COLLECTIONS.leads).createIndexes([
      { key: { createdAt: -1 } },
    ]),
  ]);
}

export function prepareDatabase(): Promise<void> {
  const globalRef = globalThis as unknown as { __cdaIndexes?: Promise<void> };
  if (!globalRef.__cdaIndexes) {
    globalRef.__cdaIndexes = ensureIndexes().catch((error) => {
      globalRef.__cdaIndexes = undefined;
      console.error("[cda] index setup failed:", error);
    });
  }
  return globalRef.__cdaIndexes;
}

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

const postTag = "posts";

export async function listPublishedPosts(locale: Locale2): Promise<Post[]> {
  return unstableCached(async () => {
    await prepareDatabase();
    const col = await collection<Doc>(COLLECTIONS.posts);
    if (!col) return [];
    const docs = await col
      .find({ locale, status: "published" })
      .sort({ publishedAt: -1 })
      .toArray();
    return docs.map((d) => serialize<Post>(d));
  }, ["posts", "published", locale], { tags: [postTag], revalidate: REVALIDATE });
}

export async function listAllPosts(): Promise<Post[]> {
  return unstableCached(async () => {
    await prepareDatabase();
    const col = await collection<Doc>(COLLECTIONS.posts);
    if (!col) return [];
    const docs = await col.find({}).sort({ updatedAt: -1 }).toArray();
    return docs.map((d) => serialize<Post>(d));
  }, ["posts", "all"], { tags: [postTag], revalidate: 60 });
}

/**
 * Single post for the admin editor. Unlike the public reads this is not cached —
 * an editor must always see the true current state, not a value up to an hour
 * old. It also ignores status, so a draft stays editable.
 */
export async function getAdminPost(id: string): Promise<Post | null> {
  await prepareDatabase();
  const col = await collection<Doc>(COLLECTIONS.posts);
  if (!col || !ObjectId.isValid(id)) return null;
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? serialize<Post>(doc) : null;
}

export async function getPostBySlug(slug: string, locale: Locale2): Promise<Post | null> {
  return unstableCached(async () => {
    await prepareDatabase();
    const col = await collection<Doc>(COLLECTIONS.posts);
    if (!col) return null;
    const doc = await col.findOne({ slug, locale, status: "published" });
    return doc ? serialize<Post>(doc) : null;
  }, ["post", slug, locale], { tags: [postTag], revalidate: REVALIDATE });
}

/**
 * Published slugs paired with the locale they were written in.
 *
 * The pairing is essential, not cosmetic. `generateStaticParams` needs both
 * values per route; returning bare slugs invites a cross product with the
 * locale list, which pre-renders `/fr/blog/<english-slug>` for every English
 * post. Those pages then render `notFound()` and are served as static files —
 * a soft 404 with a 200 status, which search engines treat as real content.
 */
export async function getPublishedPostSlugs(): Promise<
  { slug: string; locale: Locale2 }[]
> {
  await prepareDatabase();
  const col = await collection<Doc>(COLLECTIONS.posts);
  if (!col) return [];
  const docs = await col
    .find({ status: "published" }, { projection: { slug: 1, locale: 1 } })
    .toArray();
  return docs
    .filter((d) => d.locale === "fr" || d.locale === "en")
    .map((d) => ({ slug: String(d.slug), locale: d.locale as Locale2 }));
}

/**
 * Where to send a visitor who asked for a post in the wrong language.
 *
 * The language toggle swaps the locale segment and keeps the slug. That is
 * correct for every route except one: a blog post is a single document with a
 * single slug, and the French and English versions are two *different*
 * documents with *different* slugs. So toggling `/blog/prix-site-web-cameroun`
 * to English asks for `/en/blog/prix-site-web-cameroun`, which exists nowhere —
 * the visitor lands on a 404 and concludes the toggle is broken.
 *
 * Given that unreachable URL, this returns the best available destination, as a
 * locale-agnostic path the caller prefixes:
 *
 *   - the post's actual translation, when it has a published one
 *   - otherwise the blog index in the requested language. Not the same post in
 *     its original language: bouncing back there leaves the toggle looking
 *     broken, which is the very thing being fixed
 *   - `null` when no published post anywhere uses that slug — a real 404
 *
 * Returns a path rather than performing the redirect so the caller stays in
 * charge of the response, and so this stays unit-testable.
 */
export async function resolveWrongLocalePost(
  slug: string,
  requestedLocale: Locale2,
): Promise<string | null> {
  await prepareDatabase();
  const col = await collection<Doc>(COLLECTIONS.posts);
  if (!col) return null;

  // `posts.slug` carries a unique index, so a slug identifies exactly one post
  // across both languages — including which language it was written in.
  const post = await col.findOne(
    { slug, status: "published" },
    { projection: { locale: 1, translationOf: 1 } },
  );
  if (!post) return null;

  // Only reached when the post exists but not in the requested language. Guard
  // anyway: if the two somehow agree, there is nothing to redirect to and
  // redirecting would loop.
  if (post.locale === requestedLocale) return null;

  const translationId = typeof post.translationOf === "string" ? post.translationOf : null;
  if (translationId && ObjectId.isValid(translationId)) {
    const translation = await col.findOne(
      { _id: new ObjectId(translationId), status: "published" },
      { projection: { slug: 1, locale: 1 } },
    );
    // Only follow it if it really is the language being asked for; a dangling
    // or mistyped `translationOf` must not send the visitor to a third thing.
    if (translation && translation.locale === requestedLocale) {
      return `/blog/${String(translation.slug)}`;
    }
  }

  return "/blog";
}

export async function createPost(input: PostInput): Promise<Post> {
  await prepareDatabase();
  const col = await collection<Doc>(COLLECTIONS.posts);
  if (!col) throw new Error("MongoDB is not configured.");
  const now = new Date();
  const doc = {
    ...input,
    cover: input.cover ?? null,
    translationOf: input.translationOf ?? null,
    metaTitle: input.metaTitle || undefined,
    metaDescription: input.metaDescription || undefined,
    readingTime: readingTimeFor(input.content),
    createdAt: now,
    updatedAt: now,
    publishedAt: input.status === "published" ? now : null,
  };
  const result = await col.insertOne(doc);
  revalidateContent(postTag);
  revalidatePostPages(doc.slug);
  return serialize<Post>({ ...doc, _id: result.insertedId });
}

export async function updatePost(id: string, input: PostInput): Promise<Post | null> {
  const col = await collection<Doc>(COLLECTIONS.posts);
  if (!col || !ObjectId.isValid(id)) return null;

  const existing = await col.findOne({ _id: new ObjectId(id) });
  if (!existing) return null;

  const previousSlug = typeof existing.slug === "string" ? existing.slug : null;
  const prevStatus = existing.status;
  const prevPublishedAt = toIso(existing.publishedAt);

  const doc = {
    ...input,
    cover: input.cover ?? null,
    translationOf: input.translationOf ?? null,
    readingTime: readingTimeFor(input.content),
    updatedAt: new Date(),
    // Set on first publish, preserved across later edits so the date a post
    // went live never silently moves.
    publishedAt:
      input.status === "published"
        ? prevStatus === "published" && prevPublishedAt
          ? new Date(prevPublishedAt)
          : new Date()
        : null,
  };

  await col.updateOne({ _id: new ObjectId(id) }, { $set: doc });
  revalidateContent(postTag);
  revalidatePostPages(input.slug);
  // A slug change leaves the old URL's cached HTML behind — drop it too.
  if (previousSlug && previousSlug !== input.slug) {
    revalidatePostPages(previousSlug);
  }
  return serialize<Post>({ ...doc, _id: new ObjectId(id) });
}

export async function deletePost(id: string): Promise<boolean> {
  const col = await collection<Doc>(COLLECTIONS.posts);
  if (!col || !ObjectId.isValid(id)) return false;

  const existing = await col.findOne({ _id: new ObjectId(id) });
  const { deletedCount } = await col.deleteOne({ _id: new ObjectId(id) });
  revalidateContent(postTag);
  if (existing && typeof existing.slug === "string") {
    revalidatePostPages(existing.slug);
  }
  return deletedCount > 0;
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

const testimonialTag = "testimonials";

export async function listApprovedTestimonials(locale?: Locale2): Promise<Testimonial[]> {
  return unstableCached(async () => {
    await prepareDatabase();
    const col = await collection<Doc>(COLLECTIONS.testimonials);
    if (!col) return [];
    const filter = locale
      ? { status: "approved", locale }
      : { status: "approved", locale: { $in: ["fr", "en"] } };
    const docs = await col.find(filter).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => serialize<Testimonial>(d));
  }, ["testimonials", "approved", locale ?? "all"], {
    tags: [testimonialTag],
    revalidate: REVALIDATE,
  });
}

export async function listAllTestimonials(): Promise<Testimonial[]> {
  return unstableCached(async () => {
    await prepareDatabase();
    const col = await collection<Doc>(COLLECTIONS.testimonials);
    if (!col) return [];
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((d) => serialize<Testimonial>(d));
  }, ["testimonials", "all"], { tags: [testimonialTag], revalidate: 60 });
}

export async function createTestimonial(
  input: TestimonialInput,
  status: Testimonial["status"] = "pending",
  source: Testimonial["source"] = "form",
): Promise<Testimonial | null> {
  const col = await collection<Doc>(COLLECTIONS.testimonials);
  if (!col) return null;
  const now = new Date();
  const doc = {
    ...input,
    website: input.website || undefined,
    role: input.role || undefined,
    company: input.company || undefined,
    status,
    source,
    createdAt: now,
    reviewedAt: status === "pending" ? null : now,
  };
  const result = await col.insertOne(doc);
  revalidateContent(testimonialTag);
  revalidateTestimonialPages();
  return serialize<Testimonial>({ ...doc, _id: result.insertedId });
}

export async function setTestimonialStatus(
  id: string,
  status: Testimonial["status"],
): Promise<boolean> {
  const col = await collection<Doc>(COLLECTIONS.testimonials);
  if (!col || !ObjectId.isValid(id)) return false;
  const { modifiedCount } = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, reviewedAt: new Date() } },
  );
  revalidateContent(testimonialTag);
  revalidateTestimonialPages();
  return modifiedCount > 0;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const col = await collection<Doc>(COLLECTIONS.testimonials);
  if (!col || !ObjectId.isValid(id)) return false;
  const { deletedCount } = await col.deleteOne({ _id: new ObjectId(id) });
  revalidateContent(testimonialTag);
  revalidateTestimonialPages();
  return deletedCount > 0;
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

const faqTag = "faqs";

export async function listFaqs(locale: Locale2): Promise<Faq[]> {
  return unstableCached(async () => {
    await prepareDatabase();
    const col = await collection<Doc>(COLLECTIONS.faqs);
    if (!col) return [];
    const docs = await col
      .find({ locale })
      .sort({ featured: -1, order: 1, createdAt: 1 })
      .toArray();
    return docs.map((d) => serialize<Faq>(d));
  }, ["faqs", locale], { tags: [faqTag], revalidate: REVALIDATE });
}

export async function listAllFaqs(): Promise<Faq[]> {
  return unstableCached(async () => {
    await prepareDatabase();
    const col = await collection<Doc>(COLLECTIONS.faqs);
    if (!col) return [];
    const docs = await col
      .find({})
      .sort({ locale: 1, category: 1, order: 1 })
      .toArray();
    return docs.map((d) => serialize<Faq>(d));
  }, ["faqs", "all"], { tags: [faqTag], revalidate: 60 });
}

export async function createFaq(input: FaqInput): Promise<Faq | null> {
  const col = await collection<Doc>(COLLECTIONS.faqs);
  if (!col) return null;
  const now = new Date();
  const doc = { ...input, createdAt: now, updatedAt: now };
  const result = await col.insertOne(doc);
  revalidateContent(faqTag);
  revalidateFaqPages();
  return serialize<Faq>({ ...doc, _id: result.insertedId });
}

export async function updateFaq(id: string, input: FaqInput): Promise<boolean> {
  const col = await collection<Doc>(COLLECTIONS.faqs);
  if (!col || !ObjectId.isValid(id)) return false;
  const { modifiedCount } = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date() } },
  );
  revalidateContent(faqTag);
  revalidateFaqPages();
  return modifiedCount > 0;
}

export async function deleteFaq(id: string): Promise<boolean> {
  const col = await collection<Doc>(COLLECTIONS.faqs);
  if (!col || !ObjectId.isValid(id)) return false;
  const { deletedCount } = await col.deleteOne({ _id: new ObjectId(id) });
  revalidateContent(faqTag);
  revalidateFaqPages();
  return deletedCount > 0;
}

/** FAQ categories present for a locale, in first-appearance order. */
export async function listFaqCategories(locale: Locale2): Promise<string[]> {
  const faqs = await listFaqs(locale);
  return [...new Set(faqs.map((f) => f.category))];
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function createLead(input: LeadInput): Promise<boolean> {
  const col = await collection<Doc>(COLLECTIONS.leads);
  if (!col) return false;
  await col.insertOne({ ...input, read: false, createdAt: new Date() });
  return true;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * `unstable_cache` is only imported lazily so this module can be called from
 * contexts where Next's cache is unavailable (seed scripts, tests).
 */
async function unstableCached<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options: { tags: string[]; revalidate: number },
): Promise<T> {
  return unstable_cache(fn, keyParts, options)();
}

/**
 * Drop every cached copy of a content type. Called after each write so admin
 * edits appear on the public site without a redeploy.
 */
function revalidateContent(tag: string): void {
  try {
    revalidateTag(tag);
  } catch (error) {
    console.error(`[cda] failed to revalidate "${tag}":`, error);
  }
}

/**
 * Also drop specific page paths.
 *
 * Tag invalidation clears the cached *data*, but a page's cached HTML only
 * refreshes when its own path is revalidated. This matters most for a post
 * whose slug changed: the old URL's HTML would otherwise keep serving.
 */
function revalidatePages(...paths: string[]): void {
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.error(`[cda] failed to revalidate path "${path}":`, error);
    }
  }
}

/** Blog surfaces: the article, the list, and the home page that links to both. */
function revalidatePostPages(slug: string): void {
  revalidatePages(
    `/blog/${slug}`,
    `/en/blog/${slug}`,
    "/blog",
    "/en/blog",
    "/",
    "/en",
    "/sitemap.xml",
  );
}

/** Testimonials appear on their own page and in the home page band. */
function revalidateTestimonialPages(): void {
  revalidatePages("/", "/en", "/testimonials", "/en/testimonials");
}

/** FAQs appear on /faq and in the contact-page accordion. */
function revalidateFaqPages(): void {
  revalidatePages("/faq", "/en/faq", "/contact", "/en/contact");
}

/** Coerce an unknown string into a locale, defaulting to French. */
export function toLocale(value: string | undefined): Locale2 {
  return value === "en" ? "en" : "fr";
}

export type { ImageAsset };
