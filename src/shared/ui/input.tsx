import * as React from "react";
import { cn } from "@/shared/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
}

const base =
  "w-full rounded-md border border-border-strong bg-surface text-[15px] text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-150 hover:border-ink-muted focus:border-action focus:outline-none focus:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-55 aria-[invalid=true]:border-danger";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, ...props }, ref) => {
    if (leftIcon) {
      return (
        <div className="relative flex w-full items-center">
          <span className="pointer-events-none absolute left-3 flex items-center text-ink-muted">
            {leftIcon}
          </span>
          <input
            type={type}
            ref={ref}
            className={cn(base, "h-11 pl-10 pr-3", className)}
            {...props}
          />
        </div>
      );
    }
    return (
      <input type={type} ref={ref} className={cn(base, "h-11 px-3", className)} {...props} />
    );
  },
);
Input.displayName = "Input";

export { Input };
