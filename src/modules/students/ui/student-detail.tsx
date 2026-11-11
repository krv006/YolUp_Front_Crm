import type { ReactNode } from "react";
import {
  CalendarDays,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  Wallet,
} from "lucide-react";

import { StatusBadge } from "@/core/status";
import {
  useChargeList,
  usePaymentList,
  usePaymentMethodList,
} from "@/modules/finance";
import { Avatar } from "@/shared/ui/avatar";
import { formatDate, formatMoney, formatMonth } from "@/shared/lib";
import { cn } from "@/shared/lib/cn";
import type { Student } from "../model/types";
import { fullName } from "./student-table";

const CHARGE_STATUS: Record<string, string> = {
  paid: "To'langan",
  partial: "Qismli to'langan",
  unpaid: "To'lanmagan",
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-divider py-3 last:border-0">
      <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-sm bg-surface-2 text-ink-muted">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted">{label}</p>
        <p className="mt-0.5 text-[15px] text-ink">{value}</p>
      </div>
    </div>
  );
}

/**
 * O'quvchi bo'yicha moliyaviy tarix: oxirgi to'lovlar va hisob-fakturalar.
 *
 * Bu o'quvchi kartasini "to'liq" qiladi — menejer profilni ochib, qarz va
 * to'lovlar tarixini darhol ko'radi (Moliya bo'limiga o'tish shart emas).
 */
function StudentFinance({ studentId }: { studentId: string }) {
  const { data: payments, isLoading: paymentsLoading } = usePaymentList({
    student_id: studentId,
    page: 1,
    page_size: 5,
    ordering: "-paid_at",
  });
  const { data: charges, isLoading: chargesLoading } = useChargeList({
    student_id: studentId,
    page: 1,
    page_size: 5,
    ordering: "-period",
  });
  const { data: methods } = usePaymentMethodList({ page: 1, page_size: 100 });

  const methodName = (code: string) =>
    methods?.results.find((method) => method.code === code)?.name ?? code;
  const paymentRows = payments?.results ?? [];
  const chargeRows = charges?.results ?? [];

  return (
    <div className="grid gap-4">
      <section className="grid gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Wallet className="h-4 w-4 text-ink-muted" />
            To'lovlar
          </h3>
          <span className="text-xs text-ink-muted">{payments?.count ?? 0} ta</span>
        </div>

        {paymentsLoading ? (
          <div className="h-16 animate-pulse rounded-md bg-surface-2" aria-hidden="true" />
        ) : paymentRows.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-ink-muted">
            Hali to'lov qilinmagan.
          </p>
        ) : (
          <ul className="divide-y divide-divider rounded-md border border-border">
            {paymentRows.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="money text-sm font-semibold text-success-ink">
                    +{formatMoney(payment.amount_tiyin)}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {formatDate(payment.paid_at)} · {methodName(payment.method)}
                    {payment.receipt_number ? ` · №${payment.receipt_number}` : ""}
                  </p>
                </div>
                {payment.note ? (
                  <span
                    className="max-w-[45%] truncate text-xs text-ink-muted"
                    title={payment.note}
                  >
                    {payment.note}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <ReceiptText className="h-4 w-4 text-ink-muted" />
            Hisob-fakturalar
          </h3>
          <span className="text-xs text-ink-muted">{charges?.count ?? 0} ta</span>
        </div>

        {chargesLoading ? (
          <div className="h-16 animate-pulse rounded-md bg-surface-2" aria-hidden="true" />
        ) : chargeRows.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-ink-muted">
            Hisob-faktura yaratilmagan.
          </p>
        ) : (
          <ul className="divide-y divide-divider rounded-md border border-border">
            {chargeRows.map((charge) => {
              const debt = charge.debt_tiyin ?? 0;
              return (
                <li key={charge.id} className="grid gap-1 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-ink">
                      {formatMonth(charge.period)}
                    </span>
                    <span className="money text-sm font-semibold text-ink">
                      {formatMoney(charge.total_tiyin)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-ink-muted">
                    <span>
                      {CHARGE_STATUS[charge.status ?? "unpaid"] ?? charge.status}
                      {charge.is_overdue ? " · muddati o'tgan" : ""}
                    </span>
                    <span className={cn("money", debt > 0 && "font-semibold text-danger-ink")}>
                      {debt > 0 ? `Qarz: ${formatMoney(debt)}` : "To'langan"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Read-only student profile — rendered inside a Sheet. */
export function StudentDetail({ student }: { student: Student }) {
  const balance = student.balance_tiyin;

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-inset p-4">
        <Avatar name={fullName(student)} src={student.photo_url} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="od-truncate font-display text-lg font-bold text-ink">
            {fullName(student)}
          </p>
          <p className="od-truncate text-sm text-ink-muted">
            {student.group_name ?? "Guruhga biriktirilmagan"}
          </p>
        </div>
        <StatusBadge status={student.status} />
      </div>

      <div>
        <DetailRow
          icon={<Wallet className="h-4 w-4" />}
          label="Balans"
          value={
            balance < 0 ? (
              <span className="money money-neg font-semibold">
                {"\u2212"}
                {formatMoney(Math.abs(balance))} qarz
              </span>
            ) : balance > 0 ? (
              <span className="money money-pos font-semibold">
                +{formatMoney(balance)} avans
              </span>
            ) : (
              <span className="font-medium text-success-ink">Qarzsiz</span>
            )
          }
        />
        <DetailRow
          icon={<Phone className="h-4 w-4" />}
          label="Telefon"
          value={<span className="money">{student.phone ?? "—"}</span>}
        />
        <DetailRow
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={student.email ?? "—"}
        />
        <DetailRow
          icon={<UserRound className="h-4 w-4" />}
          label="Ota-ona"
          value={student.parent_name ?? "Kiritilmagan"}
        />
        <DetailRow
          icon={<GraduationCap className="h-4 w-4" />}
          label="Guruh"
          value={student.group_name ?? "—"}
        />
        <DetailRow
          icon={<CalendarDays className="h-4 w-4" />}
          label="Ro'yxatga olingan"
          value={formatDate(student.enrollment_date)}
        />
        <DetailRow
          icon={<CalendarDays className="h-4 w-4" />}
          label="Tug'ilgan sana"
          value={formatDate(student.birth_date)}
        />
        <DetailRow
          icon={<MapPin className="h-4 w-4" />}
          label="Manzil"
          value={student.address ?? "—"}
        />
      </div>

      <StudentFinance studentId={student.id} />
    </div>
  );
}
