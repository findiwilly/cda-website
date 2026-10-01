"use client";

import { useEffect } from "react";
import { RotateCcw, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/constants";

/**
 * Route-level error boundary for localized pages.
 *
 * Copy is bilingual inline rather than via `next-intl`: an error can render
 * before (or without) the message provider, and a hard crash that throws while
 * trying to translate is a far worse failure than showing the French line to an
 * English visitor.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces the real stack in Vercel logs / browser console.
    console.error("[cda] route error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cdared/10 blur-[130px]"
      />

      <div className="relative max-w-lg">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cdared">
          Erreur / Error
        </p>
        <h1 className="mt-6 font-display text-display-md font-bold text-ink-50">
          Quelque chose a mal tourné.
        </h1>
        <p className="mt-5 text-ink-300">
          Cette page n&apos;a pas pu se charger. Rechargez pour réessayer — et si
          le problème persiste, écrivez-nous, on répond vite.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-ink-500">
            Réf. {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
          >
            <RotateCcw className="h-4 w-4" />
            Réessayer / Retry
          </button>
          <a
            href={`https://wa.me/${SITE.whatsappNumber.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-ink-100 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
          >
            <MessageCircle className="h-4 w-4 text-cdagreen-bright" />
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
