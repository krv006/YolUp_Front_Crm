import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/shared/lib/cn";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

/**
 * Right-side sheet on desktop → bottom sheet on mobile (≤767px).
 * Create/edit always uses a sheet; only destructive confirms use a modal.
 */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-[rgba(10,15,45,0.42)] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[95] flex flex-col border-border bg-surface outline-none",
        // mobile — bottom sheet
        "inset-x-0 bottom-0 max-h-[88vh] w-full rounded-t-xl border-t shadow-sheet-bottom",
        "data-[state=open]:animate-[sheet-in-bottom_300ms_cubic-bezier(0.22,1,0.36,1)]",
        // desktop — right sheet
        "sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-[min(440px,100vw)] sm:rounded-none sm:rounded-l-xl sm:border-l sm:border-t-0 sm:shadow-sheet",
        "sm:data-[state=open]:animate-[sheet-in-right_300ms_cubic-bezier(0.22,1,0.36,1)]",
        className,
      )}
      {...props}
    >
      <span className="sheet-handle" aria-hidden="true" />
      {children}
      <DialogPrimitive.Close
        className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
        aria-label="Yopish"
      >
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-start gap-3 border-b border-divider px-6 py-5", className)}
      {...props}
    />
  );
}

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-display text-xl font-extrabold text-ink", className)}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-0.5 text-sm text-ink-muted", className)}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;

function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid flex-1 content-start gap-5 overflow-y-auto p-6", className)} {...props} />
  );
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex justify-end gap-3 border-t border-divider bg-surface px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
};
