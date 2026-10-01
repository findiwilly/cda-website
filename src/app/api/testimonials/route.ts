import { NextResponse, type NextRequest } from "next/server";
import { testimonialSchema } from "@/lib/content-schema";
import { hasMongo } from "@/lib/env";
import { createTestimonial } from "@/lib/content";
import { notifyNewTestimonial } from "@/lib/mailer";
import { badRequest, jsonError, tooManyRequests, withErrorHandling } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Public testimonial submission.
 *
 **Submissions always land as `pending`** — never published directly, whatever
 * the client sends. Publishing is an admin decision made at
 * `/admin/testimonials`. This is the one endpoint where a client-supplied
 * `status` field would be a security bug rather than a bug, so it is ignored.
 */

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Generous enough for a genuine client retry, tight enough to stop bulk spam.
  const limit = checkRateLimit(request, "testimonial", 3);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request body.");
  }

  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Please check the highlighted fields.", 400, {
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  // Zod strips unknown keys, so a client-sent `status` simply never reaches this
// point. `pending` below is the only value a public submission can ever get.
const submission = parsed.data;

  if (hasMongo) {
    await createTestimonial(submission, "pending", "form");
  } else {
    console.warn("[cda] testimonial received with no database configured:", submission);
  }

  await notifyNewTestimonial(submission);

  return NextResponse.json({
    ok: true,
    message: "Thank you — your testimonial is awaiting review.",
  });
});
