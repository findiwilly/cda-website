"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, Trash2, Star, Loader2 } from "lucide-react";
import { deleteFaqAction, saveFaqAction } from "@/app/admin/actions";
import type { Faq } from "@/lib/content-schema";
import { FaqFields } from "./FaqFields";
import { cn } from "@/lib/utils";

/**
 * One FAQ, collapsed by default. Expanding turns it into an inline edit form —
 * editing a two-line answer shouldn't require navigating away from the list.
 */

export function FaqRow({ faq }: { faq: Faq }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const toggleFeatured = () => {
    setError("");
    const formData = new FormData();
    formData.set("id", faq._id);
    formData.set("question", faq.question);
    formData.set("answer", faq.answer);
    formData.set("category", faq.category);
    formData.set("locale", faq.locale);
    formData.set("order", String(faq.order));
    formData.set("featured", faq.featured ? "" : "on");

    startTransition(async () => {
      const result = await saveFaqAction(formData);
      if (!result.ok) setError(result.error ?? "Could not update.");
    });
  };

  const remove = () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete this FAQ?\n\n${faq.question}`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteFaqAction(faq._id);
      if (!result.ok) setError(result.error ?? "Could not delete.");
    });
  };

  if (editing) {
    return (
      <div className="glass rounded-2xl p-5">
        <FaqFields
          id={faq._id}
          defaults={faq}
          submitLabel="Save changes"
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <article className="glass rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold text-ink-50">
            {faq.question}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-300">
            {faq.answer}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <span className="rounded-full bg-white/5 px-2 py-0.5 uppercase tracking-[0.15em] ring-1 ring-white/10">
              {faq.category}
            </span>
            <span>order {faq.order}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleFeatured}
            disabled={pending}
            aria-pressed={faq.featured}
            title={faq.featured ? "Unpin from the top" : "Pin to the top"}
            className={cn(
              "rounded-full p-2 transition-colors duration-300 disabled:opacity-50",
              faq.featured
                ? "bg-cdayellow/15 text-cdayellow ring-1 ring-cdayellow/30"
                : "border border-white/15 text-ink-400 hover:text-cdayellow",
            )}
          >
            <Star className={cn("h-3.5 w-3.5", faq.featured && "fill-cdayellow")} />
            <span className="sr-only">
              {faq.featured ? "Unpin this FAQ" : "Pin this FAQ to the top"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-xs text-ink-300 transition-colors duration-300 hover:border-cdagreen/40 hover:text-ink-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-cdared/30 px-3.5 py-2 text-xs text-cdared transition-colors duration-300 hover:bg-cdared/10 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {(pending || error) && (
        <p className={cn("mt-3 text-xs", error ? "text-cdared" : "text-ink-500")} role={error ? "alert" : undefined}>
          {error ?? (
            <>
              <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
              Saving…
            </>
          )}
        </p>
      )}

      {done && !pending && !error && (
        <p className="mt-3 text-xs text-cdagreen-bright">
          <Check className="mr-1 inline h-3 w-3" />
          Saved
        </p>
      )}
    </article>
  );
}