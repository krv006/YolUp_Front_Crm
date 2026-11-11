import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type StatTone = "action" | "success" | "warning" | "danger" | "info" | "neutral";

const ICON_TONE: Record<StatTone, string> = {
  action: "bg-action-soft text-action-soft-text",
  success: "bg-success-soft text-success-ink",
  warning: "bg-warning-soft text-warning-ink",
  danger: "bg-danger-soft text-danger-ink",
  info: "bg-info-soft text-info",
  neutral: "bg-neutral-soft text-ink-secondary",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
  /** `sm` — toraytirilgan variant (ro'yxat sahifalarining yuqori qismi uchun). */
  size?: "sm" | "md";
  className?: string;
}

const SIZE = {
  md: {
    root: "gap-4 p-5",
    icon: "h-11 w-11",
    label: "text-sm",
    /*
     * Uzun summa (masalan «142 725 000 so'm») karta chegarasidan chiqib
     * ketmasin. `cqi` — **konteyner** kengligiga bog'liq (viewport emas),
     * shuning uchun 2, 3 yoki 4 ustunli to'rda ham qiymat o'zi sig'adi.
     * Qiymat satriga `container-type: inline-size` qo'yilgan.
     */
    value: "clamp(0.75rem, 9cqi, 1.35rem)",
  },
  sm: {
    root: "gap-3 p-3.5",
    icon: "h-9 w-9",
    label: "text-xs",
    value: "clamp(0.7rem, 8.5cqi, 1.05rem)",
  },
} as const;

/** Compact labelled metric — used in toolbars and finance summaries. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "action",
  size = "md",
  className,
}: StatCardProps) {
  const dims = SIZE[size];

  return (
    <div
      className={cn(
        "flex min-w-0 items-center rounded-lg border border-border bg-surface shadow-xs",
        dims.root,
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex flex-none items-center justify-center rounded-md",
            dims.icon,
            ICON_TONE[tone],
          )}
        >
          {icon}
        </span>
      )}
      <div
        className="min-w-0 flex-1 overflow-hidden"
        style={{ containerType: "inline-size" }}
      >
        <p className={cn("truncate font-semibold text-ink-muted", dims.label)}>{label}</p>
        <p
          title={typeof value === "string" || typeof value === "number" ? String(value) : undefined}
          className="money mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap font-display font-extrabold tracking-[-0.01em] text-ink"
          style={{ fontSize: dims.value, lineHeight: 1.2 }}
        >
          {value}
        </p>
        {hint && <p className="mt-0.5 truncate text-xs text-ink-muted">{hint}</p>}
      </div>
    </div>
  );
}
