import "server-only";

/**
 * In-memory rate limiting for public form endpoints.
 *
 * Scope and trade-offs, stated plainly: this is a single-process map, so it
 * protects against casual abuse and duplicate submissions from one visitor. It
 * is *not* a distributed limiter — across several Vercel instances each gets its
 * own bucket. That is an acceptable trade for lead and testimonial forms: the
 * real protections are the Zod validation, the short session cookie, and SMTP
 * delivering new leads to a human who will notice spam. Swap for Upstash Redis
 * or Vercel KV if abuse ever becomes a problem.
 *
 * Memory is bounded by `MAX_KEYS`; the oldest keys are evicted first.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_KEYS = 5000;

const buckets = new Map<string, number[]>();

function prune(now: number) {
  if (buckets.size <= MAX_KEYS) return;
  for (const [key, hits] of buckets) {
    if (hits.every((t) => now - t > WINDOW_MS)) buckets.delete(key);
    if (buckets.size <= MAX_KEYS * 0.8) break;
  }
}

/** Best-effort client identity. Works without a proxy; trust x-forwarded-for only one hop. */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}

/**
 * Records a hit and reports whether the caller is over budget.
 * Returns true when the action should be **allowed**.
 */
export function allow(key: string, limit: number): boolean {
  const now = Date.now();
  prune(now);

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }

  hits.push(now);
  buckets.set(key, hits);
  return true;
}

/** Clear a bucket — called after a successful submission so a real user who
 *  submits twice (e.g. after a validation error) is not locked out. */
export function reset(key: string): void {
  buckets.delete(key);
}

/** `true` when the request may proceed. `retryAfter` is in seconds. */
export function checkRateLimit(
  request: Request,
  scope: string,
  limit: number,
): { ok: true } | { ok: false; retryAfter: number } {
  const key = clientKey(request, scope);
  if (allow(key, limit)) return { ok: true };
  return { ok: false, retryAfter: Math.ceil(WINDOW_MS / 1000) };
}
