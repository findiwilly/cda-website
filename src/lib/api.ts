import { NextResponse } from "next/server";
import { AuthError } from "@/lib/admin-guard";

/**
 * Shared API error mapping.
 *
 * Keeps two guarantees in one place: internal errors never leak stack traces
 * or driver messages to the browser, and every failure is logged server-side
 * with enough context to diagnose it.
 */

export function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** 400 — the client sent something invalid. */
export function badRequest(message = "Invalid request", extra?: Record<string, unknown>) {
  return jsonError(message, 400, extra);
}

/** 401 — no valid session. */
export function unauthorized(message = "Not authenticated") {
  return jsonError(message, 401);
}

/** 429 — rate limit hit. */
export function tooManyRequests(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

/** 503 — the feature is configured in code but credentials are absent. */
export function notConfigured(what: string, names: string[]) {
  return jsonError(`${what} is not configured on this deployment.`, 503, {
    missing: names,
  });
}

/**
 * Wrap a handler so thrown errors become clean responses. Unexpected errors are
 * logged in full and reported as a generic 500.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof AuthError) return unauthorized();

      console.error("[cda:api] unhandled error:", error);
      return jsonError("Something went wrong on our side.", 500);
    }
  };
}


