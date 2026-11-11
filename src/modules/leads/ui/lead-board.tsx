import { useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { LeadCard } from "./lead-card";
import type { ChipProps } from "@/shared/ui/chip";
import type { Lead, LeadStage, LeadStageColor } from "../model/types";

export interface LeadStageColumn {
  /** `Lead.stage`ga yoziladigan qiymat — tizim kaliti yoki /lead-stages/ id'si. */
  value: LeadStage;
  label: string;
  color: LeadStageColor;
  /** Faqat foydalanuvchi qo'shgan ustunlarda bo'ladi (o'chirish uchun). */
  id?: string;
}

/** Rang → nuqta va chip ko'rinishi. Tailwind sinflari statik bo'lishi shart. */
export const STAGE_COLORS: Record<
  LeadStageColor,
  { dot: string; chip: NonNullable<ChipProps["tone"]>; label: string }
> = {
  action: { dot: "bg-action", chip: "brand", label: "Ko'k" },
  info: { dot: "bg-info", chip: "info", label: "Osmon" },
  success: { dot: "bg-success", chip: "success", label: "Yashil" },
  warning: { dot: "bg-warning", chip: "warning", label: "Sariq" },
  danger: { dot: "bg-danger", chip: "danger", label: "Qizil" },
  neutral: { dot: "bg-ink-muted", chip: "neutral", label: "Kulrang" },
};

export const STAGE_COLOR_ORDER: LeadStageColor[] = [
  "action",
  "info",
  "success",
  "warning",
  "danger",
  "neutral",
];

/** Tizim bosqichlari — har doim birinchi bo'lib, o'chirilmaydi. */
export const LEAD_STAGES: LeadStageColumn[] = [
  { value: "open", label: "Ochiq", color: "info" },
  { value: "waiting", label: "Kutilmoqda", color: "warning" },
  { value: "trial", label: "Sinov darsi", color: "action" },
  { value: "won", label: "O'quvchiga aylandi", color: "success" },
  { value: "lost", label: "Rad etilgan", color: "danger" },
];

interface LeadBoardProps {
  stages: LeadStageColumn[];
  leads: Lead[];
  isLoading: boolean;
  onOpen: (lead: Lead) => void;
  onMove: (lead: Lead, stage: LeadStage) => void;
}

/** Kanban board — kartani boshqa ustunga tashlash bosqichni o'zgartiradi. */
export function LeadBoard({
  stages,
  leads,
  isLoading,
  onOpen,
  onMove,
}: LeadBoardProps) {
  const [dragging, setDragging] = useState<Lead | null>(null);
  const [over, setOver] = useState<LeadStage | null>(null);

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-3">
      {stages.map((stage) => {
        const items = leads.filter((lead) => lead.stage === stage.value);
        const isOver = over === stage.value;
        const empty = items.length === 0;

        return (
          <section
            key={stage.value}
            aria-label={`${stage.label} bosqichi`}
            onDragOver={(event) => {
              event.preventDefault();
              setOver(stage.value);
            }}
            onDragLeave={() => setOver((current) => (current === stage.value ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              if (dragging && dragging.stage !== stage.value) onMove(dragging, stage.value);
              setDragging(null);
              setOver(null);
            }}
            className={cn(
              "group/col grid w-[280px] flex-none content-start gap-3 rounded-lg border border-transparent bg-surface-2 p-3 transition-colors",
              isOver && "border-action bg-action-soft",
            )}
          >
            <header className="flex items-center gap-2 px-1">
              <span
                aria-hidden="true"
                className={cn("h-2 w-2 flex-none rounded-full", STAGE_COLORS[stage.color].dot)}
              />
              <h2 className="od-truncate flex-1 text-sm font-bold text-ink">{stage.label}</h2>
              <span className="money rounded-full bg-surface px-2 text-xs font-bold text-ink-muted">
                {items.length}
              </span>
            </header>

            <div className="grid gap-3">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-md" />
                ))
              ) : empty ? (
                <p className="rounded-md border border-dashed border-border-strong px-3 py-6 text-center text-xs text-ink-muted">
                  Kartani shu yerga tashlang
                </p>
              ) : (
                items.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onOpen={onOpen} onDragStart={setDragging} />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
