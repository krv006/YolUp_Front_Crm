import { useMemo, useState } from "react";
import { CheckCheck, Save } from "lucide-react";

import type { AttendanceStatus, LessonRosterRow } from "@/modules/attendance";
import { ATTENDANCE_STATUS } from "@/core/status";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { getInitials } from "@/shared/lib";
import { cn } from "@/shared/lib/cn";

const STATUS_ORDER: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];

/** Tanlangan holat uchun rang — `ATTENDANCE_STATUS` dagi yorliq bilan birga. */
const ACTIVE_TONE: Record<AttendanceStatus, string> = {
  PRESENT: "border-success bg-success-soft text-success-ink",
  LATE: "border-warning bg-warning-soft text-warning-ink",
  ABSENT: "border-danger bg-danger-soft text-danger-ink",
  EXCUSED: "border-info bg-info-soft text-info",
};

interface AttendanceRosterProps {
  roster: LessonRosterRow[];
  isLoading: boolean;
  isPending: boolean;
  onSave: (items: { enrollment_id: string; status: AttendanceStatus }[]) => void;
}

/**
 * Bitta dars uchun davomat varaqasi.
 *
 * `key={lessonId}` bilan chaqiriladi — dars almashganda komponent qayta
 * o'rnatiladi va qoralama (draft) yangi ro'yxatdan boshlanadi. Shu tarzda
 * `useEffect` bilan sinxronlash kerak bo'lmaydi.
 */
export default function AttendanceRoster({
  roster,
  isLoading,
  isPending,
  onSave,
}: AttendanceRosterProps) {
  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>(() =>
    Object.fromEntries(
      roster
        .filter((row) => row.status !== null)
        .map((row) => [row.enrollment_id, row.status as AttendanceStatus]),
    ),
  );

  const counts = useMemo(() => {
    const result: Record<AttendanceStatus, number> = {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      EXCUSED: 0,
    };
    for (const status of Object.values(draft)) result[status] += 1;
    return result;
  }, [draft]);

  const assigned = Object.keys(draft).length;
  const missing = roster.length - assigned;

  const setStatus = (enrollmentId: string, status: AttendanceStatus) => {
    setDraft((current) => ({ ...current, [enrollmentId]: status }));
  };

  const markAll = () => {
    setDraft(
      Object.fromEntries(roster.map((row) => [row.enrollment_id, "PRESENT" as AttendanceStatus])),
    );
  };

  const submit = () => {
    onSave(
      roster
        .filter((row) => draft[row.enrollment_id] !== undefined)
        .map((row) => ({
          enrollment_id: row.enrollment_id,
          status: draft[row.enrollment_id],
        })),
    );
  };

  if (isLoading) {
    return (
      <div className="grid gap-2 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-md bg-surface-2" />
        ))}
      </div>
    );
  }

  if (roster.length === 0) {
    return (
      <EmptyState
        title="Guruhda o'quvchi yo'q"
        description="Bu guruhga o'quvchi biriktirilmagan — avval Guruhlar bo'limida qo'shing."
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-divider px-4 py-3">
        {STATUS_ORDER.map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                status === "PRESENT" && "bg-success",
                status === "LATE" && "bg-warning",
                status === "ABSENT" && "bg-danger",
                status === "EXCUSED" && "bg-info",
              )}
            />
            {ATTENDANCE_STATUS[status].label}
            <span className="money font-semibold text-ink">{counts[status]}</span>
          </span>
        ))}
        <span className="ml-auto text-xs text-ink-muted">
          {missing > 0 ? (
            <>
              <span className="money font-semibold text-warning-ink">{missing}</span> ta
              belgilanmagan
            </>
          ) : (
            <span className="font-semibold text-success-ink">Barchasi belgilangan</span>
          )}
        </span>
      </div>

      <ul className="divide-y divide-divider">
        {roster.map((row) => {
          const current = draft[row.enrollment_id];
          return (
            <li
              key={row.enrollment_id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-secondary">
                {getInitials(row.student_name)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {row.student_name}
              </span>

              <div className="flex flex-none items-center gap-1" role="group" aria-label="Holat">
                {STATUS_ORDER.map((status) => {
                  const active = current === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setStatus(row.enrollment_id, status)}
                      className={cn(
                        "h-8 rounded-md border px-2.5 text-xs font-semibold transition-colors",
                        active
                          ? ACTIVE_TONE[status]
                          : "border-border-strong bg-surface text-ink-secondary hover:border-ink-muted hover:text-ink",
                      )}
                    >
                      {ATTENDANCE_STATUS[status].label}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-divider px-4 py-3">
        <Button variant="secondary" size="sm" onClick={markAll} disabled={isPending}>
          <CheckCheck className="h-4 w-4" />
          Hammasi keldi
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-muted">
            <span className="money font-semibold text-ink">{assigned}</span> / {roster.length}
          </span>
          <Button onClick={submit} loading={isPending} disabled={assigned === 0}>
            <Save className="h-4 w-4" />
            Saqlash
          </Button>
        </div>
      </div>
    </div>
  );
}
