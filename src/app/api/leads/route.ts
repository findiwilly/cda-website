import { NextResponse, type NextRequest } from "next/server";
import { leadSchema } from "@/lib/content-schema";
import { hasMongo } from "@/lib/env";
import { createLead } from "@/lib/content";
import { notifyNewLead } from "@/lib/mailer";
import { badRequest, jsonError, tooManyRequests, withErrorHandling } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Public contact form submission.
 *
 * The lead is written to Mongo *before* the email is attempted, so a mail
 * outage can never lose an enquiry. WhatsApp delivery stays the client-side
 * jump the visitor triggers; this endpoint is the durable record and the email.
 */

const leadLimit = { scope: "lead", max: 5 };

export const POST = withErrorHandling(async (request: NextRequest) => {
  const limit = checkRateLimit(request, leadLimit.scope, leadLimit.max);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request body.");
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Please check the highlighted fields.", 400, {
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  if (hasMongo) {
    await createLead(parsed.data);
  } else {
    // No database: log rather than silently drop the enquiry.
    console.warn("[cda] lead received with no database configured:", parsed.data);
  }

  // Email is best-effort and never blocks the response.
  await notifyNewLead(parsed.data);

  return NextResponse.json({ ok: true });
});
