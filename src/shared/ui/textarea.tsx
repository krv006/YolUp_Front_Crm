import * as React from "react";
import { cn } from "@/shared/lib/cn";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[88px] w-full resize-y rounded-md border border-border-strong bg-surface px-3 py-2.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] duration-150 hover:border-ink-muted focus:border-action focus:outline-none focus:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-55",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
