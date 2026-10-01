import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { createUploadSignature } from "@/lib/cloudinary";
import { hasCloudinary } from "@/lib/env";
import { badRequest, notConfigured, withErrorHandling } from "@/lib/api";

/**
 * Issues a Cloudinary upload signature.
 *
 * The admin client POSTs the file straight to Cloudinary's CDN with this
 * signature, so image bytes never pass through a Server Action. That matters:
 * platform request-body limits are small, and a phone photo is large. The API
 * secret stays server-side — the browser only ever receives a short-lived,
 * folder-scoped signature.
 */

const FOLDERS = new Set(["cda/posts", "cda/testimonials"]);

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireAdminApi();

  if (!hasCloudinary) {
    return notConfigured("Image uploads", [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ]);
  }

  let folder = "cda/posts";
  try {
    const body = (await request.json()) as { folder?: string };
    if (body.folder) folder = body.folder;
  } catch {
    // Body optional — default folder is fine.
  }

  // The signature is only ever issued for a known folder, so a compromised
  // admin session cannot use this endpoint to write anywhere else in the
  // Cloudinary account.
  if (!FOLDERS.has(folder)) {
    return badRequest("Unsupported upload folder.");
  }

  const signature = await createUploadSignature(folder);
  return NextResponse.json(signature);
});
