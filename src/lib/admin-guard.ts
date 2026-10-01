import "server-only";

import { redirect } from "next/navigation";
import { getAdminUser, type AdminUser } from "@/lib/auth";

/**
 * Auth guards.
 *
 * Two shapes, because the two callers fail differently:
 *  - Pages redirect to the login screen.
 *  - Route handlers return a 401 JSON body, since a redirect is meaningless to
 *    a `fetch()` caller.
 *
 * Both read the session server-side. Hiding admin links in the UI is
 * convenience, never the security boundary.
 */

export const LOGIN_PATH = "/admin/login";

export class AuthError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "AuthError";
  }
}

/** Page guard. Redirects to login when there is no valid session. */
export async function requireAdminPage(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect(LOGIN_PATH);
  return admin;
}

/** API guard. Throws `AuthError` so route handlers can map it to a 401. */
export async function requireAdminApi(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) throw new AuthError();
  return admin;
}
