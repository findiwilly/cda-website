import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/admin-guard";
import { PostEditor } from "../PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requireAdminPage();

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
        <h1 className="mt-4 font-display text-display-sm font-bold text-ink-50">New post</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-300">
          Write in French first. When the English version is ready, add it as a
          separate post with the same slug in the other language.
        </p>
      </header>

      <PostEditor />
    </div>
  );
}
