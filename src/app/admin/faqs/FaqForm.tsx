"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FaqFields } from "./FaqFields";

/** Collapsed-by-default "add an FAQ" panel. */
export function FaqForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm text-ink-100 transition-colors duration-300 hover:border-cdagreen/40 hover:bg-white/5"
      >
        <Plus className="h-4 w-4" />
        Add an FAQ
      </button>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink-50">New FAQ</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-400 transition-colors duration-300 hover:text-ink-100"
        >
          Close
        </button>
      </div>

      <FaqFields />
    </div>
  );
}