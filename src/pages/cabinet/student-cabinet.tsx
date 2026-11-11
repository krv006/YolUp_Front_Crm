import { useMemo } from "react";
import { BookOpen, CalendarClock, CheckCircle2, CircleDollarSign, UserX } from "lucide-react";

import { useCurrentUser } from "@/core/auth";
import { useAttendanceList, type AttendanceStatus } from "@/modules/attendance";
import { useEnrollmentList } from "@/modules/enrollments";
import { useChargeList, usePaymentList, usePaymentMethodList } from "@/modules/finance";
import { ATTENDANCE_STATUS } from "@/core/status";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import { formatDate, formatMoney, formatNumber } from "@/shared/lib";
import { cn } from "@/shared/lib/cn";

/**
 * O'quvchi kabineti.
 *
 * O'quvchi (yoki ota-ona farzandi nomidan) ko'radigan narsalar: guruhlari,
 * davomat tarixi, hisob-fakturalar va to'lovlar. Faqat **o'z** ma'lumotlari —
 * boshqa o'quvchilar ro'yxati bu yerda ochilmaydi.
 */
export default function StudentCabinet({ studentId }: { studentId: string }) {
  const user = useCurrentUser();

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollmentList({
    student_id: studentId,
    page: 1,
    page_size: 50,
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useAttendanceList({
    student_id: studentId,
    page: 1,
    page_size: 200,
    ordering: "-lesson_date",
  });

  const { data: chargesData, isLoading: chargesLoading } = useChargeList({
    student_id: studentId,
    page: 1,
    page_size: 50,
    ordering: "-period",
  });

  const { data: paymentsData } = usePaymentList({
    student_id: studentId,
    page: 1,
    page_size: 10,
    ordering: "-paid_at",
  });

  const { data: methodsData } = usePaymentMethodList({ page: 1, page_size: 50 });
  const methodNameOf = (code: string) =>
    (methodsData?.results ?? []).find((item) => item.code === code)?.name ?? code;

  const enrollments = enrollmentsData?.results ?? [];
  const attendance = attendanceData?.results ?? [];
  const charges = chargesData?.results ?? [];
  const payments = paymentsData?.results ?? [];

  const counts = useMemo(() => {
    const result: Record<AttendanceStatus, number> = {
      PRESENT: 0,
      LATE: 0,
      ABSENT: 0,
      EXCUSED: 0,
    };
    for (const row of attendance) {
      const status = row.status as AttendanceStatus;
      if (status in result) result[status] += 1;
    }
    return result;
  }, [attendance]);

  const attended = counts.PRESENT + counts.LATE;
  const rate = attendance.length > 0 ? Math.round((attended / attendance.length) * 100) : 0;

  const debtTiyin = charges.reduce((sum, charge) => sum + Number(charge.debt_tiyin ?? 0), 0);
  const paidTiyin = charges.reduce((sum, charge) => sum + Number(charge.paid_tiyin ?? 0), 0);
  const totalTiyin = charges.reduce((sum, charge) => sum + Number(charge.total_tiyin ?? 0), 0);

  const isLoading = enrollmentsLoading || attendanceLoading || chargesLoading;

  return (
    <div className="grid gap-5">
      <PageHeader
        title={`Salom, ${user?.first_name ?? "o'quvchi"}`}
        subtitle="Guruhlaringiz, davomat va to'lovlar holati"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          size="sm"
          label="Guruhlarim"
          value={formatNumber(enrollments.length)}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Davomat foizi"
          value={attendance.length > 0 ? `${rate}%` : "—"}
          tone={rate >= 80 ? "success" : rate >= 60 ? "warning" : "danger"}
          hint={`${formatNumber(attended)}/${formatNumber(attendance.length)} dars`}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Qarzim"
          value={debtTiyin > 0 ? formatMoney(debtTiyin) : "0"}
          tone={debtTiyin > 0 ? "danger" : "success"}
          hint={debtTiyin > 0 ? "To'lanishi kerak" : "Qarz yo'q"}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="To'langan"
          value={formatMoney(paidTiyin)}
          tone="info"
          hint={totalTiyin > 0 ? `Jami hisoblangan: ${formatMoney(totalTiyin)}` : undefined}
          icon={<CalendarClock className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
            <h2 className="text-sm font-bold text-ink">Guruhlarim</h2>
          </header>

          {isLoading ? (
            <div className="grid gap-2 p-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-md bg-surface-2" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <EmptyState
              title="Guruhga a'zo emasiz"
              description="Hozircha biror guruhga biriktirilmagansiz."
            />
          ) : (
            <ul className="divide-y divide-divider">
              {enrollments.map((enrollment) => (
                <li
                  key={enrollment.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {enrollment.group_name ?? "Guruh"}
                    </span>
                    <span className="block truncate text-xs text-ink-muted">
                      {enrollment.teacher_name ? `${enrollment.teacher_name} · ` : ""}
                      {formatDate(enrollment.joined_at)} dan
                    </span>
                  </span>
                  <Chip
                    tone={
                      enrollment.status === "active"
                        ? "success"
                        : enrollment.status === "trial"
                          ? "info"
                          : "neutral"
                    }
                  >
                    {enrollment.status === "active"
                      ? "Faol"
                      : enrollment.status === "trial"
                        ? "Sinov"
                        : enrollment.status}
                  </Chip>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
            <h2 className="text-sm font-bold text-ink">Davomat tarixi</h2>
            <div className="flex items-center gap-2.5">
              {(Object.keys(counts) as AttendanceStatus[]).map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 text-xs text-ink-muted"
                  title={ATTENDANCE_STATUS[status].label}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      status === "PRESENT" && "bg-success",
                      status === "LATE" && "bg-warning",
                      status === "ABSENT" && "bg-danger",
                      status === "EXCUSED" && "bg-info",
                    )}
                  />
                  <span className="money font-semibold text-ink">{counts[status]}</span>
                </span>
              ))}
            </div>
          </header>

          {attendance.length === 0 ? (
            <EmptyState
              title="Davomat yozuvi yo'q"
              description="Darslar boshlangach davomat shu yerda ko'rinadi."
            />
          ) : (
            <ul className="divide-y divide-divider">
              {attendance.slice(0, 8).map((row) => (
                <li key={row.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="money w-24 flex-none text-xs text-ink-secondary">
                    {formatDate(row.lesson_date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {row.group_name ?? "Dars"}
                  </span>
                  <Chip
                    tone={
                      row.status === "PRESENT"
                        ? "success"
                        : row.status === "LATE"
                          ? "warning"
                          : row.status === "ABSENT"
                            ? "danger"
                            : "info"
                    }
                    dot
                  >
                    {ATTENDANCE_STATUS[row.status as AttendanceStatus]?.label ?? row.status}
                  </Chip>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <header className="border-b border-divider px-4 py-3">
            <h2 className="text-sm font-bold text-ink">Hisob-fakturalar</h2>
          </header>

          {charges.length === 0 ? (
            <EmptyState
              title="Hisob-faktura yo'q"
              description="Sizga hali to'lov hisoblanmagan."
            />
          ) : (
            <ul className="divide-y divide-divider">
              {charges.map((charge) => (
                <li key={charge.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="money block text-sm font-medium text-ink">
                      {charge.period}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {formatMoney(charge.total_tiyin)}
                      {Number(charge.discount_tiyin ?? 0) > 0
                        ? ` · chegirma ${formatMoney(charge.discount_tiyin)}`
                        : ""}
                    </span>
                  </span>
                  {Number(charge.debt_tiyin ?? 0) > 0 ? (
                    <Chip tone={charge.is_overdue ? "danger" : "warning"} dot>
                      Qarz {formatMoney(charge.debt_tiyin)}
                    </Chip>
                  ) : (
                    <Chip tone="success" dot>
                      Yopilgan
                    </Chip>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <header className="border-b border-divider px-4 py-3">
            <h2 className="text-sm font-bold text-ink">To'lovlarim</h2>
          </header>

          {payments.length === 0 ? (
            <EmptyState title="To'lov yo'q" description="To'lovlar shu yerda ko'rinadi." />
          ) : (
            <ul className="divide-y divide-divider">
              {payments.map((payment) => (
                <li key={payment.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="money w-24 flex-none text-xs text-ink-secondary">
                    {formatDate(payment.paid_at)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {methodNameOf(payment.method)}
                  </span>
                  <span className="money flex-none text-sm font-semibold text-ink">
                    {formatMoney(payment.amount_tiyin)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {enrollments.length === 0 && !isLoading && (
        <p className="inline-flex items-center gap-2 text-xs text-ink-muted">
          <UserX className="h-3.5 w-3.5" />
          Kabinet faqat sizga tegishli ma'lumotlarni ko'rsatadi.
        </p>
      )}
    </div>
  );
}
