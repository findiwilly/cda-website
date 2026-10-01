import "server-only";

import { MongoClient, type Collection, type Db, type Document } from "mongodb";
import { env, hasMongo } from "@/lib/env";

/**
 * MongoDB connection.
 *
 * Next.js dev server reloads modules on every edit, and serverless functions
 * boot cold, so a client is cached on `globalThis` to avoid leaking connections
 * in both environments.
 */

const globalForMongo = globalThis as unknown as {
  __cdaMongo?: Promise<Db> | undefined;
};

async function connect(): Promise<Db> {
  const client = new MongoClient(env.mongodbUri as string, {
    // Fail fast rather than hanging a request for 30s when the network or the
    // credentials are wrong — the admin panel should show an error, not a spin.
    serverSelectionTimeoutMS: 8000,
  });
  await client.connect();
  return client.db(env.mongodbDb);
}

export async function getDb(): Promise<Db | null> {
  if (!hasMongo) return null;

  if (!globalForMongo.__cdaMongo) {
    globalForMongo.__cdaMongo = connect().catch((error) => {
      // Clear the cached rejection so the next request retries instead of
      // caching a failure forever.
      globalForMongo.__cdaMongo = undefined;
      throw error;
    });
  }

  try {
    return await globalForMongo.__cdaMongo;
  } catch (error) {
    console.error("[cda] MongoDB unavailable:", error);
    return null;
  }
}

/**
 * Typed collection accessor. Returns null when Mongo is unconfigured.
 *
 * `T` is constrained to the driver's `Document` shape, which requires an index
 * signature — that is what makes `Record<string, unknown>` the right choice for
 * the loosely typed documents callers actually store.
 */
export async function collection<T extends Document>(
  name: string,
): Promise<Collection<T> | null> {
  const db = await getDb();
  return db ? db.collection<T>(name) : null;
}

/** Collection names, centralised so typos surface in one place. */
export const COLLECTIONS = {
  posts: "posts",
  testimonials: "testimonials",
  faqs: "faqs",
  leads: "leads",
  admins: "admins",
} as const;
