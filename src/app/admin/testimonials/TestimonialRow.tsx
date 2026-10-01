"use client";

import { useState, useTransition } from "react";
import { Star, Check, X, Clock, Trash2, Loader2 } from "lucide-react";
import {
  deleteTestimonialAction,
  setTestimonialStatusAction,
} from "@/app/admin/actions";
import type { Testimonial } from "@/lib/content-schema";
import { cn } from "@/lib/utils";

/**
 * One testimonial in the moderation queue.
 *
 * The quote is always shown in full, even for pending items — approving a
 * testimonial you cannot read is impossible, and the whole point of the queue
 * is that a human judges the wording.
 */

const input =
  "w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-ink-100 outline-none transition-colors duration-300 focus:border-cdagreen/60";

const statusBadge = {
  pending: "bg-cdayellow/15 text-cdayellow ring-cdayellow/30",
  approved: "bg-cdagreen/15 text-cdagreen-bright ring-cdagreen/30",
  rejected: "bg-cdared/15 text-cdared ring-cdared/30",
} as const;

export function TestimonialRow({ testimonial }: { testimonial: Testimonial }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const act = (
    run: () => Promise<{ ok: boolean; error?: string }>,
  ) => {
    setError("");
    startTransition(async () => {
      const result = await run();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  };

  const identity = [testimonial.role, testimonial.company]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.15em] ring-1",
                statusBadge[testimonial.status],
              )}
            >
              {testimonial.status}
            </span>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-ink-400 ring-1 ring-white/10">
              {testimonial.locale}
            </span>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-ink-400 ring-1 ring-white/10">
              {testimonial.source}
            </span>
          </div>

          <h3 className="mt-2.5 font-display text-base font-semibold text-ink-50">
            {testimonial.name}
            {identity && (
              <span className="ml-2 font-sans text-sm font-normal text-ink-400">
                {identity}
              </span>
            )}
          </h3>

          <div
            className="mt-2 flex items-center gap-1"
            aria-label={`${testimonial.rating} out of 5`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                aria-hidden
                className={cn(
                  "h-3.5 w-3.5",
                  i < testimonial.rating ? "fill-cdayellow text-cdayellow" : "text-ink-600",
                )}
              />
            ))}
          </div>

          <blockquote className="mt-4 border-l-2 border-cdagreen/40 pl-4 text-sm leading-relaxed text-ink-200">
            {testimonial.quote}
          </blockquote>

          <p className="mt-3 text-xs text-ink-500">
            <Clock className="mr-1 inline h-3 w-3" />
            Received {new Date(testimonial.createdAt).toLocaleString("fr-FR")}
            {testimonial.website && (
              <>
                {" · "}
                <span className="font-mono">{testimonial.website}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {testimonial.status !== "approved" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => setTestimonialStatusAction(testimonial._id, "approved"))}
              className="inline-flex items-center gap-1.5 rounded-full bg-cdagreen/15 px-4 py-2 text-xs font-medium text-cdagreen-bright ring-1 ring-cdagreen/30 transition-colors duration-300 hover:bg-cdagreen/25 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </button>
          )}

          {testimonial.status !== "rejected" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => setTestimonialStatusAction(testimonial._id, "rejected"))}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-ink-300 transition-colors duration-300 hover:border-white/40 hover:text-ink-50 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
          )}

          <button
            type="button"
            disabled={pending}
            // eslint-disable-next-line no-alert
            onClick={() => {
              if (!window.confirm(`Delete the testimonial from ${testimonial.name}?`)) return;
              act(() => deleteTestimonialAction(testimonial._id));
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-cdared/30 px-4 py-2 text-xs text-cdared transition-colors duration-300 hover:bg-cdared/10 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {pending && (
        <p className="mt-3 text-xs text-ink-500">
          <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
          Saving…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-xs text-cdared">
          {error}
        </p>
      )}
    </article>
  );
}