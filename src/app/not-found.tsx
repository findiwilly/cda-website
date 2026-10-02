import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import "../globals.css";

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main className="relative flex min-h-[70vh] items-center overflow-hidden pt-[72px]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/3 h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-cdagreen/12 blur-[130px]"
          />
          <div className="relative mx-auto max-w-2xl px-6 py-section text-center">
            <Reveal>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cdagreen-bright sm:text-xs">
                404
              </p>
            </Reveal>
            <SectionHeader
              as="h1"
              center
              eyebrow="Page not found"
              title="This page doesn't exist"
              subtitle="The link may be old, or the address has changed. Everything worth finding is back home — we'll point you the right way."
              className="mt-6"
            />
            <Reveal>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="/"
                  className="inline-flex items-center justify-center rounded-full bg-cdagreen px-7 py-3.5 text-sm font-medium text-white shadow-glow-green transition-colors duration-300 hover:bg-cdagreen-bright"
                >
                  Back home
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-ink-100 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
                >
                  Get in touch
                </a>
              </div>
            </Reveal>
          </div>
        </main>
      </body>
    </html>
  );
}
