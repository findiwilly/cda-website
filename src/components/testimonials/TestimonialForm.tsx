"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, Send } from "lucide-react";
import { fadeUp, scaleIn } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

/**
 * "Leave a testimonial" form.
 *
 * Submits to `/api/testimonials`, which stores everything as `pending`. The form
 * says so explicitly in its success state: telling someone "we'll review it"
 * sets the right expectation, and quietly publishing unvetted praise would be
 * both a legal and a credibility problem.
 *
 * Accessible by construction — every control has a real `<label>`, errors are
 * wired with `aria-describedby` + `aria-invalid`, and the error summary takes
 * focus on a failed submit so keyboard and screen-reader users are not left
 * guessing what happened.
 */

const fieldClasses =
  "w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-400 outline-none transition-colors duration-300 focus:border-cdagreen/60";

type Errors = Partial<Record<"name" | "role" | "company" | "quote" | "rating" | "website", string>>;

export function TestimonialForm() {
  const t = useTranslations("testimonials.form");
  const locale = useLocale();

  const [values, setValues] = useState({
    name: "",
    role: "",
    company: "",
    quote: "",
    rating: 5,
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const set =
    <K extends keyof typeof values>(key: K) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value =
        e.target instanceof HTMLInputElement && e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value;
      setValues((v) => ({ ...v, [key]: value as (typeof values)[K] }));
      // Clear a field's error as soon as the user edits it — leaving a red
      // border on a field someone has just fixed reads as "still wrong".
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    // Client-side pass mirrors the Zod rules in `content-schema.ts` so the user
    // gets an instant, per-field message. The server revalidates regardless —
    // this is convenience, not validation.
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = t("errors.name");
    if (values.quote.trim().length < 20) next.quote = t("errors.quote");
    if (values.rating < 1 || values.rating > 5) next.rating = t("errors.rating");
    if (values.website.trim() && !/^https?:\/\/.+\..+/.test(values.website.trim())) {
      next.website = t("errors.website");
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      // Move focus to the summary so the failure is announced, not just seen.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          role: values.role.trim() || undefined,
          company: values.company.trim() || undefined,
          quote: values.quote.trim(),
          rating: values.rating,
          website: values.website.trim(),
          locale,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
          fieldErrors?: Record<string, string[]>;
        } | null;

        // Surface server-side field errors on the matching inputs when we can
        // attribute them; otherwise fall back to a single message.
        if (payload?.fieldErrors) {
          const mapped: Errors = {};
          for (const key of ["name", "role", "company", "quote", "rating", "website"] as const) {
            const message = payload.fieldErrors[key]?.[0];
            if (message) mapped[key] = message;
          }
          if (Object.keys(mapped).length > 0) {
            setErrors(mapped);
            setStatus("idle");
            requestAnimationFrame(() => summaryRef.current?.focus());
            return;
          }
        }

        setFormError(payload?.message ?? t("genericError"));
        setStatus("idle");
        return;
      }

      setStatus("sent");
    } catch {
      setFormError(t("networkError"));
      setStatus("idle");
    }
  }

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-10">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={scaleIn}
            className="flex flex-col items-center py-10 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cdagreen/15 ring-1 ring-cdagreen/40">
              <Check className="h-8 w-8 text-cdagreen-bright" aria-hidden />
            </span>
            <p className="mt-6 font-display text-2xl font-bold text-ink-50">
              {t("success.title")}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-300">
              {t("success.body")}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeUp}
            onSubmit={submit}
            noValidate
            className="grid gap-5 sm:grid-cols-2"
          >
            {/* Error summary. Rendered always but empty when there is nothing to
                say, so it can hold focus without shifting the layout. */}
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className={cn("sm:col-span-2", !hasErrors(errors) && !formError && "sr-only")}
            >
              {hasErrors(errors) && (
                <div className="rounded-xl border border-cdared/40 bg-cdared/10 p-4">
                  <p className="text-sm font-medium text-cdared">{t("errorSummary")}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-200">
                    {Object.entries(errors).map(([key, message]) =>
                      message ? <li key={key}>{message}</li> : null,
                    )}
                  </ul>
                </div>
              )}
              {formError && !hasErrors(errors) && (
                <p className="rounded-xl border border-cdared/40 bg-cdared/10 p-4 text-sm text-cdared">
                  {formError}
                </p>
              )}
            </div>

            <Field
              id="testimonial-name"
              label={t("name")}
              error={errors.name}
              required
              requiredWord={t("required")}
            >
              <input
                id="testimonial-name"
                name="name"
                value={values.name}
                onChange={set("name")}
                autoComplete="name"
                className={cn(fieldClasses, errors.name && "border-cdared/60")}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "testimonial-name-error" : undefined}
              />
            </Field>

            <Field id="testimonial-company" label={t("company")} error={errors.company}>
              <input
                id="testimonial-company"
                name="company"
                value={values.company}
                onChange={set("company")}
                autoComplete="organization"
                className={fieldClasses}
              />
            </Field>

            <Field
              id="testimonial-role"
              label={t("role")}
              error={errors.role}
              className="sm:col-span-2"
            >
              <input
                id="testimonial-role"
                name="role"
                value={values.role}
                onChange={set("role")}
                autoComplete="organization-title"
                className={fieldClasses}
              />
            </Field>

            <fieldset className="sm:col-span-2">
              <legend className="text-xs uppercase tracking-[0.2em] text-ink-400">
                {t("rating")}
              </legend>
              {/* Radio group rather than a number input: the scale is 1–5 and a
                  slider invites values the schema will reject. */}
              <div
                className="mt-3 flex items-center gap-2"
                role="radiogroup"
                aria-describedby={errors.rating ? "testimonial-rating-error" : undefined}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <label
                    key={value}
                    htmlFor={`testimonial-rating-${value}`}
                    className="cursor-pointer"
                  >
                    <input
                      id={`testimonial-rating-${value}`}
                      type="radio"
                      name="rating"
                      value={value}
                      checked={values.rating === value}
                      onChange={() =>
                        setValues((v) => ({ ...v, rating: value }))
                      }
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-lg text-ink-500 ring-1 ring-white/10 transition-colors duration-300 peer-checked:bg-cdagreen/15 peer-checked:text-cdayellow peer-checked:ring-cdagreen/50 peer-focus-visible:ring-2 peer-focus-visible:ring-cdagreen-bright hover:bg-white/5"
                    >
                      {value}
                    </span>
                    <span className="sr-only">
                      {t("ratingValue", { count: value })}
                    </span>
                  </label>
                ))}
              </div>
              {errors.rating && (
                <p
                  id="testimonial-rating-error"
                  className="mt-2 text-xs text-cdared"
                >
                  {errors.rating}
                </p>
              )}
            </fieldset>

            <Field
              id="testimonial-quote"
              label={t("quote")}
              error={errors.quote}
              hint={t("quoteHint")}
              required
              requiredWord={t("required")}
              className="sm:col-span-2"
            >
              <textarea
                id="testimonial-quote"
                name="quote"
                value={values.quote}
                onChange={set("quote")}
                rows={5}
                maxLength={900}
                required
                aria-invalid={!!errors.quote}
                aria-describedby={cx(
                  "testimonial-quote-hint",
                  errors.quote && "testimonial-quote-error",
                )}
                className={cn(
                  fieldClasses,
                  "resize-y",
                  errors.quote && "border-cdared/60",
                )}
              />
            </Field>

            <Field
              id="testimonial-website"
              label={t("website")}
              error={errors.website}
              hint={t("websiteHint")}
              className="sm:col-span-2"
            >
              <input
                id="testimonial-website"
                name="website"
                type="url"
                inputMode="url"
                value={values.website}
                onChange={set("website")}
                placeholder="https://"
                className={cn(fieldClasses, errors.website && "border-cdared/60")}
                aria-invalid={!!errors.website}
                aria-describedby={cx(
                  "testimonial-website-hint",
                  errors.website && "testimonial-website-error",
                )}
              />
            </Field>

            <button
              type="submit"
              disabled={status === "sending"}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-cdagreen px-7 py-4 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden />
              {status === "sending" ? t("sending") : t("submit")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function hasErrors(errors: Errors) {
  return Object.values(errors).some(Boolean);
}

/** `aria-describedby` takes a space-separated id list, or nothing at all. */
function cx(...values: (string | false | undefined)[]): string | undefined {
  const ids = values.filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

/**
 * Label + control + hint/error, with the ARIA wiring done once.
 *
 * The hint is always referenced (not only on error), so a screen-reader user
 * hears the expected format before typing rather than after failing.
 */
function Field({
  id,
  label,
  hint,
  error,
  required,
  requiredWord,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Localised word for "required", announced after the label. */
  requiredWord?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs uppercase tracking-[0.2em] text-ink-400">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-cdagreen-bright">
            *
          </span>
        )}
        {required && requiredWord && <span className="sr-only"> ({requiredWord})</span>}
      </label>

      <div className="mt-2">{children}</div>

      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-cdared">
          {error}
        </p>
      )}
    </div>
  );
}