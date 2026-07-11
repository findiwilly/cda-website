"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, MessageCircle } from "lucide-react";
import { fadeUp, scaleIn } from "@/lib/motion-tokens";
import { INDUSTRY_SLUGS, SITE, type IndustrySlug } from "@/lib/constants";
import { cn, waLink } from "@/lib/utils";

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-400 outline-none transition-colors duration-300 focus:border-cdagreen/60";

/** Cameroonian mobile: 6XXXXXXXX, with or without +237 and separators */
function normalizeWhatsApp(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("237") ? digits.slice(3) : digits;
  if (/^6\d{8}$/.test(local)) return `237${local}`;
  return null;
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

  const set = (key: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.name.trim()) nextErrors.name = t("errors.name");
    const wa = normalizeWhatsApp(values.whatsapp);
    if (!wa) nextErrors.whatsapp = t("errors.whatsapp");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-10">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            className="flex flex-col items-center py-10 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cdagreen/15 ring-1 ring-cdagreen/40">
              <Check className="h-8 w-8 text-cdagreen-bright" />
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
              <MessageCircle className="h-4 w-4 text-cdagreen-bright" />
              {t("success.whatsapp")}
            </a>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            onSubmit={submit}
            noValidate
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <input
                value={values.name}
                onChange={set("name")}
                placeholder={t("name")}
                className={cn(inputClasses, errors.name && "border-cdared/60")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-cdared">{errors.name}</p>
              )}
            </div>
            <input
              value={values.business}
              onChange={set("business")}
              placeholder={t("business")}
              className={inputClasses}
            />
            <select
              value={values.niche}
              onChange={set("niche")}
              className={cn(inputClasses, !values.niche && "text-ink-400")}
              aria-label={t("niche")}
            >
              <option value="" disabled>
                {t("nichePlaceholder")}
              </option>
              {INDUSTRY_SLUGS.map((slug) => (
                <option key={slug} value={slug} className="bg-ink-900 text-ink-100">
                  {ind(`${slug}.name`)}
                </option>
              ))}
            </select>
            <div>
              <input
                value={values.whatsapp}
                onChange={set("whatsapp")}
                placeholder={t("whatsapp")}
                inputMode="tel"
                className={cn(inputClasses, errors.whatsapp && "border-cdared/60")}
                aria-invalid={!!errors.whatsapp}
              />
              <p
                className={cn(
                  "mt-1.5 text-xs",
                  errors.whatsapp ? "text-cdared" : "text-ink-400"
                )}
              >
                {errors.whatsapp ?? t("whatsappHint")}
              </p>
            </div>
            <input
              value={values.email}
              onChange={set("email")}
              placeholder={t("email")}
              type="email"
              className={cn(inputClasses, "sm:col-span-2")}
            />
            <textarea
              value={values.message}
              onChange={set("message")}
              placeholder={t("message")}
              rows={3}
              className={cn(inputClasses, "resize-none sm:col-span-2")}
            />
            <button
              type="submit"
              className="sm:col-span-2 mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-cdagreen px-7 py-4 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
            >
              <MessageCircle className="h-4 w-4" />
              {t("submit")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
