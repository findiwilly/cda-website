import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { hasMongo } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin login — Cameroon Digital Agency",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (!hasMongo) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <div className="glass max-w-md rounded-2xl p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink-50">
            Admin not configured
          </h1>
          <p className="mt-3 leading-relaxed text-ink-300">
            MONGODB_URI is missing from the environment. Set credentials in
            `.env.local` or Vercel before using the admin panel.
          </p>
        </div>
      </main>
    );
  }

  const admin = await getAdminUser();
  if (admin) redirect("/admin");

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cdagreen/12 blur-[140px]"
      />

      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 sm:p-10">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright">
            Admin
          </p>
          <h1 className="mt-5 font-display text-display-sm font-semibold text-ink-50">
            Sign in to your dashboard
          </h1>
          <p className="mt-3 text-sm text-ink-300">
            Only authorised administrators can access this area.
          </p>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          Cameroon Digital Agency · Admin panel
        </p>
      </div>
    </main>
  );
}
