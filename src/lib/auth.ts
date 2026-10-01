import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { env } from "@/lib/env";
import { COLLECTIONS, collection } from "@/lib/mongo";

/**
 * Admin authentication.
 *
 * Design notes:
 *  - CDA has exactly one privileged role, so a session carries the admin id and
 *    an email snapshot rather than a permission table.
 *  - The cookie is httpOnly + sameSite=lax, so it is unreachable from
 *    JavaScript and is not sent on cross-site POSTs (CSRF mitigation).
 *  - `secure` is conditional so the same code runs on http://localhost.
 *  - Verification is deliberately cheap: a signature check plus one indexed
 *    lookup by ObjectId. No bcrypt on the request path — that would make every
 *    admin page render pay for a password hash.
 */

export const SESSION_COOKIE = "cda_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type AdminSession = {
  adminId: string;
  email: string;
};

export type AdminUser = {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string | null;
};

type AdminDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  lastLoginAt: Date | null;
};

function sessionSecret(): Uint8Array | null {
  const secret = env.sessionSecret;
  // Reject short secrets outright — a 32-byte minimum keeps HS256 meaningful.
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---------------------------------------------------------------------------
// Admins
// ---------------------------------------------------------------------------

export async function findAdminByEmail(email: string): Promise<AdminDoc | null> {
  const col = await collection<AdminDoc>(COLLECTIONS.admins);
  if (!col) return null;
  return col.findOne({ email: email.trim().toLowerCase() });
}

export async function createAdmin(input: {
  email: string;
  name: string;
  password: string;
}): Promise<AdminUser> {
  const col = await collection<AdminDoc>(COLLECTIONS.admins);
  if (!col) throw new Error("MongoDB is not configured.");
  const now = new Date();
  const doc: AdminDoc = {
    _id: new ObjectId(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    lastLoginAt: null,
  };
  await col.insertOne(doc);
  return {
    _id: doc._id.toHexString(),
    email: doc.email,
    name: doc.name,
    createdAt: now.toISOString(),
    lastLoginAt: null,
  };
}

/** Resolves credentials to an admin, or null. Always run before signing a session. */
export async function authenticate(
  email: string,
  password: string,
): Promise<AdminSession | null> {
  const admin = await findAdminByEmail(email);
  // Compare against a dummy hash when the account is missing so a wrong email
  // and a wrong password take the same amount of time.
  const hash = admin?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu";
  const ok = await verifyPassword(password, hash);
  if (!admin || !ok) return null;

  const col = await collection<AdminDoc>(COLLECTIONS.admins);
  await col?.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });

  return { adminId: admin._id.toHexString(), email: admin.email };
}

// ---------------------------------------------------------------------------
// Session token
// ---------------------------------------------------------------------------

export async function createSessionToken(session: AdminSession): Promise<string> {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET is not configured (needs 32+ characters).");

  return new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret);
}

export async function readSessionToken(token: string): Promise<AdminSession | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const adminId = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!adminId || !email) return null;
    return { adminId, email };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie plumbing
// ---------------------------------------------------------------------------

export async function setSessionCookie(session: AdminSession): Promise<void> {
  const token = await createSessionToken(session);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** Current session, or null. Does not throw when unconfigured. */
export async function getSession(): Promise<AdminSession | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

/**
 * Session plus a confirmation the admin still exists. Used by admin layouts, so
 * a revoked or deleted account cannot keep browsing on a still-valid token.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session) return null;

  const col = await collection<AdminDoc>(COLLECTIONS.admins);
  if (!col || !ObjectId.isValid(session.adminId)) return null;

  const doc = await col.findOne({ _id: new ObjectId(session.adminId) });
  if (!doc) return null;

  return {
    _id: doc._id.toHexString(),
    email: doc.email,
    name: doc.name,
    createdAt: doc.createdAt.toISOString(),
    lastLoginAt: doc.lastLoginAt ? doc.lastLoginAt.toISOString() : null,
  };
}

/** Any other admin action calls this first — it returns a 401 by redirecting. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) throw new UnauthorizedError();
  return admin;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthorizedError";
  }
}

/** Exported for the token decoder type in tests. */
export type { JWTPayload };
