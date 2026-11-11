import { useMemo, useState } from "react";
import { CircleDollarSign, TrendingUp, Users } from "lucide-react";

import { useCurrentUser } from "@/core/auth";
import { useAttendanceList } from "@/modules/attendance";
import { useChargeList } from "@/modules/finance";
import { useStudentList } from "@/modules/students";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import { formatMoney, formatNumber } from "@/shared/lib";
import { cn } from "@/shared/lib/cn";
import StudentCabinet from "./student-cabinet";

interface ChildSummary {
  id: string;
  name: string;
  groupName: string;
  status: string;
  rate: number;
  debtTiyin: number;
}

/**
 * Ota-ona kabineti.
 *
 * Ota-ona o'z farzandlarini ko'radi: qaysi guruhda, davomat foizi va qarzi.
 * Farzand tanlanganda uning to'liq kabineti (davomat, to'lovlar) shu yerda
 * ochiladi — bu `StudentCabinet` bilan bir xil ko'rinish.
 */
export default function ParentCabinet() {
  const user = useCurrentUser();
  const linkedIds = user?.linked_student_ids ?? [];

  const [selected, setSelected] = useState<string | null>(null);

  const { data: studentsData, isLoading } = useStudentList({ page: 1, page_size: 200 });
  const { data: attendanceData } = useAttendanceList({ page: 1, page_size: 500 });
  const { data: chargesData } = useChargeList({ page: 1, page_size: 500 });

  const children = useMemo<ChildSummary[]>(() => {
    const students = (studentsData?.results ?? []).filter((student) =>
      linkedIds.includes(student.id),
    );
    const attendance = attendanceData?.results ?? [];
    const charges = chargesData?.results ?? [];

    return students.map((student) => {
      const own = attendance.filter((row) => row.student_id === student.id);
      const attended = own.filter(
        (row) => row.status === "PRESENT" || row.status === "LATE",
      ).length;
      const debt = charges
        .filter((charge) => charge.student_id === student.id)
        .reduce((sum, charge) => sum + Number(charge.debt_tiyin ?? 0), 0);

      return {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        groupName: student.group_name ?? "Guruh yo'q",
        status: student.status ?? "trial",
        rate: own.length > 0 ? Math.round((attended / own.length) * 100) : 0,
        debtTiyin: debt,
      };
    });
  }, [studentsData, attendanceData, chargesData, linkedIds]);

  const activeId = selected ?? children[0]?.id ?? null;
  const totalDebt = children.reduce((sum, child) => sum + child.debtTiyin, 0);

  if (isLoading) {
    return (
      <div className="grid gap-5">
        <PageHeader title="Ota-ona kabineti" subtitle="Farzandlaringiz holati" />
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-surface-2" />
          ))}
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="grid gap-5">
        <PageHeader title="Ota-ona kabineti" subtitle="Farzandlaringiz holati" />
        <Card>
          <EmptyState
            title="Farzand bog'lanmagan"
            description="Hisobingizga hali o'quvchi bog'lanmagan — markaz administratoriga murojaat qiling."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Ota-ona kabineti"
        subtitle={`${user?.first_name ?? ""} — ${formatNumber(children.length)} ta farzand`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          size="sm"
          label="Farzandlar"
          value={formatNumber(children.length)}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Umumiy qarz"
          value={totalDebt > 0 ? formatMoney(totalDebt) : "0"}
          tone={totalDebt > 0 ? "danger" : "success"}
          hint={totalDebt > 0 ? "To'lanishi kerak" : "Qarz yo'q"}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="O'rtacha davomat"
          value={`${Math.round(
            children.reduce((sum, child) => sum + child.rate, 0) / children.length,
          )}%`}
          tone="info"
          hint="Barcha farzandlar bo'yicha"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {children.map((child) => {
          const active = child.id === activeId;
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => setSelected(child.id)}
              aria-pressed={active}
              className={cn(
                "grid gap-2 rounded-lg border p-3.5 text-left transition-colors",
                active
                  ? "border-action bg-action-soft/40"
                  : "border-border bg-surface hover:border-border-strong",
              )}
            >
              <span className="truncate text-sm font-bold text-ink">{child.name}</span>
              <span className="truncate text-xs text-ink-muted">{child.groupName}</span>
              <span className="flex flex-wrap items-center gap-1.5">
                <Chip
                  tone={child.rate >= 80 ? "success" : child.rate >= 60 ? "warning" : "danger"}
                  dot
                >
                  Davomat {child.rate}%
                </Chip>
                {child.debtTiyin > 0 && (
                  <Chip tone="danger">Qarz {formatMoney(child.debtTiyin)}</Chip>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {activeId && (
        <section className="grid gap-3">
          <h2 className="text-sm font-bold text-ink">
            {children.find((child) => child.id === activeId)?.name} — batafsil
          </h2>
          <StudentCabinet key={activeId} studentId={activeId} />
        </section>
      )}
    </div>
  );
}
