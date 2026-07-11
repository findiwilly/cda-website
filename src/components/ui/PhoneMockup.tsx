import { MessageCircle } from "lucide-react";

/**
 * Minimal device frame with a stylized app skeleton — the "classy sample
 * mockup" on industry pages, rendered in pure CSS (zero image weight).
 */
export function PhoneMockup({ title }: { title: string }) {
  return (
    <div className="mx-auto w-[16rem] rounded-[2.5rem] border border-white/10 bg-ink-900 p-2.5 shadow-glass">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink-950">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-ink-700" />

        <div className="px-5 pb-6 pt-10">
          {/* App header */}
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-bold text-ink-50">{title}</p>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cdagreen-bright opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cdagreen-bright" />
            </span>
          </div>

          {/* Hero block */}
          <div className="mt-5 h-20 rounded-xl bg-gradient-to-br from-cdagreen/25 via-ink-800 to-ink-800" />

          {/* Content rows */}
          <div className="mt-4 space-y-3">
            {[0.9, 0.7, 0.8].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-ink-800" />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-2 rounded-full bg-ink-700"
                    style={{ width: `${w * 100}%` }}
                  />
                  <div className="h-2 w-1/3 rounded-full bg-ink-800" />
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-6 flex items-center justify-center gap-2 rounded-full bg-cdagreen py-2.5 text-xs font-medium text-white">
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
}
