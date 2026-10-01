/**
 * One-off: verify the configured credentials actually work, without writing.
 *
 * Read-only on purpose. This confirms connectivity, permissions and that the
 * collections can be reached — enough to know whether the seed will succeed —
 * without creating an admin account or any content in what may be a live
 * database. No mail is sent either: `transporter.verify()` completes the SMTP
 * handshake and authenticates, then discards the session.
 *
 * Loads `.env.local` directly rather than via dotenv: dotenv reads `.env`, and
 * adding a dependency for a throwaway diagnostic script is not worth it.
 */

import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";

/**
 * Minimal `.env` reader.
 *
 * Strips surrounding quotes, because the Gmail app password contains spaces
 * and *must* be quoted in the file. Reading it unquoted here would silently
 * truncate it to `jvqt` and report a bogus authentication failure.
 */
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  if (line.trimStart().startsWith("#")) continue;
  const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
  if (!match) continue;
  const raw = match[2];
  const quoted = /^"(.*)"$|^'(.*)'$/.exec(raw);
  process.env[match[1]] ??= quoted ? (quoted[1] ?? quoted[2]) : raw;
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "cda";
let failed = false;

function report(name, ok, detail, failDetail) {
  console.log(`${name.padEnd(11)}${ok ? "OK  " : "FAIL"} ${detail}`);
  if (!ok) {
    console.log(`${" ".repeat(11)}${failDetail}`);
    failed = true;
  }
}

// --- MongoDB ----------------------------------------------------------------
if (!uri) {
  console.error("mongodb   FAIL MONGODB_URI not set");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  const db = client.db(dbName);
  const info = await db.command({ ping: 1 });
  report("mongodb", info.ok === 1, `db="${dbName}"`);

  const admins = await db.collection("admins").find({}, { projection: { email: 1 } }).toArray();
  console.log(
    `${" ".repeat(11)}admins: ${admins.length}` +
      (admins.length ? ` (${admins.map((a) => a.email).join(", ")})` : "  <- seed required"),
  );

  for (const name of ["posts", "testimonials", "faqs", "leads"]) {
    console.log(`${" ".repeat(11)}${name}: ${await db.collection(name).countDocuments()} doc(s)`);
  }
} catch (error) {
  report("mongodb", false, "connection failed", String(error.message));
} finally {
  await client.close();
}

// --- Cloudinary -------------------------------------------------------------
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  report("cloudinary", false, "not configured", "set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET");
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  try {
    // `ping`, not `usage` — the usage API is restricted on free plans and
    // rejects with an error object carrying no `.message`, which looks exactly
    // like a credential failure when the credentials are in fact fine.
    const ping = await cloudinary.api.ping();
    report("cloudinary", ping.status === "ok", `cloud="${process.env.CLOUDINARY_CLOUD_NAME}"`);
  } catch (error) {
    report("cloudinary", false, "ping failed", String(error.message ?? JSON.stringify(error.error)));
  }
}

// --- SMTP -------------------------------------------------------------------
if (!process.env.SMTP_HOST) {
  report("smtp", false, "not configured", "lead and testimonial notifications will only be logged");
} else {
  const port = Number(process.env.SMTP_PORT ?? 587);
  const pass = process.env.SMTP_PASSWORD ?? "";
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass },
    });
    await transporter.verify();
    report("smtp", true, `${process.env.SMTP_HOST}:${port} as ${process.env.SMTP_USER}`);
  } catch (error) {
    // The quoted-value trap shows up here as a generic 535, so name it.
    const looksTruncated = !/\s/.test(pass) && pass.length < 16;
    report("smtp", false, `${process.env.SMTP_HOST}:${port}`, String(error.message ?? error));
    if (looksTruncated) {
      console.log(
        `${" ".repeat(11)}SMTP_PASSWORD is ${pass.length} chars with no spaces — if it should be a\n` +
          `${" ".repeat(11)}Google app password it was truncated: quote it in .env.local.`,
      );
    }
  }
}

// --- Session secret ---------------------------------------------------------
const secret = process.env.SESSION_SECRET ?? "";
report(
  "session",
  secret.length >= 32,
  `${secret.length} chars`,
  "needs 32+; generate with node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
);

process.exit(failed ? 1 : 0);