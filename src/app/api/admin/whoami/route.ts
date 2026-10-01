import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/api";

/** Reads the session cookie, so it can never be statically generated. */
export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true, admin });
});
