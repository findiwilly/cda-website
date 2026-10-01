import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import { env, hasSmtp } from "@/lib/env";
import { SITE } from "@/lib/constants";

/**
 * SMTP notifications.
 *
 * Three kinds of mail leave the site:
 *  - a lead landed (contact form) — goes to the agency inbox
 *  - a testimonial was submitted — goes to the agency inbox
 *  - an admin action (publish, approve, delete) — goes to the admin's own inbox
 *
 * If SMTP is unconfigured every send becomes a logged no-op. A broken mail
 * relay must never take down a lead form — the lead is already persisted to
 * Mongo by the time we mail about it.
 */

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!hasSmtp) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      // 465 is implicit TLS; everything else negotiates STARTTLS.
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.password },
      pool: true,
      maxConnections: 3,
    });
  }
  return transporter;
}

async function send(options: {
  to: string | undefined;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const mailer = getTransporter();

  // No SMTP, or no recipient configured: log so the lead is not silently lost.
  if (!mailer || !options.to) {
    console.info(
      `[cda:mail:noop] to=${options.to ?? "(unset)"} subject="${options.subject}"\n${options.text}`,
    );
    return false;
  }

  try {
    await mailer.sendMail({
      from: env.smtp.from,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error("[cda] SMTP send failed:", error);
    return false;
  }
}

/** Where agency notifications go. Falls back to the sending address. */
function inbox(): string | undefined {
  return env.smtp.notify ?? env.smtp.user;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const shell = (heading: string, bodyHtml: string) => `
<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#0A0A0B;color:#D6D6DC;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
      <p style="margin:0 0 24px;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#00A67E;">
        ${SITE.name}
      </p>
      <h1 style="margin:0 0 24px;font-size:22px;line-height:1.3;color:#F2F2F5;">${heading}</h1>
      ${bodyHtml}
      <hr style="margin:32px 0;border:0;border-top:1px solid #2A2A31;" />
      <p style="margin:0;font-size:12px;color:#7C7C87;">
        ${SITE.name} · ${SITE.city}, Cameroun · ${SITE.whatsappNumber}
      </p>
    </div>
  </body>
</html>`;

const row = (label: string, value: string) =>
  `<p style="margin:0 0 10px;font-size:14px;">
     <span style="color:#7C7C87;">${label}</span><br />
     <span style="color:#F2F2F5;">${escapeHtml(value) || "—"}</span>
   </p>`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCameroonPhone(digits: string): string {
  const local = digits.startsWith("237") ? digits.slice(3) : digits;
  if (local.length !== 9) return `+${digits}`;
  return `+237 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6)}`;
}

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export async function notifyNewLead(lead: {
  name: string;
  business?: string;
  niche?: string;
  whatsapp: string;
  email?: string;
  message?: string;
}): Promise<boolean> {
  const phone = formatCameroonPhone(lead.whatsapp);
  const text = [
    `Nouveau lead : ${lead.name}`,
    lead.business ? `Entreprise : ${lead.business}` : null,
    lead.niche ? `Secteur : ${lead.niche}` : null,
    `WhatsApp : ${phone}`,
    lead.email ? `E-mail : ${lead.email}` : null,
    lead.message ? `Message : ${lead.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return send({
    to: inbox(),
    subject: `Nouveau lead — ${lead.name}`,
    text,
    html: shell(
      "Nouveau lead",
      row("Nom", lead.name) +
        row("Entreprise", lead.business ?? "") +
        row("Secteur", lead.niche ?? "") +
        row("WhatsApp", phone) +
        row("E-mail", lead.email ?? "") +
        row("Message", lead.message ?? ""),
    ),
    replyTo: lead.email || undefined,
  });
}

export async function notifyNewTestimonial(testimonial: {
  name: string;
  role?: string;
  company?: string;
  quote: string;
  rating: number;
}): Promise<boolean> {
  const text = [
    `Nouveau témoignage à modérer`,
    `Nom : ${testimonial.name}`,
    `Société : ${[testimonial.role, testimonial.company].filter(Boolean).join(", ")}`,
    `Note : ${testimonial.rating}/5`,
    "",
    testimonial.quote,
  ].join("\n");

  return send({
    to: inbox(),
    subject: `Témoignage à modérer — ${testimonial.name}`,
    text,
    html: shell(
      "Témoignage à modérer",
      row("Nom", testimonial.name) +
        row("Société", [testimonial.role, testimonial.company].filter(Boolean).join(", ")) +
        row("Note", `${testimonial.rating}/5`) +
        `<blockquote style="margin:16px 0;padding:12px 16px;border-left:2px solid #007A5E;color:#D6D6DC;font-style:italic;">${escapeHtml(testimonial.quote)}</blockquote>`,
    ),
  });
}

export async function notifyAdminAction(action: string, detail: string): Promise<boolean> {
  return send({
    to: env.adminEmail ?? inbox(),
    subject: `[CDA] ${action}`,
    text: `${action}\n\n${detail}`,
    html: shell(
      escapeHtml(action),
      `<p style="margin:0;font-size:14px;line-height:1.7;color:#D6D6DC;">${escapeHtml(detail).replace(/\n/g, "<br />")}</p>`,
    ),
  });
}
