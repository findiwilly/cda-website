"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, ExternalLink } from "lucide-react";
import { SITE } from "@/lib/constants";

/**
 * Inline Cal.com booking embed.
 *
 * Why an embed rather than an outbound link: a booking link sends the visitor to
 * a different domain, and on a phone that is where most of the drop-off happens —
 * they leave the site, land on a page with no context, and never come back. An
 * embed keeps the offer visible while the page stays loaded.
 *
 * Loading strategy, in priority order — this is the part that matters on a
 * metered Cameroonian connection:
 *
 *  1. The button renders immediately and the fallback link is a real `<a>`, so
 *     the page is useful before anything loads and works with JavaScript off.
 *  2. The iframe is only created once the visitor asks for it, and only if
 *     `IntersectionObserver` says it is actually on screen.
 *  3. A failure to load is not a dead end — the fallback link replaces the frame.
 *
 * Cal's `embed.js` is deliberately not used. It auto-injects a fixed-height
 * container, which fights the layout here and gives no way to tell a successful
 * load from a blocked one.
 */

export function CalEmbed() {
  const t = useTranslations("contact.booking");
  const containerRef = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  // Only mount the embed once it is genuinely in the viewport.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || activated) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Start loading a little before it scrolls in, so the calendar is usually
      // painted by the time it is fully in view.
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [activated]);

  const shouldLoad = activated && visible;

  return (
    <div ref={containerRef}>
      {!shouldLoad && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
          <CalendarDays aria-hidden className="mx-auto h-7 w-7 text-cdagreen-bright" />
          <p className="mt-4 text-sm leading-relaxed text-ink-300">{t("body")}</p>

          {activated && failed && (
            <p role="status" className="mt-3 text-sm text-ink-400">
              {t("embedFailed")}
            </p>
          )}

          <button
            type="button"
            onClick={() => setActivated(true)}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
          >
            {t("button")}
          </button>

          <p className="mt-5 text-xs text-ink-500">
            <a
              href={SITE.calcomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-cdagreen-bright"
            >
              {t("openInNewTab")}
              <ExternalLink aria-hidden className="h-3.5 w-3.5" />
            </a>
          </p>
        </div>
      )}

      {shouldLoad && !failed && (
        <div
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          // Cal.com's script reads this attribute; it has no meaning without it.
          data-cal-link={SITE.calcomUrl}
          data-cal-config={JSON.stringify({
            layout: "month_view",
            // Same theme as the site so the embed does not flash a light box.
            theme: "dark",
          })}
        >
          {/* Plain iframe rather than next/script + Cal's auto-injection: it lets
              us detect a failure ourselves and keep the fallback link reachable
              instead of staring at an empty rounded rectangle. */}
          <iframe
            src={`${SITE.calcomUrl}?embed=1&theme=dark`}
            title={t("embedTitle")}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="h-[38rem] w-full border-0"
          />
          <noscript>
            <div className="p-8 text-center text-sm text-ink-300">
              <a
                href={SITE.calcomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cdagreen-bright underline underline-offset-4"
              >
                {t("openInNewTab")}
              </a>
            </div>
          </noscript>
        </div>
      )}

      {failed && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <p role="status" className="text-sm text-ink-300">{t("embedFailed")}</p>
          <a
            href={SITE.calcomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-cdagreen-bright"
          >
            {t("button")}
            <ExternalLink aria-hidden className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}