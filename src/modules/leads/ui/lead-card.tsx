import { Flame, Phone, School as SchoolIcon, Snowflake, Sun, UserRound } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib";
import type { Lead } from "../model/types";

const TEMPERATURE = {
  hot: { label: "Issiq", Icon: Flame, cls: "bg-danger-soft text-danger-ink" },
  warm: { label: "Iliq", Icon: Sun, cls: "bg-warning-soft text-warning-ink" },
  cold: { label: "Sovuq", Icon: Snowflake, cls: "bg-info-soft text-info" },
} as const;

export function leadName(lead: Lead): string {
  return [lead.first_name, lead.last_name].filter(Boolean).join(" ");
}

interface LeadCardProps {
  lead: Lead;
  onOpen: (lead: Lead) => void;
  onDragStart?: (lead: Lead) => void;
}

export function LeadCard({ lead, onOpen, onDragStart }: LeadCardProps) {
  const temperature = lead.temperature ? TEMPERATURE[lead.temperature] : null;

  return (
    <article
      draggable={Boolean(onDragStart)}
      onDragStart={() => onDragStart?.(lead)}
      className={cn(
        "relative grid min-w-0 gap-2.5 rounded-md border border-border bg-surface p-3 text-left shadow-xs transition-[border-color,box-shadow]",
        "hover:border-border-strong hover:shadow-sm",
        onDragStart && "cursor-grab active:cursor-grabbing",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="od-truncate font-semibold text-ink">{leadName(lead)}</p>
          <p className="money mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <Phone className="h-3 w-3" />
            {lead.phone}
          </p>
        </div>
        {temperature && (
          <span
            className={cn(
              "inline-flex h-6 flex-none items-center gap-1 rounded-full px-2 text-xs font-semibold",
              temperature.cls,
            )}
          >
            <temperature.Icon className="h-3 w-3" />
            {temperature.label}
          </span>
        )}
      </div>

      <dl className="grid gap-1.5 text-xs text-ink-muted">
        <div className="flex items-center gap-1.5">
          <UserRound className="h-3 w-3 flex-none" />
          <dt className="sr-only">Mas'ul</dt>
          <dd className="od-truncate">{lead.teacher_name ?? "Tayinlanmagan"}</dd>
        </div>
        {lead.school_name && (
          <div className="flex items-center gap-1.5">
            <SchoolIcon className="h-3 w-3 flex-none" />
            <dt className="sr-only">Maktab</dt>
            <dd className="od-truncate">{lead.school_name}</dd>
          </div>
        )}
      </dl>

      <div className="flex items-center justify-between gap-2 border-t border-divider pt-3">
        <span className="od-truncate text-xs font-semibold text-ink-muted">
          {lead.source_name ?? "Manba yo'q"}
        </span>
        <span className="money flex-none text-xs text-ink-muted">{formatDate(lead.created_at)}</span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(lead)}
        className="rounded-sm text-xs font-semibold text-action-soft-text transition-colors hover:text-action focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
      >
        Batafsil →
      </button>
    </article>
  );
}
