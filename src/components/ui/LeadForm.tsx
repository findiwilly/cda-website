"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, MessageCircle } from "lucide-react";
import { fadeUp, scaleIn } from "@/lib/motion-tokens";
import { INDUSTRY_SLUGS, SITE, type IndustrySlug } from "@/lib/constants";
import { cn, waLink } from "@/lib/utils";

/**
 * Lead capture — the site's primary conversion form.
 *
 * Accessibility notes, since this used to rely on placeholders alone:
 *
 *  - Every control has a real `<label>` bound by `htmlFor`/`id`. A placeholder is
 *    *not* an accessible name: it disappears on focus and several screen readers
 *    skip it entirely, leaving the field announced as unlabelled.
 *  - Hints and errors are wired with `aria-describedby` and cleared from that
 *    list once resolved, so the announcement reflects current state.
 *  - A failed submit moves focus to an `role="alert"` summary rather than
 *    silently refusing.
 *  - Errors never rely on colour alone: they are text, next to the field.
 *
 * Submission opens WhatsApp with the lead's details prefilled. There is no server
 * round-trip here by design — for a Cameroonian SME audience the fastest,
 * lowest-friction channel is the one they already use. `/api/leads` exists for
 * the server-side path and is documented in `docs/C-lead-capture.md`.
 */

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-400 outline-none transition-colors duration-300 focus:border-cdagreen/60";

const labelClasses = "text-xs uppercase tracking-[0.2em] text-ink-400";

/** Cameroonian mobile: 6XXXXXXXX, with or without +237 and separators */
function normalizeWhatsApp(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("237") ? digits.slice(3) : digits;
  if (/^6\d{8}$/.test(local)) return `237${local}`;
  return null;
}

/** `aria-describedby` takes a space-separated id list, or nothing at all. */
function cx(...values: (string | false | undefined)[]): string | undefined {
  const ids = values.filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export function LeadForm({ defaultNiche }: { defaultNiche?: IndustrySlug }) {
  const t = useTranslations("contact.form");
  const ind = useTranslations("industries");
  const [values, setValues] = useState({
    name: "",
    business: "",
    niche: (defaultNiche ?? "") as string,
    whatsapp: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<{ name?: string; whatsapp?: string }>({});
  const [sent, setSent] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    // Drop the error for a field as soon as it is edited — a red border left on
    // something the visitor just fixed reads as "still wrong". Only `name` and
    // `whatsapp` are ever validated, hence the guard.
    setErrors((prev) =>
      key === "name" || key === "whatsapp"
        ? prev[key]
          ? { ...prev, [key]: undefined }
          : prev
        : prev
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.name.trim()) nextErrors.name = t("errors.name");
    const wa = normalizeWhatsApp(values.whatsapp);
    if (!wa) nextErrors.whatsapp = t("errors.whatsapp");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // Announce the failure instead of leaving focus in a field with no clue why.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    const nicheName = values.niche ? ind(`${values.niche}.name`) : "";
    const summary = [
      values.name.trim(),
      values.business.trim(),
      nicheName,
      values.email.trim(),
      values.message.trim(),
    ]
      .filter(Boolean)
      .join(" · ");

    // Deliver the lead straight into CDA's WhatsApp
    window.open(waLink(SITE.whatsappNumber, summary), "_blank", "noopener");
    setSent(true);
  };

  const waHref = waLink(SITE.whatsappNumber, values.name.trim());
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-10">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={scaleIn}
            className="flex flex-col items-center py-10 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cdagreen/15 ring-1 ring-cdagreen/40">
              <Check aria-hidden className="h-8 w-8 text-cdagreen-bright" />
            </span>
            <p className="mt-6 font-display text-2xl font-bold text-ink-50">
              {t("success.title")}
            </p>
            <p className="mt-3 max-w-sm text-sm text-ink-300">{t("success.body")}</p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-ink-100 transition-colors hover:border-white/40"
            >
              <MessageCircle aria-hidden className="h-4 w-4 text-cdagreen-bright" />
              {t("success.whatsapp")}
            </a>
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
            {/* Always mounted so it can hold focus without shifting the layout. */}
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              className={cn("sm:col-span-2", !hasErrors && "sr-only")}
            >
              {hasErrors && (
                <div className="rounded-xl border border-cdared/40 bg-cdared/10 p-4">
                  <p className="text-sm font-medium text-cdared">{t("errorSummary")}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-200">
                    {errors.name && <li>{errors.name}</li>}
                    {errors.whatsapp && <li>{errors.whatsapp}</li>}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="lead-name" className={labelClasses}>
                {t("name")}
                <span aria-hidden className="ml-1 text-cdagreen-bright">
                  *
                </span>
              </label>
              <input
                id="lead-name"
                name="name"
                value={values.name}
                onChange={set("name")}
                autoComplete="name"
                required
                className={cn("mt-2", inputClasses, errors.name && "border-cdared/60")}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "lead-name-error" : undefined}
              />
              {errors.name && (
                <p id="lead-name-error" className="mt-1.5 text-xs text-cdared">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lead-business" className={labelClasses}>
                {t("business")}
              </label>
              <input
                id="lead-business"
                name="business"
                value={values.business}
                onChange={set("business")}
                autoComplete="organization"
                className={cn("mt-2", inputClasses)}
              />
            </div>

            <div>
              <label htmlFor="lead-niche" className={labelClasses}>
                {t("niche")}
              </label>
              {/* `defaultNiche` is set on industry pages, so a value may already
                  be chosen — the first option is only disabled while empty. */}
              <select
                id="lead-niche"
                name="niche"
                value={values.niche}
                onChange={set("niche")}
                className={cn(
                  "mt-2",
                  inputClasses,
                  !values.niche && "text-ink-400"
                )}
              >
                <option value="" disabled={!defaultNiche}>
                  {t("nichePlaceholder")}
                </option>
                {INDUSTRY_SLUGS.map((slug) => (
                  <option key={slug} value={slug} className="bg-ink-900 text-ink-100">
                    {ind(`${slug}.name`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lead-whatsapp" className={labelClasses}>
                {t("whatsapp")}
                <span aria-hidden className="ml-1 text-cdagreen-bright">
                  *
                </span>
              </label>
              <input
                id="lead-whatsapp"
                name="whatsapp"
                value={values.whatsapp}
                onChange={set("whatsapp")}
                inputMode="tel"
                autoComplete="tel"
                required
                className={cn(
                  "mt-2",
                  inputClasses,
                  errors.whatsapp && "border-cdared/60"
                )}
                aria-invalid={!!errors.whatsapp}
                aria-describedby={cx(
                  "lead-whatsapp-hint",
                  errors.whatsapp && "lead-whatsapp-error"
                )}
              />
              {/* Hint is always in the describedby list, not only on error, so
                  the expected format is known before typing. */}
              {errors.whatsapp ? (
                <p id="lead-whatsapp-error" className="mt-1.5 text-xs text-cdared">
                  {errors.whatsapp}
                </p>
              ) : (
                <p id="lead-whatsapp-hint" className="mt-1.5 text-xs text-ink-400">
                  {t("whatsappHint")}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="lead-email" className={labelClasses}>
                {t("email")}
              </label>
              <input
                id="lead-email"
                name="email"
                type="email"
                value={values.email}
                onChange={set("email")}
                autoComplete="email"
                className={cn("mt-2", inputClasses)}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="lead-message" className={labelClasses}>
                {t("message")}
              </label>
              <textarea
                id="lead-message"
                name="message"
                value={values.message}
                onChange={set("message")}
                rows={3}
                maxLength={2000}
                className={cn("mt-2 resize-y", inputClasses)}
              />
            </div>

            <button
              type="submit"
              className="sm:col-span-2 mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-cdagreen px-7 py-4 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              {t("submit")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}