"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin navigation. Split into a client component because the active route is
 * only known in the browser.
 */

export type AdminNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

export function AdminNav({
  items,
  pendingCount,
}: {
  items: AdminNavItem[];
  pendingCount: number;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto pb-3 pt-2">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const showBadge = item.href === "/admin/testimonials" && pendingCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors duration-300",
              active
                ? "bg-cdagreen/15 text-cdagreen-bright ring-1 ring-cdagreen/30"
                : "text-ink-300 hover:bg-white/5 hover:text-ink-50",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {showBadge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cdayellow/15 px-2 py-0.5 text-[0.65rem] font-medium text-cdayellow ring-1 ring-cdayellow/30">
                <Bell className="h-3 w-3" />
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
