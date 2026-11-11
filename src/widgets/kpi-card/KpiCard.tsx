import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { formatMoney, formatNumber } from "@/shared/lib/format";
import type { DashboardKpi } from "@/modules/dashboard";

interface KpiCardProps {
  kpi: DashboardKpi;
}

function formatValue(kpi: DashboardKpi): string {
  if (kpi.kind === "money") return formatMoney(kpi.value);
  if (kpi.kind === "percent") return `${kpi.value}%`;
  return formatNumber(kpi.value);
}

/** Tiny inline trend line — the design reserves the brand gradient for data-viz. */
function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  if (points.length < 2) return null;
  const w = 132;
  const h = 40;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / span) * (h - 6) - 3;
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const id = `spark-${positive ? "up" : "down"}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="h-10 w-full max-w-[132px]"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={positive ? "var(--success)" : "var(--danger)"}
            stopOpacity="0.28"
          />
          <stop
            offset="100%"
            stopColor={positive ? "var(--success)" : "var(--danger)"}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline
        points={line}
        fill="none"
        stroke={positive ? "var(--success)" : "var(--danger)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function KpiCard({ kpi }: KpiCardProps) {
  const positive = kpi.trend !== "down";
  const DeltaIcon =
    kpi.trend === "up" ? ArrowUpRight : kpi.trend === "down" ? ArrowDownRight : Minus;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-ink-muted">{kpi.title}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
            kpi.trend === "up"
              ? "bg-success-soft text-success-ink"
              : kpi.trend === "down"
                ? "bg-danger-soft text-danger-ink"
                : "bg-neutral-soft text-ink-secondary",
          )}
        >
          <DeltaIcon className="h-3.5 w-3.5" />
          {kpi.delta > 0 ? "+" : ""}
          {kpi.delta}%
        </span>
      </div>

      <div className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.02em] text-ink money">
        {formatValue(kpi)}
      </div>

      <Sparkline points={kpi.spark} positive={positive} />
    </div>
  );
}
