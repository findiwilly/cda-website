"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";

/**
 * Client form. Posts to `/api/admin/session` and navigates to `/admin` on
 * success. Errors are deliberately generic: never tell the caller whether the
 * email exists. That is the only a11y/security trade-off worth making here.
 */

const input =
  "w-full rounded-xl border border-white/10 bg-ink-800/80 px-4 py-3 text-sm text-ink-100 placeholder:text-ink-400 outline-none transition-colors duration-300 focus:border-cdagreen/60";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }

      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Incorrect email or password.");
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-ink-400">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@cameroondigital.agency"
          className={input}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-ink-400">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={input}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-cdared">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cdagreen px-7 py-4 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Sign in
      </button>
    </form>
  );
}
