import Link from "next/link";
import { FileText, Quote, HelpCircle, Plus, ExternalLink, AlertTriangle } from "lucide-react";
import { requireAdminPage } from "@/lib/admin-guard";
import { listAllFaqs, listAllPosts, listAllTestimonials } from "@/lib/content";
import { hasCloudinary, hasSmtp } from "@/lib/env";

export const dynamic = "force-dynamic";

const card =
  "glass rounded-2xl p-6";

/**
 * Dashboard: a health check on the content pipeline plus the three entry
 * points. Deliberately an overview rather than a data-heavy report — the real
 * work happens on the three sub-pages.
 */
export default async function AdminDashboard() {
  await requireAdminPage();

  const [posts, testimonials, faqs] = await Promise.all([
    listAllPosts(),
    listAllTestimonials(),
    listAllFaqs(),
  ]);

  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft");
  const pending = testimonials.filter((t) => t.status === "pending");
  const approved = testimonials.filter((t) => t.status === "approved");

  const frPosts = posts.filter((p) => p.locale === "fr").length;
  const enPosts = posts.filter((p) => p.locale === "en").length;

  const cards = [
    {
      href: "/admin/posts",
      label: "Blog posts",
      value: posts.length,
      detail: `${published.length} published · ${drafts.length} draft · ${frPosts} FR / ${enPosts} EN`,
      icon: FileText,
    },
    {
      href: "/admin/testimonials",
      label: "Testimonials",
      value: testimonials.length,
      detail: `${approved.length} live · ${pending.length} awaiting review`,
      icon: Quote,
      highlight: pending.length > 0,
    },
    {
      href: "/admin/faqs",
      label: "FAQs",
      value: faqs.length,
      detail: `${faqs.filter((f) => f.locale === "fr").length} FR · ${faqs.filter((f) => f.locale === "en").length} EN`,
      icon: HelpCircle,
    },
  ];

  const integrations = [
    { label: "MongoDB", ok: true, detail: "Content storage" },
    { label: "Cloudinary", ok: hasCloudinary, detail: "Image uploads" },
    { label: "SMTP", ok: hasSmtp, detail: "Notifications" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-display-sm font-bold text-ink-50">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-300">
          Everything CDA publishes on the public site, in one place.
        </p>
      </header>

      {/* Moderation call-out: the one thing that needs a human decision. */}
      {pending.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-cdayellow/30 via-white/5 to-cdagreen/20 p-px">
          <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-cdayellow" />
              <div>
                <p className="font-display text-lg font-semibold text-ink-50">
                  {pending.length} testimonial{pending.length > 1 ? "s" : ""} waiting for review
                </p>
                <p className="mt-1 text-sm text-ink-300">
                  Nothing appears on the public site until you approve it.
                </p>
              </div>
            </div>
            <Link
              href="/admin/testimonials"
              className="inline-flex items-center gap-2 rounded-full bg-cdayellow px-6 py-3 text-sm font-medium text-ink-950 transition-colors duration-300 hover:bg-cdayellow/90"
            >
              Review now
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Content counters */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((item) => (
          <Link key={item.href} href={item.href} className={`${card} transition-colors duration-300 hover:border-cdagreen/40`}>
            <div className="flex items-start justify-between">
              <span className="inline-flex rounded-xl bg-cdagreen/10 p-3 ring-1 ring-cdagreen/20">
                <item.icon className="h-5 w-5 text-cdagreen-bright" />
              </span>
              {item.highlight && (
                <span className="rounded-full bg-cdayellow/15 px-2.5 py-1 text-[0.65rem] font-medium text-cdayellow ring-1 ring-cdayellow/30">
                  Action needed
                </span>
              )}
            </div>
            <p className="mt-6 font-display text-4xl font-bold text-ink-50">{item.value}</p>
            <p className="mt-1 font-display text-base font-semibold text-ink-100">{item.label}</p>
            <p className="mt-1.5 text-xs text-ink-400">{item.detail}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { href: "/admin/posts/new", label: "Write a blog post", icon: FileText },
            { href: "/admin/faqs/new", label: "Add an FAQ", icon: HelpCircle },
            { href: "/admin/testimonials", label: "Add a testimonial", icon: Quote },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-ink-100 transition-colors duration-300 hover:border-cdagreen/40 hover:bg-white/5"
            >
              <action.icon className="h-4 w-4 text-cdagreen-bright" />
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Integration health — a missing credential should be obvious here
          rather than discovered when an upload silently fails. */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink-50">Integrations</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {integrations.map((item) => (
            <div key={item.label} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-ink-100">{item.label}</span>
                <span
                  className={`h-2 w-2 rounded-full ${item.ok ? "bg-cdagreen-bright" : "bg-cdared"}`}
                  aria-hidden
                />
              </div>
              <p className="mt-1.5 text-xs text-ink-400">
                {item.ok ? item.detail : `Not configured — ${item.detail.toLowerCase()} disabled`}
              </p>
              <span className="sr-only">{item.ok ? "configured" : "not configured"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
