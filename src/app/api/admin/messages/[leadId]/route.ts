import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { jsonError, withErrorHandling } from "@/lib/api";
import { markThreadRead, listMessages } from "@/lib/messages-store";
import { getAdminLead } from "@/lib/content";

export const GET = withErrorHandling(async (_req: NextRequest, { params }: { params: { leadId: string } }) => {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);

  const lead = await getAdminLead(params.leadId);
  if (!lead) return jsonError("Lead not found", 404);

  await markThreadRead(params.leadId);
  const messages = await listMessages(params.leadId);

  return NextResponse.json({ lead, messages });
});
