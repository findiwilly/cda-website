import { SITE } from "@/lib/constants";
import { toLocale } from "@/lib/content";
import type { Locale2 } from "@/lib/content-schema";

/**
 * Branded HTML + plain-text email templates.
 *
 * Rendering is deliberately not React. `react-dom/server` in a mailer produces
 * markup full of comments, `class` attributes and no inlined styles, none of
 * which survive an email client. Outlook in particular ignores `<style>` in the
 * body and drops `flex` entirely, so this module is hand-written HTML built on
 * tables with every style inline — the combination that actually renders
 * identically in Outlook, Gmail, Apple Mail and mobile clients.
 *
 * Every template comes in both languages, French first, because a Cameroonian
 * agency receives both. `renderLeadReceived` picks its language from the
 * language the visitor wrote in, so someone who submitted the form in English
 * never receives a French confirmation.
 *
 * Two rules hold everywhere below:
 *   1. Anything a visitor typed is escaped with `escapeHtml` before it reaches
 *      the markup. A lead's `name` or `message` is untrusted input, and an
 *      unescaped `<` would let a visitor inject markup into the agency's own
 *      inbox — or break the table layout outright.
 *   2. Colour and copy come from the site palette in `tailwind.config.ts` and
 *      `src/messages/*.json`, never from values invented here, so the email
 *      looks like the site it came from.
 */

// ---------------------------------------------------------------------------
// Palette — mirrors tailwind.config.ts `colors`
// ---------------------------------------------------------------------------

const INK_950 = "#0A0A0B";
const INK_900 = "#101012";
const INK_700 = "#1F1F24";
const INK_400 = "#55555F";
const INK_300 = "#7C7C87";
const INK_100 = "#D6D6DC";
const INK_50 = "#F2F2F5";
const GREEN = "#007A5E";
const GREEN_BRIGHT = "#00A67E";
const YELLOW = "#FCD116";

/** Where a recipient can read the site. Used for CTA links. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.cameroondigitalagency.com";

// ---------------------------------------------------------------------------
// Escaping
// ---------------------------------------------------------------------------

/**
 * Escape a value for interpolation into HTML text or an attribute.
 *
 * Also strips control characters, which have no visual representation but do
 * survive into the rendered mail and can break Outlook's table parser. A lead
 * who pastes a form filled in a spreadsheet should get an email, not a broken
 * one.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/[--]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** `237650077812` -> `+237 6 50 07 78 12` */
export function formatCameroonPhone(digits: string): string {
  const local = digits.startsWith("237") ? digits.slice(3) : digits;
  if (local.length !== 9) return `+${digits}`;
  return `+237 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6)}`;
}

/** Soften a line break to two trailing spaces, so plain-text clients wrap it. */
const textLine = (value: string) => `${value}\n`;

// ---------------------------------------------------------------------------
// Bilingual copy
// ---------------------------------------------------------------------------

type Copy = { fr: string; en: string };

/**
 * Pick a language, defaulting to French. `toLocale` normalises the loose
 * `string` that arrives from a form into the app's locale union.
 */
function pick(copy: Copy, locale: Locale2): string {
  return toLocale(locale) === "en" ? copy.en : copy.fr;
}

const STRINGS = {
  agency: { fr: SITE.name, en: SITE.name },
  leadSubject: {
    fr: (name: string) => `Nouvelle demande de ${name}`,
    en: (name: string) => `New enquiry from ${name}`,
  },
  testimonialSubject: {
    fr: (name: string) => `Nouveau témoignage à modérer — ${name}`,
    en: (name: string) => `New testimonial to review — ${name}`,
  },
  confirmationSubject: {
    fr: "Bien reçu — Cameroon Digital Agency",
    en: "Got it — Cameroon Digital Agency",
  },
  replySubject: { fr: "Votre message chez Cameroon Digital Agency", en: "Your message at Cameroon Digital Agency" },
  thanksReceived: { fr: "Merci, c'est bien reçu.", en: "Thank you — we have it." },
  newLeadKicker: { fr: "Nouvelle demande", en: "New enquiry" },
  newTestimonialKicker: { fr: "À modérer", en: "To review" },
  receivedKicker: { fr: "Message reçu", en: "Message received" },
  replyKicker: { fr: "Cameroon Digital Agency répond", en: "Cameroon Digital Agency replies" },
  whatNext: {
    fr: "Ce qui se passe maintenant",
    en: "What happens next",
  },
  whatNextBody: {
    fr: "Nous lisons votre message et nous répondons sur WhatsApp ou par e-mail, généralement dans la journée. Si c'est urgent, appelez-nous directement.",
    en: "We are reading your message and will reply on WhatsApp or by email, usually the same day. If it is urgent, call us directly.",
  },
  whatNextBodyIncoming: {
    fr: "Cette demande vient d'arriver dans notre boîte de réception. Vous n'avez rien à faire d'autre.",
    en: "This enquiry has just landed in our inbox. There is nothing else for you to do.",
  },
  reviewKicker: { fr: "Modération", en: "Moderation" },
  reviewBody: {
    fr: "Un témoignage a été déposé et n'apparaît pas encore sur le site. Il ne sera visible qu'après votre validation.",
    en: "A testimonial was submitted and is not live on the site yet. It will only appear once you approve it.",
  },
  quoteLabel: { fr: "Témoignage", en: "Testimonial" },
  ratingLabel: { fr: "Note", en: "Rating" },
  fieldName: { fr: "Nom", en: "Name" },
  fieldBusiness: { fr: "Entreprise", en: "Business" },
  fieldNiche: { fr: "Secteur", en: "Sector" },
  fieldWhatsapp: { fr: "WhatsApp", en: "WhatsApp" },
  fieldEmail: { fr: "E-mail", en: "Email" },
  fieldMessage: { fr: "Message", en: "Message" },
  fieldCompany: { fr: "Société", en: "Company" },
  fieldReceived: { fr: "Reçu le", en: "Received on" },
  fieldWrittenIn: { fr: "Langue de la demande", en: "Written in" },
  replyFrom: { fr: "de la part de", en: "from" },
  openSite: { fr: "Ouvrir le site", en: "Open the site" },
  bookSession: { fr: "Réserver un créneau", en: "Book a slot" },
  footerRights: { fr: "Tous droits réservés.", en: "All rights reserved." },
  footerWhy: {
    fr: "Vous recevez ce message parce que vous avezcontacté Cameroon Digital Agency.",
    en: "You are receiving this message because you contacted Cameroon Digital Agency.",
  },
  footerWhyIncoming: {
    fr: "Ce message est interne. Ne le transférez pas.",
    en: "This message is internal. Please do not forward it.",
  },
  whatsAppCta: { fr: "Écrire sur WhatsApp", en: "Message us on WhatsApp" },
} as const satisfies Record<string, unknown>;

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------

/**
 * A preheader: the line an inbox shows next to the subject, hidden in the
 * body. Without it clients pull the first visible text — often a stray "CDA".
 */
function preheader(text: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(
    text,
  )}</div>`;
}

function shell(options: {
  lang: "fr" | "en";
  preheaderText: string;
  kicker: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  note?: string;
  footerNote: string;
}): string {
  const cta = options.cta
    ? `
      <tr>
        <td style="padding:8px 32px 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td
                bgcolor="${GREEN}"
                style="border-radius:6px;padding:13px 26px;font-size:14px;font-weight:600;color:#FFFFFF;"
              >
                <a href="${escapeHtml(options.cta.href)}" style="color:#FFFFFF;text-decoration:none;display:inline-block;">${escapeHtml(
                  options.cta.label,
                )}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const note = options.note
    ? `<tr><td style="padding:24px 32px 0;">
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:2px solid ${GREEN};" bgcolor="${INK_700}">
           <tr><td style="padding:14px 18px;">
             <p style="margin:0 0 6px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${GREEN_BRIGHT};">${escapeHtml(
               STRINGS.whatNext[options.lang],
             )}</p>
             <p style="margin:0;font-size:13px;line-height:1.65;color:${INK_100};">${escapeHtml(options.note)}</p>
           </td></tr>
         </table>
       </td></tr>`
    : "";

  return `<!doctype html>
<html lang="${options.lang}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(options.heading)}</title>
  <style>
    /* Outlook ignores <style> in the body; this only tunes the mobile clients
       that honour it. Everything structural is already inline. */
    @media only screen and (max-width:600px) {
      .cda-cell { padding-left:20px !important; padding-right:20px !important; }
      .cda-heading { font-size:20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${INK_950};">
${preheader(options.preheaderText)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${INK_950}" style="background:${INK_950};">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${INK_900};border-radius:10px;overflow:hidden;">

        <!-- Cameroon flag hairline: the one loud brand moment -->
        <tr>
          <td style="height:3px;line-height:3px;font-size:0;background:linear-gradient(90deg,${GREEN} 0%,${YELLOW} 55%,#CE1126 100%);">&nbsp;</td>
        </tr>

        <!-- Masthead -->
        <tr>
          <td class="cda-cell" style="padding:26px 32px 6px;">
            <p style="margin:0;font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:${GREEN_BRIGHT};font-weight:600;">${escapeHtml(
              STRINGS.agency[options.lang],
            )}</p>
          </td>
        </tr>
        <tr>
          <td class="cda-cell" style="padding:8px 32px 0;">
            <p style="margin:0;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${INK_300};">${escapeHtml(
              options.kicker,
            )}</p>
            <h1 class="cda-heading" style="margin:10px 0 0;font-size:24px;line-height:1.25;font-weight:700;color:${INK_50};">${escapeHtml(
              options.heading,
            )}</h1>
          </td>
        </tr>

        ${options.bodyHtml}
        ${note}
        ${cta}

        <!-- Footer -->
        <tr>
          <td class="cda-cell" style="padding:28px 32px 30px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top:1px solid ${INK_700};padding-top:18px;">
                  <p style="margin:0 0 6px;font-size:12px;color:${INK_300};">${escapeHtml(options.footerNote)}</p>
                  <p style="margin:0;font-size:12px;line-height:1.7;color:${INK_400};">
                    ${escapeHtml(SITE.name)} &middot; ${escapeHtml(SITE.city)}, Cameroun &middot; ${escapeHtml(
                      SITE.whatsappNumber,
                    )}
                    <br />&copy; ${new Date().getFullYear()} ${escapeHtml(STRINGS.footerRights[options.lang])}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * A label/value table row. `value` is escaped here, so callers pass raw text
 * and never have to remember.
 */
function field(label: string, value: string | undefined | null, lang: "fr" | "en"): string {
  if (!value) return "";
  return `<tr>
  <td style="padding:11px 0;border-bottom:1px solid ${INK_700};width:38%;vertical-align:top;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${INK_300};">${escapeHtml(
    label,
  )}</td>
  <td style="padding:11px 0;border-bottom:1px solid ${INK_700};vertical-align:top;font-size:14px;line-height:1.6;color:${INK_50};">${escapeHtml(
    value,
  )}</td>
</tr>`;
}

/** A block of visitor prose (a message, a quote) set off from the fields. */
function block(heading: string, value: string, lang: "fr" | "en"): string {
  return `<tr><td class="cda-cell" style="padding:20px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${INK_700}" style="border-radius:8px;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${GREEN_BRIGHT};">${escapeHtml(
        heading,
      )}</p>
      <p style="margin:0;font-size:15px;line-height:1.7;color:${INK_50};">${escapeHtml(value)}</p>
    </td></tr>
  </table>
</td></tr>`;
}

/** The plain-text fallback. Whitespace-collapsed, never empty. */
function textShell(options: {
  heading: string;
  lines: string[];
  cta?: { label: string; href: string };
  note?: string;
  footerNote: string;
}): string {
  return [
    options.heading,
    "",
    ...options.lines.filter((l) => l.length > 0),
    "",
    ...(options.note ? [options.note, ""] : []),
    ...(options.cta ? [`${options.cta.label}: ${options.cta.href}`, ""] : []),
    "—",
    options.footerNote,
    `${SITE.name} · ${SITE.city}, Cameroun · ${SITE.whatsappNumber}`,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export type LeadInput = {
  name: string;
  business?: string;
  niche?: string;
  whatsapp: string;
  email?: string;
  message?: string;
  locale?: string;
};

export type RenderedEmail = { subject: string; html: string; text: string };

/**
 * New lead → agency inbox.
 *
 * Rendered in the language the visitor wrote in, because the person reading it
 * is about to reply to that person and should not have to switch languages
 * mid-conversation.
 */
export function renderLeadReceived(lead: LeadInput): RenderedEmail {
  const locale = toLocale(lead.locale ?? "fr");
  const lang = locale === "en" ? "en" : "fr";
  const phone = formatCameroonPhone(lead.whatsapp);
  const name = lead.name;

  const subject = pick(
    {
      fr: STRINGS.leadSubject.fr(name),
      en: STRINGS.leadSubject.en(name),
    },
    locale,
  );

  const rows =
    field(STRINGS.fieldName[lang], name, lang) +
    field(STRINGS.fieldBusiness[lang], lead.business, lang) +
    field(STRINGS.fieldNiche[lang], lead.niche, lang) +
    field(STRINGS.fieldWhatsapp[lang], phone, lang) +
    field(STRINGS.fieldEmail[lang], lead.email, lang) +
    field(STRINGS.fieldWrittenIn[lang], lang === "en" ? "English" : "Français", lang);

  const html = shell({
    lang,
    preheaderText: `${name}${lead.business ? ` — ${lead.business}` : ""} · ${phone}`,
    kicker: STRINGS.newLeadKicker[lang],
    heading: name,
    bodyHtml: `<tr><td class="cda-cell" style="padding:20px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
</td></tr>` +
      (lead.message ? block(STRINGS.fieldMessage[lang], lead.message, lang) : ""),
    // Replying to this email reaches the visitor directly, which is the whole
    // point of a lead notification.
    note: STRINGS.whatNextBodyIncoming[lang],
    cta: lead.email
      ? {
          label: `↩ ${STRINGS.replyFrom[lang]} ${lead.email}`,
          href: `mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${subject}`)}`,
        }
      : {
          label: STRINGS.whatsAppCta[lang],
          href: `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`,
        },
    footerNote: STRINGS.footerWhyIncoming[lang],
  });

  const text = textShell({
    heading: `${STRINGS.newLeadKicker[lang]} — ${name}`,
    lines: [
      textLine(`${STRINGS.fieldName[lang]}: ${name}`),
      lead.business ? textLine(`${STRINGS.fieldBusiness[lang]}: ${lead.business}`) : "",
      lead.niche ? textLine(`${STRINGS.fieldNiche[lang]}: ${lead.niche}`) : "",
      textLine(`${STRINGS.fieldWhatsapp[lang]}: ${phone}`),
      lead.email ? textLine(`${STRINGS.fieldEmail[lang]}: ${lead.email}`) : "",
      lead.message ? `${STRINGS.fieldMessage[lang]}: ${lead.message}` : "",
    ],
    cta: lead.email
      ? {
          label: `↩ ${lead.email}`,
          href: `mailto:${lead.email}`,
        }
      : { label: STRINGS.whatsAppCta[lang], href: `https://wa.me/${lead.whatsapp.replace(/\D/g, "")}` },
    footerNote: STRINGS.footerWhyIncoming[lang],
  });

  return { subject, html, text };
}

/**
 * Visitor's own confirmation, sent when their enquiry is persisted.
 *
 * This is the mail that has to prove the site works: a lead who gets silence
 * after submitting a form assumes it was lost. It deliberately promises nothing
 * about response time beyond "we read every message".
 */
export function renderLeadConfirmation(lead: LeadInput): RenderedEmail {
  const locale = toLocale(lead.locale ?? "fr");
  const lang = locale === "en" ? "en" : "fr";
  const phone = formatCameroonPhone(lead.whatsapp);

  const html = shell({
    lang,
    preheaderText: pick(STRINGS.whatNextBody, locale),
    kicker: STRINGS.receivedKicker[lang],
    heading: pick(STRINGS.thanksReceived, locale),
    bodyHtml: `<tr><td class="cda-cell" style="padding:20px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${field(STRINGS.fieldName[lang], lead.name, lang)}
    ${field(STRINGS.fieldWhatsapp[lang], phone, lang)}
    ${field(STRINGS.fieldEmail[lang], lead.email, lang)}
  </table>
</td></tr>` +
      (lead.message
        ? block(
            lang === "en" ? "What you wrote" : "Ce que vous avez écrit",
            lead.message,
            lang,
          )
        : ""),
    note: pick(STRINGS.whatNextBody, locale),
    cta: { label: STRINGS.bookSession[lang], href: SITE.calcomUrl },
    footerNote: pick(STRINGS.footerWhy, locale),
  });

  const text = textShell({
    heading: pick(STRINGS.thanksReceived, locale),
    lines: [
      textLine(`${STRINGS.fieldName[lang]}: ${lead.name}`),
      textLine(`${STRINGS.fieldWhatsapp[lang]}: ${phone}`),
      lead.email ? textLine(`${STRINGS.fieldEmail[lang]}: ${lead.email}`) : "",
    ],
    note: pick(STRINGS.whatNextBody, locale),
    cta: { label: STRINGS.bookSession[lang], href: SITE.calcomUrl },
    footerNote: pick(STRINGS.footerWhy, locale),
  });

  return { subject: pick(STRINGS.confirmationSubject, locale), html, text };
}

/** Admin's reply → the visitor. Sent from the dashboard chat box. */
export function renderAdminReply(options: {
  toName: string;
  body: string;
  locale?: string;
  threadSubject?: string;
}): RenderedEmail {
  const locale = toLocale(options.locale ?? "fr");
  const lang = locale === "en" ? "en" : "fr";

  // A short greeting reads as a person; "Dear Sir/Madam" reads as a form.
  const greeting =
    lang === "en"
      ? `Hi ${options.toName.split(" ")[0]},`
      : `Bonjour ${options.toName.split(" ")[0]},`;

  const html = shell({
    lang,
    preheaderText: options.body.slice(0, 140),
    kicker: STRINGS.replyKicker[lang],
    heading: options.threadSubject ?? pick(STRINGS.replySubject, locale),
    bodyHtml: `<tr><td class="cda-cell" style="padding:20px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${INK_700}" style="border-radius:8px;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:${INK_50};">${escapeHtml(greeting)}</p>
      <p style="margin:0;font-size:15px;line-height:1.75;color:${INK_50};">${escapeHtml(options.body).replace(
        /\n/g,
        "<br />",
      )}</p>
    </td></tr>
  </table>
</td></tr>`,
    cta: { label: STRINGS.openSite[lang], href: SITE_URL },
    note: pick(STRINGS.whatNextBody, locale),
    footerNote: pick(STRINGS.footerWhy, locale),
  });

  const text = textShell({
    heading: options.threadSubject ?? pick(STRINGS.replySubject, locale),
    lines: [textLine(greeting), "", options.body],
    cta: { label: STRINGS.openSite[lang], href: SITE_URL },
    note: pick(STRINGS.whatNextBody, locale),
    footerNote: pick(STRINGS.footerWhy, locale),
  });

  return { subject: pick(STRINGS.replySubject, locale), html, text };
}

/** New testimonial → agency inbox, for moderation. */
export function renderTestimonialReceived(t: {
  name: string;
  role?: string;
  company?: string;
  quote: string;
  rating: number;
}): RenderedEmail {
  const lang = "fr";
  const company = [t.role, t.company].filter(Boolean).join(", ");

  const html = shell({
    lang,
    preheaderText: `${t.name} — ${t.rating}/5`,
    kicker: STRINGS.newTestimonialKicker[lang],
    heading: t.name,
    bodyHtml: `<tr><td class="cda-cell" style="padding:20px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${field(STRINGS.fieldName[lang], t.name, lang)}
    ${field(STRINGS.fieldCompany[lang], company, lang)}
    ${field(STRINGS.ratingLabel[lang], `${t.rating}/5`, lang)}
  </table>
</td></tr>` +
      block(STRINGS.quoteLabel[lang], t.quote, lang),
    note: STRINGS.reviewBody[lang],
    cta: { label: "Ouvrir la modération", href: `${SITE_URL}/admin/testimonials` },
    footerNote: STRINGS.footerWhyIncoming[lang],
  });

  const text = textShell({
    heading: `${STRINGS.newTestimonialKicker[lang]} — ${t.name}`,
    lines: [
      textLine(`${STRINGS.fieldName[lang]}: ${t.name}`),
      company ? textLine(`${STRINGS.fieldCompany[lang]}: ${company}`) : "",
      textLine(`${STRINGS.ratingLabel[lang]}: ${t.rating}/5`),
      "",
      `${STRINGS.quoteLabel[lang]}: ${t.quote}`,
    ],
    cta: { label: "Ouvrir la modération", href: `${SITE_URL}/admin/testimonials` },
    footerNote: STRINGS.footerWhyIncoming[lang],
  });

  return { subject: STRINGS.testimonialSubject.fr(t.name), html, text };
}

/** An internal audit note: what an admin did, to the admin's own inbox. */
export function renderAdminAction(action: string, detail: string): RenderedEmail {
  const lang = "fr";
  const html = shell({
    lang,
    preheaderText: detail.slice(0, 140),
    kicker: "Administration",
    heading: action,
    bodyHtml: `<tr><td class="cda-cell" style="padding:20px 32px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${field("Action", action, lang)}
    ${field("Détail", detail, lang)}
  </table>
</td></tr>`,
    cta: { label: "Ouvrir le tableau de bord", href: `${SITE_URL}/admin` },
    footerNote: STRINGS.footerWhyIncoming[lang],
  });

  const text = textShell({
    heading: `[CDA] ${action}`,
    lines: [detail],
    cta: { label: "Ouvrir le tableau de bord", href: `${SITE_URL}/admin` },
    footerNote: STRINGS.footerWhyIncoming[lang],
  });

  return { subject: `[CDA] ${action}`, html, text };
}
