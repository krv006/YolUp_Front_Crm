import { cva } from "class-variance-authority";

export const variants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-55 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-action text-white shadow-xs hover:bg-action-hover active:bg-action-active",
        primary: "bg-action text-white shadow-xs hover:bg-action-hover active:bg-action-active",
        secondary: "border border-border-strong bg-surface text-ink hover:bg-surface-2",
        outline: "border border-border-strong bg-surface text-ink hover:bg-surface-2",
        ghost: "bg-transparent text-ink-secondary hover:bg-surface-2 hover:text-ink",
        danger: "bg-danger text-white shadow-xs hover:bg-[#dc2626]",
        destructive: "bg-danger text-white shadow-xs hover:bg-[#dc2626]",
        "soft-danger": "bg-danger-soft text-danger-ink hover:bg-[#fbd9d9]",
        secondary2: "bg-secondary text-secondary-foreground hover:bg-surface-3",
        link: "h-auto bg-transparent p-0 text-action-soft-text underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-10 rounded-md px-4 text-[15px]",
        sm: "min-h-8 rounded-sm px-3 text-sm",
        lg: "min-h-12 rounded-md px-6 text-base",
        icon: "h-10 w-10 min-h-10 rounded-md p-0",
        "icon-sm": "h-9 w-9 min-h-9 rounded-sm p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);
