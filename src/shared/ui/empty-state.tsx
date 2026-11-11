import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Empty state that names the next action (prototype `.empty-state`). */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid justify-items-center gap-3 px-6 py-12 text-center text-ink-muted",
        className,
      )}
    >
      {icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2 text-ink-muted">
          {icon}
        </span>
      )}
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="max-w-[420px] text-[15px]">{description}</p>}
      {action}
    </div>
  );
}
