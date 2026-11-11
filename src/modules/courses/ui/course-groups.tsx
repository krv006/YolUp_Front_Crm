import { Users } from "lucide-react";

import { StatusBadge } from "@/core/status";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatMoney, formatNumber } from "@/shared/lib";

/**
 * Kursga bog'langan guruhning ko'rsatish uchun kerakli qismi. Ataylab
 * strukturaviy tip — courses moduli guruhlar moduliga bog'lanib qolmasin.
 */
export interface CourseGroupRow {
  id: string;
  name: string;
  status: string;
  price_tiyin: number;
  students_count?: number;
  capacity?: number;
  teacher_name?: string | null;
  branch_name?: string | null;
}

interface CourseGroupsProps {
  groups: CourseGroupRow[];
  isLoading?: boolean;
}

/** Kurs ↔ guruh bog'lanishining (1 kurs → N guruh) ko'rinishi. */
export function CourseGroups({ groups, isLoading = false }: CourseGroupsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-2">
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-[62px] w-full" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="grid place-items-center gap-1 rounded-lg border border-dashed border-border px-4 py-8 text-center">
        <Users className="h-5 w-5 text-ink-muted" aria-hidden="true" />
        <p className="text-sm font-semibold text-ink">Guruh yo'q</p>
        <p className="text-xs text-ink-muted">
          Bu kursga hali guruh bog'lanmagan. Guruhlar “Guruhlar” bo'limida yaratiladi va
          kursga biriktiriladi.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-2">
      {groups.map((group) => (
        <li
          key={group.id}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface p-3"
        >
          <div className="min-w-0">
            <p className="od-truncate text-sm font-semibold text-ink">{group.name}</p>
            <p className="od-truncate text-xs text-ink-muted">
              {group.branch_name ?? "Filial ko'rsatilmagan"}
              {(group.teacher_name ?? "").length > 0 ? ` · ${group.teacher_name}` : ""}
            </p>
          </div>

          <div className="flex flex-none items-center gap-3">
            <span className="money whitespace-nowrap text-xs text-ink-secondary">
              {formatNumber(group.students_count ?? 0)}/{formatNumber(group.capacity ?? 0)} o'quvchi
            </span>
            <span className="money whitespace-nowrap text-xs font-semibold text-ink">
              {formatMoney(group.price_tiyin)}
            </span>
            <StatusBadge status={group.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
