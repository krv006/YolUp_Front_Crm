import { cn } from "@/shared/lib/cn";

export type ProgressTone = "action" | "success" | "warning" | "danger" | "brand";

const TONE: Record<ProgressTone, string> = {
  action: "bg-action",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  brand: "bg-brand-500",
};

interface ProgressProps {
  value: number;
  tone?: ProgressTone;
  className?: string;
  label?: string;
}

/** Slim progress bar — clamps to 0–100 so a bad value can't overflow the track. */
export function Progress({ value, tone = "action", className, label }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", TONE[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

/** Occupancy colour ramp shared by the dashboard and room screens. */
export function occupancyTone(percent: number): ProgressTone {
  if (percent >= 95) return "danger";
  if (percent >= 80) return "warning";
  return "success";
}
