import { CalendarClock, DoorOpen, GraduationCap, UserRound } from "lucide-react";

import { StatusBadge } from "@/core/status";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib";
import { Progress, occupancyTone } from "@/shared/ui/progress";
import type { Group } from "../model/types";

interface GroupCardProps {
  group: Group;
  onOpen: (group: Group) => void;
}

/** Group summary card — colour dot, teacher, room, occupancy and price. */
export function GroupCard({ group, onOpen }: GroupCardProps) {
  const students = group.students_count ?? 0;
  const capacity = group.capacity ?? 0;
  const percent = capacity > 0 ? Math.round((students / capacity) * 100) : 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(group)}
      className="grid gap-4 rounded-lg border border-border bg-surface p-5 text-left shadow-xs transition-[border-color,box-shadow,transform] hover:border-border-strong hover:shadow-sm focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full"
          style={{ backgroundColor: group.color ?? "var(--action)" }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="od-truncate font-display text-[15px] font-bold text-ink">{group.name}</h3>
          <p className="od-truncate mt-0.5 text-xs text-ink-muted">
            {group.course_name ?? "Kurs belgilanmagan"}
          </p>
        </div>
        <StatusBadge status={group.status} />
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-ink-secondary">
          <UserRound className="h-3.5 w-3.5 flex-none text-ink-muted" />
          <dt className="sr-only">O'qituvchi</dt>
          <dd className="od-truncate">{group.teacher_name ?? "Tayinlanmagan"}</dd>
        </div>
        <div className="flex items-center gap-2 text-ink-secondary">
          <DoorOpen className="h-3.5 w-3.5 flex-none text-ink-muted" />
          <dt className="sr-only">Xona</dt>
          <dd className="od-truncate">{group.room_name ?? "Xona yo'q"}</dd>
        </div>
        <div className="flex items-center gap-2 text-ink-secondary">
          <CalendarClock className="h-3.5 w-3.5 flex-none text-ink-muted" />
          <dt className="sr-only">Jadval</dt>
          <dd className="od-truncate money">{group.schedule_label ?? "Jadval kiritilmagan"}</dd>
        </div>
      </dl>

      <div className="grid gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-ink-muted">
            <GraduationCap className="h-3.5 w-3.5" />
            Bandlik
          </span>
          <span className="money font-semibold text-ink-secondary">
            {students}/{capacity || "—"}
          </span>
        </div>
        <Progress
          value={percent}
          tone={occupancyTone(percent)}
          label={`${group.name} bandligi ${percent} foiz`}
        />
      </div>

      <div className="flex items-center justify-between border-t border-divider pt-3">
        <span className="text-xs font-semibold text-ink-muted">Oylik narx</span>
        <span className={cn("money font-display text-base font-extrabold text-ink")}>
          {formatMoney(group.price_tiyin)}
        </span>
      </div>
    </button>
  );
}
