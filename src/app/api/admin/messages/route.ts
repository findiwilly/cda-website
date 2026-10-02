import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { badRequest, jsonError, withErrorHandling } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { collection, COLLECTIONS } from "@/lib/mongo";
import { serialize } from "@/lib/content";
import { messageSchema } from "@/lib/message-schema";
import { addMessage, markThreadRead } from "@/lib/messages-store";
import { getAdminLead } from "@/lib/content";
import { sendAdminReply } from "@/lib/mailer";

export const GET = withErrorHandling(async () => {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const msgsCol = await collection(COLLECTIONS.messages);
  const leadsCol = await collection(COLLECTIONS.leads);
  if (!msgsCol || !leadsCol) return NextResponse.json({ threads: [] });

  const unread = await msgsCol
    .aggregate([
      { $match: { from: "visitor", read: false } },
      { $group: { _id: "$leadId" } },
    ])
    .toArray();

  const threads = await msgsCol
    .aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$leadId", last: { $first: "$$ROOT" } } },
      { $sort: { "last.createdAt": -1 } },
    ])
    .toArray();

  const out = [];
  for (const t of threads) {
    const leadId = String(t._id);
    const lead = await leadsCol.findOne({ _id: new (require("mongodb").ObjectId)(leadId) }).catch(() => null);
    const hasUnread = unread.some((u) => String(u._id) === leadId);
    out.push({
      leadId,
      last: serialize(t.last),
      hasUnread,
      lead: lead ? serialize(lead) : null,
    });
  }
  return NextResponse.json({ threads: out });
});

const replyLimit = { scope: "admin-reply", max: 20 };

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const limit = checkRateLimit(request, replyLimit.scope, replyLimit.max);
  if (!limit.ok) return jsonError("Too many requests", 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Malformed request body.");
  }

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Please check the highlighted fields.", 400, {
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  const lead = await getAdminLead(parsed.data.leadId);
  if (!lead) return jsonError("Lead not found", 404);

  const msg = await addMessage({
    ...parsed.data,
    toEmail: parsed.data.toEmail ?? lead.email ?? undefined,
  });
  if (!msg) return jsonError("Failed to save message", 500);

  if (lead.email) {
    await sendAdminReply({
      to: lead.email,
      toName: lead.name,
      body: msg.body,
      locale: msg.locale,
    }).catch(() => undefined);
  }

  await markThreadRead(parsed.data.leadId);

  return NextResponse.json({ ok: true, message: msg });
});
