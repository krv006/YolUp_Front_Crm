import { Receipt, Wallet } from 'lucide-react';

import { StatusBadge } from '@/core/status';
import { Button } from '@/shared/ui/button';
import { DataTable, type Column, type SortState } from '@/shared/ui/data-table';
import { EmptyState } from '@/shared/ui/empty-state';
import { formatDateTime, formatMoney } from '@/shared/lib';
import type { Payment } from '../model/types';

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
  onReceipt: (payment: Payment) => void;
  /** To'lov turi kodi → katalogdagi nomi (custom turlar uchun). */
  methodLabelOf?: (code: string) => string | undefined;
}

export function PaymentTable({
  payments,
  isLoading,
  sort,
  onSortChange,
  onCreate,
  onClearFilters,
  filtered,
  onReceipt,
  methodLabelOf,
}: PaymentTableProps) {
  const columns: Column<Payment>[] = [
    {
      key: 'student_name',
      header: "O'quvchi",
      sortable: true,
      render: (payment) => (
        <div className="min-w-0">
          <p className="od-truncate font-semibold text-ink">{payment.student_name ?? "O'quvchi"}</p>
          <p className="money od-truncate text-xs text-ink-muted">
            {payment.receipt_no ?? payment.receipt_number ?? payment.id.slice(-8)}
          </p>
        </div>
      ),
    },
    {
      key: 'group_name',
      header: 'Guruh',
      render: (payment) => (
        <span className="od-truncate text-ink-secondary">{payment.group_name ?? '—'}</span>
      ),
    },
    {
      key: 'method',
      header: 'Usul',
      render: (payment) => (
        <StatusBadge status={payment.method} label={methodLabelOf?.(payment.method)} />
      ),
    },
    {
      key: 'amount_tiyin',
      header: 'Summa',
      align: 'right',
      sortable: true,
      render: (payment) => (
        <span className="money font-semibold text-success-ink">
          +{formatMoney(payment.amount_tiyin)}
        </span>
      ),
    },
    {
      key: 'paid_at',
      header: 'Vaqt',
      align: 'right',
      sortable: true,
      render: (payment) => (
        <span className="money text-ink-secondary">{formatDateTime(payment.paid_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Amallar</span>,
      align: 'right',
      width: '64px',
      render: (payment) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onReceipt(payment)}
          aria-label={`${payment.receipt_no ?? payment.receipt_number ?? "To'lov"} kvitansiyasi`}
        >
          <Receipt className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={payments}
      rowKey={(payment) => payment.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      empty={
        <EmptyState
          icon={<Wallet className="h-6 w-6" />}
          title="Bu davrda to'lov yo'q"
          description={
            filtered
              ? "Qidiruv yoki filtrga mos to'lov topilmadi."
              : "To'lov qabul qilinganda bu yerda ko'rinadi."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                To'lov qabul qilish
              </Button>
            )
          }
        />
      }
    />
  );
}
