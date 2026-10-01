"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { dur, ease, fadeIn } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-white/5">
      {items.map((item, i) => {
        const open = openIndex === i;
        // Stable per-item ids so `aria-controls` and `aria-labelledby` form a
        // real relationship between the trigger and the panel it opens.
        const buttonId = `accordion-trigger-${i}`;
        const panelId = `accordion-panel-${i}`;

        return (
          <motion.div
            key={i}
            layout
            transition={{ layout: { duration: dur.fast, ease: ease.inOut } }}
          >
            <h3>
              <button
                type="button"
                id={buttonId}
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-display text-lg font-semibold text-ink-50">
                  {item.q}
                </span>
                <Plus
                  aria-hidden
                  className={cn(
                    "h-5 w-5 shrink-0 text-cdagreen-bright transition-transform duration-300 ease-out-expo",
                    open && "rotate-45"
                  )}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  layout
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={fadeIn}
                  className="overflow-hidden"
                >
                  {/* `region` + `aria-labelledby` gives a screen reader a named
                      landmark for the answer, so the trigger and its content
                      can be jumped between directly. */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="max-w-2xl pb-6 text-sm leading-relaxed text-ink-300"
                  >
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
