import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/admin-guard";
import { getAdminPost } from "@/lib/content";
import { PostEditor } from "../PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  await requireAdminPage();

  const post = await getAdminPost(params.id);
  if (!post) notFound();

  const publicUrl = `/${post.locale === "en" ? "en/" : ""}blog/${post.slug}`;

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 text-sm text-ink-400 transition-colors duration-300 hover:text-cdagreen-bright"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-display-sm font-bold text-ink-50">Edit post</h1>
            <p className="mt-2 text-sm text-ink-300">
              Last updated {new Date(post.updatedAt).toLocaleString("fr-FR")}
              {post.publishedAt &&
                ` · live since ${new Date(post.publishedAt).toLocaleDateString("fr-FR")}`}
            </p>
          </div>

          {post.status === "published" && (
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-ink-200 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
            >
              View on site
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      <PostEditor post={post} />
    </div>
  );
}
