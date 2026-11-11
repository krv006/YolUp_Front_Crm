import { Link } from "@tanstack/react-router";
import { ArrowRight, HandCoins, ReceiptText, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import {
  useChargeList,
  useDebtList,
  useExpenseList,
  usePaymentList,
  formatPeriod,
  type DebtRow,
} from "@/modules/finance";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { EmptyState } from "@/shared/ui/empty-state";
import { StatCard } from "@/shared/ui/stat-card";
import { formatDate, formatMoney, formatNumber } from "@/shared/lib";
import { PageHeader } from "@/shared/ui/page-header";

/**
 * Moliya bo'limining umumiy ko'rinishi.
 *
 * Demo hajmda yig'indilar to'liq ro'yxatdan hisoblanadi (`page_size=500`).
 * Real backend'da bu ko'rsatkichlar `/reports/finance/` dan olinadi.
 */
export default function FinanceOverviewPage() {
  const { data: payments } = usePaymentList({ page: 1, page_size: 500, ordering: "-paid_at" });
  const { data: expenses } = useExpenseList({ page: 1, page_size: 500 });
  const { data: charges } = useChargeList({ page: 1, page_size: 500 });
  const { data: debts } = useDebtList({ page: 1, page_size: 500, only_debt: "true" });

  const paymentRows = payments?.results ?? [];
  const expenseRows = expenses?.results ?? [];
  const chargeRows = charges?.results ?? [];
  const debtRows: DebtRow[] = debts?.results ?? [];

  const revenue = paymentRows.reduce((sum, item) => sum + item.amount_tiyin, 0);
  const spending = expenseRows.reduce((sum, item) => sum + item.amount_tiyin, 0);
  const net = revenue - spending;
  const totalDebt = debtRows.reduce((sum, row) => sum + row.debt_tiyin, 0);
  const overdue = debtRows.reduce((sum, row) => sum + row.overdue_tiyin, 0);

  const recentPayments = paymentRows.slice(0, 5);
  const topDebts = [...debtRows].sort((a, b) => b.debt_tiyin - a.debt_tiyin).slice(0, 5);
  const openCharges = chargeRows.filter((charge) => (charge.debt_tiyin ?? 0) > 0).length;

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Umumiy ko'rinish"
        subtitle="Tushum, xarajat va qarzdorlar holati"
        actions={
          <Link
            to="/finance/payments"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-md bg-action px-4 text-sm font-semibold text-ink-on-dark transition-opacity hover:opacity-90"
          >
            <Wallet className="h-4 w-4" />
            To'lovlar bo'limi
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label="Tushum"
          value={formatMoney(revenue)}
          tone="success"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Xarajat"
          value={formatMoney(spending)}
          tone="danger"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          label="Sof foyda"
          value={formatMoney(net)}
          tone={net >= 0 ? "info" : "danger"}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Umumiy qarz"
          value={formatMoney(totalDebt)}
          tone={totalDebt > 0 ? "warning" : "success"}
          icon={<HandCoins className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
              Hisob-fakturalar
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              <span className="money font-semibold text-ink">{formatNumber(openCharges)}</span> ta
              yopilmagan yozuv
            </p>
          </div>
          <Link
            to="/finance/charges"
            className="inline-flex flex-none items-center gap-1 text-sm font-semibold text-action-soft-text hover:opacity-80"
          >
            Ochish
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        <Card className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
              Muddati o'tgan
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              <span className="money font-semibold text-danger-ink">{formatMoney(overdue)}</span> —
              shu oylar uchun
            </p>
          </div>
          <Link
            to="/finance/debts"
            className="inline-flex flex-none items-center gap-1 text-sm font-semibold text-action-soft-text hover:opacity-80"
          >
            Qarzlar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-divider px-5 py-3.5">
            <h2 className="text-sm font-bold text-ink">Oxirgi to'lovlar</h2>
            <Link
              to="/finance/payments"
              className="text-sm font-semibold text-action-soft-text hover:opacity-80"
            >
              Barchasi
            </Link>
          </header>

          {recentPayments.length === 0 ? (
            <EmptyState
              icon={<TrendingUp className="h-6 w-6" />}
              title="To'lov yo'q"
              description="To'lov qabul qilinganda shu yerda ko'rinadi."
            />
          ) : (
            <ul className="divide-y divide-divider">
              {recentPayments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="od-truncate font-medium text-ink">
                      {payment.student_name ?? "O'quvchi"}
                    </p>
                    <p className="od-truncate text-xs text-ink-muted">
                      {payment.group_name ?? "—"} · {formatDate(payment.paid_at)}
                    </p>
                  </div>
                  <span className="money flex-none font-semibold text-success-ink">
                    +{formatMoney(payment.amount_tiyin)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-divider px-5 py-3.5">
            <h2 className="text-sm font-bold text-ink">Eng katta qarzlar</h2>
            <Link
              to="/finance/debts"
              className="text-sm font-semibold text-action-soft-text hover:opacity-80"
            >
              Barchasi
            </Link>
          </header>

          {topDebts.length === 0 ? (
            <EmptyState
              icon={<HandCoins className="h-6 w-6" />}
              title="Qarzdor yo'q"
              description="Barcha o'quvchilar to'lovni yopgan."
            />
          ) : (
            <ul className="divide-y divide-divider">
              {topDebts.map((row) => (
                <li key={row.student_id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="od-truncate font-medium text-ink">{row.student_name}</p>
                    <p className="od-truncate text-xs text-ink-muted">
                      {row.group_names ?? "—"}
                      {row.overdue_tiyin > 0 && (
                        <>
                          {" "}
                          <Chip tone="danger" dot>
                            {formatMoney(row.overdue_tiyin)}
                          </Chip>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="money flex-none font-semibold text-danger-ink">
                    {formatMoney(row.debt_tiyin)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Chip tone="info" dot>
          <ReceiptText className="h-3.5 w-3.5" />
          Billing davrlari
        </Chip>
        <p className="text-sm text-ink-secondary">
          Hisob-fakturalar {(charges?.count ?? 0) > 0 ? formatPeriod(chargeRows[0]?.period) : "—"}{" "}
          dan boshlab yuritiladi.
        </p>
      </Card>
    </div>
  );
}
