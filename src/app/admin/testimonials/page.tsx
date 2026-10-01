import { requireAdminPage } from "@/lib/admin-guard";
import { listAllTestimonials } from "@/lib/content";
import { TestimonialRow } from "./TestimonialRow";
import { TestimonialCreate } from "./TestimonialCreate";

export const dynamic = "force-dynamic";

/**
 * Testimonial moderation.
 *
 * Split by status because that is the actual decision an admin makes here:
 * what is waiting on me, what is live, what was turned down. Submissions from
 * the public form always arrive as `pending` — this page is the only place they
 * can become visible.
 */
export default async function AdminTestimonialsPage() {
  await requireAdminPage();

  const testimonials = await listAllTestimonials();

  const pending = testimonials.filter((t) => t.status === "pending");
  const approved = testimonials.filter((t) => t.status === "approved");
  const rejected = testimonials.filter((t) => t.status === "rejected");

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-display-sm font-bold text-ink-50">Testimonials</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-300">
          Submissions from the public form land here for review. Nothing appears on
          the site until you approve it.
        </p>
      </header>

      <TestimonialCreate />

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-3 font-display text-lg font-semibold text-ink-50">
            Awaiting review
            <span className="rounded-full bg-cdayellow/15 px-3 py-1 text-xs font-medium text-cdayellow ring-1 ring-cdayellow/30">
              {pending.length}
            </span>
          </h2>
          {pending.map((item) => (
            <TestimonialRow key={item._id} testimonial={item} />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink-50">
          Live on the site
          <span className="ml-3 text-sm font-normal text-ink-500">{approved.length}</span>
        </h2>
        {approved.length === 0 ? (
          <p className="glass rounded-2xl p-8 text-center text-sm text-ink-400">
            No testimonials are live yet.
          </p>
        ) : (
          approved.map((item) => <TestimonialRow key={item._id} testimonial={item} />)
        )}
      </section>

      {rejected.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-ink-400">
            Rejected
            <span className="ml-3 text-sm font-normal text-ink-500">{rejected.length}</span>
          </h2>
          {rejected.map((item) => (
            <TestimonialRow key={item._id} testimonial={item} />
          ))}
        </section>
      )}
    </div>
  );
}
