import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, FileText, Quote, HelpCircle, LogOut } from "lucide-react";
import { requireAdminPage } from "@/lib/admin-guard";
import { listAllFaqs, listAllPosts, listAllTestimonials } from "@/lib/content";
import { AdminNav } from "./AdminNav";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Admin — Cameroon Digital Agency",
  robots: { index: false, follow: false },
};

/**
 * Admin shell.
 *
 * Forced dynamic on every child: an admin dashboard must never be cached, or a
 * stale session or stale content counts would be served after a change.
 */

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Blog posts", icon: FileText, exact: false },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quote, exact: false },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle, exact: false },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();

  const [posts, testimonials, faqs] = await Promise.all([
    listAllPosts(),
    listAllTestimonials(),
    listAllFaqs(),
  ]);

  const pendingCount = testimonials.filter((t) => t.status === "pending").length;

  return (
    <div className="min-h-dvh bg-ink-950">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cdagreen font-display text-sm font-bold text-white">
              C
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-ink-50">CDA Admin</p>
              <p className="text-xs text-ink-500">{admin.email}</p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-ink-200 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>

        <div className="mx-auto max-w-[80rem] px-6">
          <AdminNav items={NAV} pendingCount={pendingCount} />
        </div>
      </header>

      <main className="mx-auto max-w-[80rem] px-6 py-10">{children}</main>

      <footer className="mx-auto max-w-[80rem] px-6 pb-10 pt-6 text-xs text-ink-500">
        <Link href="/" className="transition-colors hover:text-cdagreen-bright">
          ← Back to the public site
        </Link>
      </footer>
    </div>
  );
}
