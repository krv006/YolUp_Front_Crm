import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/shared/lib/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  /**
   * Tashqi konteyner klasslari. `<select>` blokl element bo'lgani uchun
   * `className`dagi kenglik (`w-auto`, `min-w-*`) wrapper'ga ham tegishi
   * kerak — aks holda wrapper `w-full` bo'lib butun qatorni egallaydi.
   */
  wrapperClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, children, ...props }, ref) => (
    <div className={cn("relative w-full", wrapperClassName)}>
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-md border border-border-strong bg-surface px-3 pr-9 text-[15px] text-ink transition-[border-color,box-shadow] duration-150 hover:border-ink-muted focus:border-action focus:outline-none focus:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-55",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
    </div>
  ),
);
Select.displayName = "Select";

export { Select };
