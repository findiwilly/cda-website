import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env, hasCloudinary } from "@/lib/env";

/**
 * Cloudinary image storage.
 *
 * Uploads are signed server-side rather than shipping the API secret to the
 * browser: the admin client asks `/api/admin/upload` for a signature, then
 * posts the file straight to Cloudinary's CDN. The file never passes through
 * the Next.js server, which keeps serverless memory and function duration low.
 *
 * Every upload is transformed on the way in — auto-cropped, capped, re-encoded
 * to WebP/AVIF — so a 6MB phone photo can't become a 6MB page weight on a
 * 3G connection.
 */

let configured = false;

function client() {
  if (!hasCloudinary) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/** Longest edge for a full-bleed hero or blog cover. */
const MAX_EDGE = 2000;

export type UploadedImage = {
  publicId: string;
  width: number;
  height: number;
  url: string;
};

/** Signature payload the browser needs to POST directly to Cloudinary. */
export async function createUploadSignature(folder: string): Promise<{
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  transformation: string;
}> {
  const timestamp = Math.floor(Date.now() / 1000);
  const transformation = [
    `w_${MAX_EDGE}`,
    "c_limit",
    "q_auto",
    "f_auto",
    "dpr_auto",
  ].join(",");

  const secret = env.cloudinary.apiSecret;
  if (!secret) {
    throw new Error("CLOUDINARY_API_SECRET is not configured.");
  }

  const signature = client().utils.api_sign_request(
    { timestamp, folder, transformation },
    secret,
  );

  return {
    signature,
    timestamp,
    cloudName: env.cloudinary.cloudName as string,
    apiKey: env.cloudinary.apiKey as string,
    folder,
    transformation,
  };
}

/**
 * Server-side upload, used by the seed script and anywhere a file arrives via a
 * normal form submission rather than a direct browser → CDN POST.
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string,
): Promise<UploadedImage> {
  const response = (await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = client().uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: MAX_EDGE, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Cloudinary upload failed"));
        else resolve(result);
      },
    );
    stream.end(buffer);
  })) as UploadApiResponse;

  return {
    publicId: response.public_id,
    width: response.width,
    height: response.height,
    url: response.secure_url,
  };
}

/** Remove an asset. Missing assets are treated as success — deletion is idempotent. */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await client().uploader.destroy(publicId);
  } catch (error) {
    console.error(`[cda] failed to delete ${publicId}:`, error);
  }
}

/**
 * Build a delivery URL at a given width.
 *
 * `publicId` is stored rather than a fixed URL precisely so this can happen at
 * render time: the same uploaded image serves a 400px card and a 2000px hero
 * without re-uploading.
 */
export function imageUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: "auto" } = {},
): string {
  const transforms = [
    options.width ? `w_${options.width}` : null,
    options.height ? `h_${options.height},c_fill,g_auto` : null,
    `q_${options.quality ?? "auto"}`,
    "f_auto",
  ]
    .filter(Boolean)
    .join(",");

  return client().url(publicId, { transformation: transforms, secure: true });
}

/** Convenience wrapper for blog covers and testimonial avatars. */
export function coverUrl(publicId: string, width = 1600): string {
  return imageUrl(publicId, { width });
}
