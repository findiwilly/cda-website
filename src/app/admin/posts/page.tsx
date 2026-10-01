import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/admin-guard";
import { listAllPosts } from "@/lib/content";
import { DeleteButton } from "@/app/admin/DeleteButton";
import { deletePostAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const statusStyles = {
  published: "bg-cdagreen/15 text-cdagreen-bright ring-cdagreen/30",
  draft: "bg-white/5 text-ink-300 ring-white/15",
} as const;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { locale?: string };
}) {
  await requireAdminPage();

  const posts = await listAllPosts();
  const filter = searchParams.locale === "en" || searchParams.locale === "fr"
    ? searchParams.locale
    : "all";

  const visible = filter === "all" ? posts : posts.filter((p) => p.locale === filter);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm font-bold text-ink-50">Blog posts</h1>
          <p className="mt-2 text-sm text-ink-300">
            {posts.length} post{posts.length === 1 ? "" : "s"} ·{" "}
            {posts.filter((p) => p.status === "published").length} live
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-full bg-cdagreen px-6 py-3 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
        >
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </header>

      {/* Locale filter */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "fr", label: "Français" },
          { key: "en", label: "English" },
        ].map((option) => (
          <Link
            key={option.key}
            href={option.key === "all" ? "/admin/posts" : `/admin/posts?locale=${option.key}`}
            className={`rounded-full px-4 py-2 text-xs transition-colors duration-300 ${
              filter === option.key
                ? "bg-cdagreen/15 text-cdagreen-bright ring-1 ring-cdagreen/30"
                : "text-ink-400 hover:bg-white/5 hover:text-ink-100"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="font-display text-lg font-semibold text-ink-50">No posts yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-300">
            Write the first one. French first — the English version can follow as a
            translation whenever you&apos;re ready.
          </p>
          <Link
            href="/admin/posts/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-cdagreen px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-cdagreen-bright"
          >
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((post) => (
            <article
              key={post._id}
              className="glass flex flex-wrap items-center gap-4 rounded-2xl p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] ring-1 ${
                      statusStyles[post.status]
                    }`}
                  >
                    {post.status}
                  </span>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-ink-400 ring-1 ring-white/10">
                    {post.locale}
                  </span>
                  <span className="text-xs text-ink-500">{post.category}</span>
                  <span className="text-xs text-ink-500">· {post.readingTime} min</span>
                </div>

                <h2 className="mt-2 truncate font-display text-base font-semibold text-ink-50">
                  {post.title}
                </h2>
                <p className="mt-1 truncate font-mono text-xs text-ink-500">/{post.slug}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {post.status === "published" && (
                  <Link
                    href={`/${post.locale === "en" ? "en/" : ""}blog/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-ink-300 transition-colors duration-300 hover:border-white/40 hover:text-ink-50"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                <Link
                  href={`/admin/posts/${post._id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-ink-300 transition-colors duration-300 hover:border-cdagreen/40 hover:text-ink-50"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Link>
                <DeleteButton
                  action={deletePostAction}
                  id={post._id}
                  confirm={`Delete "${post.title}"? This cannot be undone.`}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
