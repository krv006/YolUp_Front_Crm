import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold h-6",
  {
    variants: {
      tone: {
        success: "bg-success-soft text-success-ink",
        warning: "bg-warning-soft text-warning-ink",
        danger: "bg-danger-soft text-danger-ink",
        info: "bg-info-soft text-info",
        neutral: "bg-neutral-soft text-ink-secondary",
        brand: "bg-action-soft text-action-soft-text",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  /** Status is never colour-only — the dot is an extra cue, the label is required. */
  dot?: boolean;
}

export function Chip({ className, tone, dot = false, children, ...props }: ChipProps) {
  return (
    <span className={cn(chipVariants({ tone }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 flex-none rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** Toolbar filter pill — mirrors the prototype's `.filter-chip`. */
export function FilterChip({ className, active = false, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-[34px] items-center rounded-full border px-3 text-sm transition-colors",
        active
          ? "border-action bg-action-soft font-semibold text-action-soft-text"
          : "border-border-strong bg-surface font-medium text-ink-secondary hover:border-ink-muted hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}

export { chipVariants };
