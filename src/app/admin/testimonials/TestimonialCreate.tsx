"use client";

import { useState, useTransition } from "react";
import { Star, Plus, Check, Loader2 } from "lucide-react";
import { createTestimonialAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

/**
 * "Add a testimonial" — for a quote CDA collects itself (over WhatsApp, at a
 * meeting) rather than one a client submitted. Admin-entered items go straight
 * to `approved`, since the admin is by definition the moderator here.
 */

const input =
  "w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-400 outline-none transition-colors duration-300 focus:border-cdagreen/60";

const label = "mb-1.5 block text-xs uppercase tracking-[0.2em] text-ink-400";

export function TestimonialCreate() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const submit = (formData: FormData) => {
    formData.set("rating", String(rating));

    startTransition(async () => {
      const result = await createTestimonialAction(formData);
      setMessage({
        ok: result.ok,
        text: result.error ?? (result.ok ? "Added — it is live on the site now." : "Could not save."),
      });
      setFieldErrors(result.fieldErrors ?? {});

      if (result.ok) {
        // Reset the form so a second quote can be added straight away.
        setRating(5);
        const form = document.getElementById("testimonial-form") as HTMLFormElement | null;
        form?.reset();
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-ink-100 transition-colors duration-300 hover:border-cdagreen/40 hover:bg-white/5"
      >
        <Plus className="h-4 w-4" />
        Add a testimonial yourself
      </button>
    );
  }

  return (
    <form
      id="testimonial-form"
      action={submit}
      className="glass space-y-5 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink-50">
          New testimonial
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-400 transition-colors duration-300 hover:text-ink-100"
        >
          Close
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="t-name" className={label}>Name</label>
          <input id="t-name" name="name" required className={input} />
          {fieldErrors.name && (
            <p className="mt-1.5 text-xs text-cdared">{fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="t-company" className={label}>Company</label>
          <input id="t-company" name="company" className={input} />
        </div>

        <div>
          <label htmlFor="t-role" className={label}>Role</label>
          <input id="t-role" name="role" placeholder="Gérante" className={input} />
        </div>

        <div>
          <label htmlFor="t-locale" className={label}>Language</label>
          <select id="t-locale" name="locale" defaultValue="fr" className={input}>
            <option value="fr" className="bg-ink-900">Français</option>
            <option value="en" className="bg-ink-900">English</option>
          </select>
        </div>
      </div>

      {/* Star rating */}
      <fieldset>
        <legend className={label}>Rating</legend>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-pressed={rating === value}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              className="rounded p-0.5 transition-transform duration-200 hover:scale-110"
            >
              <Star
                aria-hidden
                className={cn(
                  "h-6 w-6",
                  value <= rating ? "fill-cdayellow text-cdayellow" : "text-ink-600",
                )}
              />
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="t-quote" className={label}>Quote</label>
        <textarea
          id="t-quote"
          name="quote"
          rows={4}
          required
          placeholder="Their words, not yours. The whole point is that it sounds like them."
          className={cn(input, "resize-y")}
        />
        {fieldErrors.quote && (
          <p className="mt-1.5 text-xs text-cdared">{fieldErrors.quote[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="t-website" className={label}>Website (optional)</label>
        <input
          id="t-website"
          name="website"
          type="url"
          placeholder="https://"
          className={input}
        />
        {fieldErrors.website && (
          <p className="mt-1.5 text-xs text-cdared">{fieldErrors.website[0]}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {message ? (
          <p role="status" className={cn("text-sm", message.ok ? "text-cdagreen-bright" : "text-cdared")}>
            {message.ok && <Check className="mr-1.5 inline h-4 w-4" />}
            {message.text}
          </p>
        ) : (
          <p className="text-xs text-ink-500">
            Published immediately — you are vouching for this one.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-cdagreen px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-cdagreen-bright disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Add testimonial
        </button>
      </div>
    </form>
  );
}