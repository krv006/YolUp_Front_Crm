import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export interface TabItem {
  value: string;
  label: ReactNode;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: "underline" | "pill";
  className?: string;
  label?: string;
}

/** Controlled tabs — `underline` for page sections, `pill` for toolbars. */
export function Tabs({
  items,
  value,
  onChange,
  variant = "underline",
  className,
  label = "Bo'limlar",
}: TabsProps) {
  const isPill = variant === "pill";

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        isPill
          ? "inline-flex flex-wrap gap-1 rounded-md bg-surface-2 p-1"
          : "flex flex-wrap items-center gap-1 border-b border-divider",
        className,
      )}
    >
      {items.map((item) => {
        const active = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative inline-flex items-center gap-2 text-sm font-semibold transition-colors",
              isPill
                ? "min-h-9 rounded-sm px-3"
                : "min-h-10 px-3.5",
              active
                ? isPill
                  ? "bg-surface text-ink shadow-xs"
                  : "text-action-soft-text"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {item.icon}
            {item.label}
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs font-bold",
                  isPill && active ? "bg-surface-2 text-ink-muted" : "bg-surface-2 text-ink-muted",
                )}
              >
                {item.count}
              </span>
            )}
            {!isPill && active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-action" />
            )}
          </button>
        );
      })}
    </div>
  );
}
