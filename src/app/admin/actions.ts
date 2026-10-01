"use server";

import { redirect } from "next/navigation";
import {
  createFaq,
  createPost,
  createTestimonial,
  deleteFaq,
  deletePost,
  deleteTestimonial,
  listAllPosts,
  setTestimonialStatus,
  updateFaq,
  updatePost,
} from "@/lib/content";
import {
  faqSchema,
  postSchema,
  testimonialSchema,
  type ImageAsset,
  type PostInput,
} from "@/lib/content-schema";
import { slugify, uniqueSlug } from "@/lib/markdown";
import { notifyAdminAction } from "@/lib/mailer";

/**
 * Admin mutations, as Server Actions.
 *
 * Two things worth knowing before editing:
 *
 *  1. **Every action re-checks the session.** A Server Action is a public HTTP
 *     endpoint — it can be invoked by id without ever visiting the page — so
 *     `assertAuth()` here is the real security boundary, not a nicety.
 *  2. **This file may only export async functions.** Exporting a type is fine
 *     (erased at compile time); exporting a value breaks the build.
 *
 * Actions return a result object rather than throwing, so forms can render
 * validation messages inline instead of dumping the user on an error page.
 */

export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function assertAuth() {
  const { getAdminUser } = await import("@/lib/auth");
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Pull a Zod failure into the shape the forms expect. */
function fieldErrors(error: { flatten(): { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function logoutAction(): Promise<void> {
  const { clearSessionCookie } = await import("@/lib/auth");
  clearSessionCookie();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

/**
 * The cover image is uploaded client-side straight to Cloudinary (a signed
 * upload), so only its `publicId` reaches this action. That keeps large photo
 * payloads off the Server Action body, which would otherwise hit platform
 * request-size limits.
 */
function readCover(formData: FormData): ImageAsset | null {
  const publicId = String(formData.get("coverPublicId") ?? "").trim();
  const url = String(formData.get("coverUrl") ?? "").trim();
  const width = Number(formData.get("coverWidth") ?? 0);
  const height = Number(formData.get("coverHeight") ?? 0);
  const alt = String(formData.get("coverAlt") ?? "").trim();

  // All four are required: a half-populated asset would render broken. The URL
  // is re-validated by `imageAssetSchema`, so a tampered value is rejected.
  if (!publicId || !url || !width || !height) return null;
  return { publicId, url, width, height, alt: alt || undefined };
}

export async function savePostAction(formData: FormData): Promise<ActionResult> {
  await assertAuth();

  const id = String(formData.get("id") ?? "").trim();
  const isNew = id === "";

  const parsed = postSchema.safeParse({
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? ""),
    category: String(formData.get("category") ?? "").trim(),
    locale: formData.get("locale") === "en" ? "en" : "fr",
    status: formData.get("status") === "published" ? "published" : "draft",
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || undefined,
    metaDescription: String(formData.get("metaDescription") ?? "").trim() || undefined,
    translationOf: String(formData.get("translationOf") ?? "").trim() || null,
    cover: readCover(formData),
  });

  if (!parsed.success) {
    return { ok: false, error: "Some fields need attention.", fieldErrors: fieldErrors(parsed.error) };
  }

  let input: PostInput = parsed.data;

  // A blank slug is derived from the title, de-duplicated against existing posts.
  if (!input.slug) {
    const taken = new Set((await listAllPosts()).map((p) => p.slug));
    input = { ...input, slug: uniqueSlug(input.title, (candidate) => taken.has(candidate)) };
  } else {
    const normalised = slugify(input.slug);
    const clash = (await listAllPosts()).some(
      (p) => p.slug === normalised && p._id !== id,
    );
    if (clash) {
      return { ok: false, error: "That slug is already used by another post.", fieldErrors: { slug: ["Already in use"] } };
    }
    input = { ...input, slug: normalised };
  }

  try {
    if (isNew) {
      const created = await createPost(input);
      await notifyAdminAction(
        "Post created",
        `${input.status === "published" ? "Published" : "Drafted"} "${created.title}" (${created.locale.toUpperCase()})`,
      );
    } else {
      const updated = await updatePost(id, input);
      if (!updated) return { ok: false, error: "That post no longer exists." };
      await notifyAdminAction(
        "Post updated",
        `${input.status === "published" ? "Published" : "Drafted"} "${updated.title}" (${updated.locale.toUpperCase()})`,
      );
    }
  } catch (error) {
    // 11000 is Mongo's duplicate-key error — the unique slug index firing.
    const duplicate =
      typeof error === "object" && error !== null && "code" in error && error.code === 11000;
    console.error("[cda:admin] save post failed:", error);
    return {
      ok: false,
      error: duplicate ? "That slug is already taken. Choose another." : "Could not save the post.",
    };
  }

  return { ok: true };
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  await assertAuth();
  if (!(await deletePost(id))) {
    return { ok: false, error: "That post no longer exists." };
  }
  await notifyAdminAction("Post deleted", `Post ${id} removed.`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export async function createTestimonialAction(formData: FormData): Promise<ActionResult> {
  await assertAuth();

  const parsed = testimonialSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim() || undefined,
    company: String(formData.get("company") ?? "").trim() || undefined,
    quote: String(formData.get("quote") ?? "").trim(),
    rating: Number(formData.get("rating") ?? 5),
    website: String(formData.get("website") ?? "").trim(),
    locale: formData.get("locale") === "en" ? "en" : "fr",
  });

  if (!parsed.success) {
    return { ok: false, error: "Some fields need attention.", fieldErrors: fieldErrors(parsed.error) };
  }

  if (!(await createTestimonial(parsed.data, "approved", "manual"))) {
    return { ok: false, error: "Could not save the testimonial." };
  }

  await notifyAdminAction("Testimonial added", `Added "${parsed.data.name}" (entered by admin).`);
  return { ok: true };
}

export async function setTestimonialStatusAction(
  id: string,
  status: "pending" | "approved" | "rejected",
): Promise<ActionResult> {
  await assertAuth();
  if (!(await setTestimonialStatus(id, status))) {
    return { ok: false, error: "That testimonial no longer exists." };
  }
  await notifyAdminAction("Testimonial reviewed", `Status set to "${status}".`);
  return { ok: true };
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult> {
  await assertAuth();
  if (!(await deleteTestimonial(id))) {
    return { ok: false, error: "That testimonial no longer exists." };
  }
  await notifyAdminAction("Testimonial deleted", `Testimonial ${id} removed.`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function saveFaqAction(formData: FormData): Promise<ActionResult> {
  await assertAuth();

  const id = String(formData.get("id") ?? "").trim();

  const parsed = faqSchema.safeParse({
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    locale: formData.get("locale") === "en" ? "en" : "fr",
    order: Number(formData.get("order") ?? 0) || 0,
    featured: formData.get("featured") === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: "Some fields need attention.", fieldErrors: fieldErrors(parsed.error) };
  }

  if (id) {
    if (!(await updateFaq(id, parsed.data))) {
      return { ok: false, error: "That FAQ no longer exists." };
    }
    await notifyAdminAction("FAQ updated", parsed.data.question);
  } else {
    if (!(await createFaq(parsed.data))) {
      return { ok: false, error: "Could not save the FAQ." };
    }
    await notifyAdminAction("FAQ created", parsed.data.question);
  }

  return { ok: true };
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  await assertAuth();
  if (!(await deleteFaq(id))) {
    return { ok: false, error: "That FAQ no longer exists." };
  }
  await notifyAdminAction("FAQ deleted", `FAQ ${id} removed.`);
  return { ok: true };
}
