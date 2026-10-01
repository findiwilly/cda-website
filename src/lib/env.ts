import "server-only";

/**
 * Server environment access.
 *
 * Rules this module exists to enforce:
 *  1. Nothing reads `process.env` directly outside this file.
 *  2. Nothing throws at import time. A build without credentials must still
 *     succeed — the public site degrades gracefully to static content instead of
 *     500-ing. Credential *validity* is only fatal at the point of use.
 *  3. Secrets are never exported to the client. Only keys prefixed
 *     `NEXT_PUBLIC_` may cross that boundary, and nothing here does.
 */

export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, ""),

  mongodbUri: process.env.MONGODB_URI,
  mongodbDb: process.env.MONGODB_DB ?? "cda",

  sessionSecret: process.env.SESSION_SECRET,

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM ?? "Cameroon Digital Agency <no-reply@cameroondigitalagency.com>",
    notify: process.env.SMTP_NOTIFY_TO,
  },

  adminEmail: process.env.ADMIN_EMAIL,
} as const;

/** True when a value is present and non-blank. */
function present(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Mongo is optional: without it the public site serves its static content. */
export const hasMongo = present(env.mongodbUri);

/** Cloudinary is optional: without it, admin uploads are refused but everything else works. */
export const hasCloudinary =
  present(env.cloudinary.cloudName) &&
  present(env.cloudinary.apiKey) &&
  present(env.cloudinary.apiSecret);

/** SMTP is optional: without it, notifications are logged instead of sent. */
export const hasSmtp =
  present(env.smtp.host) && present(env.smtp.user) && present(env.smtp.password);

/**
 * Throws only when the feature is actually reached without credentials. Used at
 * the top of admin routes so failures are legible in logs.
 */
export function requireEnv(
  ok: boolean,
  names: string,
  feature: string,
): asserts ok {
  if (!ok) {
    throw new Error(
      `[cda] ${feature} is not configured. Missing environment: ${names}. ` +
        `See docs/00-environment.md.`,
    );
  }
}

/**
 * Canonical absolute URL for metadata, sitemap and OG images. Falls back to the
 * Vercel-provided host so previews and production both generate correct URLs.
 */
export function siteUrl(): string {
  if (env.siteUrl) return env.siteUrl;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
