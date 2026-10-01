"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

/**
 * Destructive-action button.
 *
 * Uses `confirm()` rather than a custom modal on purpose: this is a rarely used
 * admin control, and a native dialog is keyboard-accessible, screen-reader
 * labelled and impossible to get visually wrong. A bespoke modal here would be
 * more code for less accessibility.
 */

export function DeleteButton({
  action,
  id,
  confirm: message,
}: {
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
  id: string;
  confirm: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const run = () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(message)) return;
    setError("");
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) setError(result.error ?? "Could not delete.");
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-cdared/30 px-4 py-2 text-xs text-cdared transition-colors duration-300 hover:bg-cdared/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        Delete
      </button>
      {error && <span role="alert" className="text-[0.65rem] text-cdared">{error}</span>}
    </div>
  );
}
