"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { saveFaqAction } from "@/app/admin/actions";
import type { Faq } from "@/lib/content-schema";
import { cn } from "@/lib/utils";

/**
 * Create/edit form for one FAQ.
 *
 * Shared by the "add new" panel and by the inline editor on each row, so the two
 * can never drift apart in validation or wording.
 */

const input =
  "w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-400 outline-none transition-colors duration-300 focus:border-cdagreen/60";

const label = "mb-1.5 block text-xs uppercase tracking-[0.2em] text-ink-400";

export function FaqFields({
  id,
  defaults,
  submitLabel = "Add FAQ",
  onDone,
}: {
  id?: string;
  defaults?: Faq;
  submitLabel?: string;
  onDone?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const submit = (formData: FormData) => {
    if (id) formData.set("id", id);

    startTransition(async () => {
      const response = await saveFaqAction(formData);
      const ok = response.ok;
      setResult({
        ok,
        text: response.error ?? (ok ? "Saved — it is live on /faq now." : "Could not save."),
      });
      setFieldErrors(response.fieldErrors ?? {});

      // Close the inline editor on success; keep the create panel open so a
      // second question can be added without reopening it.
      if (ok && id) onDone?.();
    });
  };

  return (
    <form action={submit} className="space-y-5">
      {id && <input type="hidden" name="id" value={id} />}

      <div>
        <label htmlFor={`faq-question-${id ?? "new"}`} className={label}>
          Question
        </label>
        <input
          id={`faq-question-${id ?? "new"}`}
          name="question"
          required
          defaultValue={defaults?.question}
          placeholder="Combien coûte un site web ?"
          className={input}
        />
        {fieldErrors.question && (
          <p className="mt-1.5 text-xs text-cdared">{fieldErrors.question[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor={`faq-answer-${id ?? "new"}`} className={label}>
          Answer
        </label>
        <textarea
          id={`faq-answer-${id ?? "new"}`}
          name="answer"
          rows={4}
          required
          defaultValue={defaults?.answer}
          className={cn(input, "resize-y")}
        />
        {fieldErrors.answer && (
          <p className="mt-1.5 text-xs text-cdared">{fieldErrors.answer[0]}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor={`faq-category-${id ?? "new"}`} className={label}>
            Category
          </label>
          <input
            id={`faq-category-${id ?? "new"}`}
            name="category"
            required
            defaultValue={defaults?.category}
            placeholder="Tarifs"
            className={input}
          />
          {fieldErrors.category && (
            <p className="mt-1.5 text-xs text-cdared">{fieldErrors.category[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor={`faq-locale-${id ?? "new"}`} className={label}>
            Language
          </label>
          <select
            id={`faq-locale-${id ?? "new"}`}
            name="locale"
            defaultValue={defaults?.locale ?? "fr"}
            className={input}
          >
            <option value="fr" className="bg-ink-900">Français</option>
            <option value="en" className="bg-ink-900">English</option>
          </select>
        </div>

        <div>
          <label htmlFor={`faq-order-${id ?? "new"}`} className={label}>
            Order
          </label>
          <input
            id={`faq-order-${id ?? "new"}`}
            name="order"
            type="number"
            min={0}
            defaultValue={defaults?.order ?? 0}
            className={input}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-ink-200">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={defaults?.featured ?? false}
          className="h-4 w-4 rounded border-white/20 bg-ink-800 accent-cdagreen"
        />
        Pin to the top of the page
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {result ? (
          <p role="status" className={cn("text-sm", result.ok ? "text-cdagreen-bright" : "text-cdared")}>
            {result.ok && <Check className="mr-1.5 inline h-4 w-4" />}
            {result.text}
          </p>
        ) : (
          <p className="text-xs text-ink-500">
            Goes live as soon as you save — no redeploy needed.
          </p>
        )}

        <div className="flex items-center gap-2">
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm text-ink-300 transition-colors duration-300 hover:border-white/40 hover:text-ink-50"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-cdagreen px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:bg-cdagreen-bright disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}