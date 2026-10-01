"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ImagePlus, X, Check } from "lucide-react";
import { savePostAction } from "@/app/admin/actions";
import type { Post } from "@/lib/content-schema";
import { cn } from "@/lib/utils";

/**
 * Blog post editor.
 *
 * Markdown textarea rather than a WYSIWYG: markdown is what gets stored, so a
 * plain textarea means the stored source and the edited source are identical —
 * no hidden HTML round-trip, no sanitiser surprises. A preview pane is provided
 * so the author still gets immediate visual feedback.
 *
 * Cover images upload directly from the browser to Cloudinary using a signature
 * from `/api/admin/upload/signature`. Only the resulting `publicId` is submitted
 * with the form, which keeps the Server Action body small.
 */

const input =
  "w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-400 outline-none transition-colors duration-300 focus:border-cdagreen/60";

const label = "mb-1.5 block text-xs uppercase tracking-[0.2em] text-ink-400";

type Cover = { publicId: string; url: string; width: number; height: number; alt?: string };

export function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const [cover, setCover] = useState<Cover | null>(post?.cover ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const upload = async (file: File) => {
    setUploading(true);
    setUploadError("");

    try {
      // 1. Ask the server for a scoped signature.
      const sigRes = await fetch("/api/admin/upload/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "cda/posts" }),
      });
      if (!sigRes.ok) throw new Error("Could not authorise the upload.");
      const signature = (await sigRes.json()) as {
        signature: string;
        timestamp: number;
        cloudName: string;
        apiKey: string;
        folder: string;
        transformation: string;
      };

      // 2. Send the file straight to the CDN.
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", signature.apiKey);
      form.append("timestamp", String(signature.timestamp));
      form.append("signature", signature.signature);
      form.append("folder", signature.folder);
      form.append("transformation", signature.transformation);

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        { method: "POST", body: form },
      );
      if (!upRes.ok) throw new Error("Cloudinary rejected the upload.");

      const uploaded = (await upRes.json()) as {
        public_id: string;
        secure_url: string;
        width: number;
        height: number;
      };

      setCover({
        publicId: uploaded.public_id,
        url: uploaded.secure_url,
        width: uploaded.width,
        height: uploaded.height,
      });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = (formData: FormData) => {
    if (cover) {
      formData.set("coverPublicId", cover.publicId);
      formData.set("coverUrl", cover.url);
      formData.set("coverWidth", String(cover.width));
      formData.set("coverHeight", String(cover.height));
      formData.set("coverAlt", cover.alt ?? "");
    }

    startTransition(async () => {
      const result = await savePostAction(formData);
      setMessage({ ok: result.ok, text: result.error ?? (result.ok ? "Saved." : "Could not save.") });
      setFieldErrors(result.fieldErrors ?? {});
      if (result.ok) router.refresh();
    });
  };

  return (
    <form ref={formRef} action={submit} className="space-y-8">
      {post && <input type="hidden" name="id" value={post._id} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* Main column */}
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className={label}>Title</label>
            <input
              id="title"
              name="title"
              required
              defaultValue={post?.title}
              placeholder="Ce que votre client va retenir en une phrase"
              className={input}
              aria-describedby={fieldErrors.title ? "err-title" : undefined}
            />
            {fieldErrors.title && (
              <p id="err-title" className="mt-1.5 text-xs text-cdared">{fieldErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="excerpt" className={label}>Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              defaultValue={post?.excerpt}
              placeholder="Deux phrases maximum. C'est ce qui apparaît dans la liste et sur le partage WhatsApp."
              className={cn(input, "resize-none")}
            />
            {fieldErrors.excerpt && (
              <p className="mt-1.5 text-xs text-cdared">{fieldErrors.excerpt[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className={label}>Content (Markdown)</label>
            <textarea
              id="content"
              name="content"
              rows={22}
              required
              defaultValue={post?.content}
              placeholder={"## Un titre\n\nVotre texte ici.\n\n- Une liste\n- Un point"}
              className={cn(input, "resize-y font-mono text-[0.8rem] leading-relaxed")}
            />
            {fieldErrors.content && (
              <p className="mt-1.5 text-xs text-cdared">{fieldErrors.content[0]}</p>
            )}
            <p className="mt-1.5 text-xs text-ink-500">
              Markdown only: <code className="text-ink-400">## titre</code>,{" "}
              <code className="text-ink-400">**gras**</code>,{" "}
              <code className="text-ink-400">- liste</code>,{" "}
              <code className="text-ink-400">&gt; citation</code>. Le HTML est
              neutralisé pour votre sécurité.
            </p>
          </div>

          <details className="glass rounded-2xl p-5">
            <summary className="cursor-pointer font-display text-sm font-semibold text-ink-50">
              SEO overrides (optional)
            </summary>
            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="metaTitle" className={label}>Meta title</label>
                <input
                  id="metaTitle"
                  name="metaTitle"
                  defaultValue={post?.metaTitle}
                  placeholder={post?.title}
                  maxLength={70}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="metaDescription" className={label}>Meta description</label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  rows={2}
                  defaultValue={post?.metaDescription}
                  placeholder={post?.excerpt}
                  maxLength={180}
                  className={cn(input, "resize-none")}
                />
              </div>
            </div>
          </details>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="glass space-y-5 rounded-2xl p-5">
            <div>
              <label htmlFor="status" className={label}>Status</label>
              <select id="status" name="status" defaultValue={post?.status ?? "draft"} className={input}>
                <option value="draft" className="bg-ink-900">Draft</option>
                <option value="published" className="bg-ink-900">Published</option>
              </select>
            </div>

            <div>
              <label htmlFor="locale" className={label}>Language</label>
              <select id="locale" name="locale" defaultValue={post?.locale ?? "fr"} className={input}>
                <option value="fr" className="bg-ink-900">Français</option>
                <option value="en" className="bg-ink-900">English</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className={label}>Category</label>
              <input
                id="category"
                name="category"
                required
                defaultValue={post?.category}
                placeholder="Marketing"
                className={input}
              />
              {fieldErrors.category && (
                <p className="mt-1.5 text-xs text-cdared">{fieldErrors.category[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className={label}>Slug</label>
              <input
                id="slug"
                name="slug"
                defaultValue={post?.slug}
                placeholder="auto-generated from the title"
                className={cn(input, "font-mono text-xs")}
              />
              {fieldErrors.slug && (
                <p className="mt-1.5 text-xs text-cdared">{fieldErrors.slug[0]}</p>
              )}
            </div>
          </div>

          {/* Cover image */}
          <div className="glass rounded-2xl p-5">
            <p className={label}>Cover image</p>

            {cover ? (
              <div className="space-y-3">
                {/* Plain <img>: the URL is a fully-formed Cloudinary delivery URL,
                    not an optimisable Next.js import target. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover.url}
                  alt={cover.alt ?? ""}
                  className="aspect-[16/9] w-full rounded-xl object-cover"
                />
                <input
                  aria-label="Cover image alt text"
                  type="text"
                  value={cover.alt ?? ""}
                  onChange={(e) => setCover({ ...cover, alt: e.target.value })}
                  placeholder="Alt text (describe the image)"
                  className={cn(input, "text-xs")}
                />
                <button
                  type="button"
                  onClick={() => setCover(null)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs text-ink-300 transition-colors duration-300 hover:border-cdared/40 hover:text-cdared"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-8 text-xs text-ink-400 transition-colors duration-300 hover:border-cdagreen/40 hover:text-cdagreen-bright disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
                {uploading ? "Uploading…" : "Upload an image"}
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
              }}
            />

            {uploadError && (
              <p role="alert" className="mt-2 text-xs text-cdared">{uploadError}</p>
            )}
            <p className="mt-3 text-[0.65rem] leading-relaxed text-ink-500">
              Uploaded straight to Cloudinary, resized and converted automatically.
              Landscape 16:9 works best.
            </p>
          </div>
        </aside>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-0 -mx-6 flex items-center justify-between gap-4 border-t border-white/5 bg-ink-950/90 px-6 py-4 backdrop-blur-xl">
        {message ? (
          <p role="status" className={cn("text-sm", message.ok ? "text-cdagreen-bright" : "text-cdared")}>
            {message.ok && <Check className="mr-1.5 inline h-4 w-4" />}
            {message.text}
          </p>
        ) : (
          <p className="text-sm text-ink-500">Changes go live immediately when published.</p>
        )}

        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex items-center gap-2 rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          {post ? "Save changes" : "Create post"}
        </button>
      </div>
    </form>
  );
}
