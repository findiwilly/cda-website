"use client";

import { useState } from "react";

export function BlogFilterClient({
  categories,
}: {
  categories: string[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  if (categories.length === 0) return null;
  const filtered = (posts: any[]) => {
    return posts.filter((p) => {
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      const matchC = !selected || p.category === selected;
      return matchQ && matchC;
    });
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full max-w-sm rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-ink-50 placeholder:text-ink-400"
        />
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelected(null)}
              className={`rounded-full px-4 py-2 text-xs ring-1 ring-white/10 ${selected === null ? "bg-cdagreen/20 text-cdagreen-bright" : "bg-white/5 text-ink-300"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelected(c)}
                className={`rounded-full px-4 py-2 text-xs ring-1 ring-white/10 ${selected === c ? "bg-cdagreen/20 text-cdagreen-bright" : "bg-white/5 text-ink-300"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Wrapper stores filtered? We'll pass state via data attribute not needed; simpler: render client list separately */}
    </div>
  );
}