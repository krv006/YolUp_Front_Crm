import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn";
import { getInitials } from "@/shared/lib/format";

const avatarVariants = cva(
  "inline-flex flex-none items-center justify-center rounded-full font-bold tracking-[0.02em]",
  {
    variants: {
      size: {
        sm: "h-7 w-7 text-[0.75rem]",
        default: "h-9 w-9 text-[0.8125rem]",
        lg: "h-11 w-11 text-sm",
      },
      tone: {
        default: "bg-action-soft text-action-soft-text",
        navy: "bg-brand-700 text-[#cfe0ff]",
        violet: "bg-info-soft text-info",
        teal: "bg-success-soft text-success-ink",
      },
    },
    defaultVariants: { size: "default", tone: "default" },
  },
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  name?: string | null;
  src?: string | null;
}

export function Avatar({ className, size, tone, name, src, ...props }: AvatarProps) {
  return (
    <span className={cn(avatarVariants({ size, tone }), className)} {...props}>
      {src ? (
        <img src={src} alt={name ?? ""} className="h-full w-full rounded-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
