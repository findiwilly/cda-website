import { NextResponse, type NextRequest } from "next/server";
import { authenticate, setSessionCookie } from "@/lib/auth";
import { hasMongo } from "@/lib/env";
import { notifyAdminAction } from "@/lib/mailer";
import { badRequest, notConfigured, tooManyRequests, withErrorHandling } from "@/lib/api";
import { checkRateLimit, clientKey, reset } from "@/lib/rate-limit";
import { z } from "zod";

/**
 * Admin session: login and logout.
 *
 * Rate limited to 10 attempts per hour per IP. bcrypt cost is deliberately high
 * (12 rounds), so without a limit this endpoint is a viable CPU-exhaustion
 * vector — the exact reason the limiter exists rather than being "added later".
 */

const credentials = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  if (!hasMongo) {
    return notConfigured("Admin login", ["MONGODB_URI"]);
  }

  const limit = checkRateLimit(request, "admin-login", 10);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request body.");
  }

  const parsed = credentials.safeParse(body);
  if (!parsed.success) {
    return badRequest("Enter a valid email address and password.");
  }

  const session = await authenticate(parsed.data.email, parsed.data.password);
  if (!session) {
    // Deliberately vague: never reveal whether the email exists.
    return badRequest("Incorrect email or password.", { code: "INVALID_CREDENTIALS" });
  }

  await setSessionCookie(session);
  // A successful login clears the bucket so a legitimate user who mistyped
  // their password a few times isn't locked out afterwards.
  reset(clientKey(request, "admin-login"));

  await notifyAdminAction("Admin sign-in", `${session.email} signed in.`);

  return NextResponse.json({ ok: true });
});

/** Clears the session cookie. Safe to call repeatedly. */
export const DELETE = withErrorHandling(async () => {
  const { clearSessionCookie } = await import("@/lib/auth");
  clearSessionCookie();
  return NextResponse.json({ ok: true });
});
