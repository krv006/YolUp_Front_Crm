import * as React from "react";
import { cn } from "@/shared/lib/cn";

/** Keyboard hint chip (`Ctrl K`, `Esc`, `↑`). */
export function Kbd({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-0.5 whitespace-nowrap rounded-sm border border-border-strong border-b-2 bg-surface px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
