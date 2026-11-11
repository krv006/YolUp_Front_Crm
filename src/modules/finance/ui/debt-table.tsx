import { HandCoins, Receipt } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { DataTable, type Column, type SortState } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib";
import { formatOptionalDate } from "../model/format";
import type { DebtRow } from "../model/types";

interface DebtTableProps {
  debts: DebtRow[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onViewCharges: (row: DebtRow) => void;
  onClearFilters: () => void;
  filtered: boolean;
  /** Qarzga qo'shilgan ohirgi davr — jadval tagidagi izoh uchun. */
  onlyDebt: boolean;
}

/**
 * Qarzdorlar jadvali — hisob-fakturalardan hosil qilinadi (o'quvchi kesimida).
 * `debt_tiyin` musbat bo'lsa qarz, `advance_tiyin` musbat bo'lsa avans.
 */
export function DebtTable({
  debts,
  isLoading,
  sort,
  onSortChange,
  onViewCharges,
  onClearFilters,
  filtered,
  onlyDebt,
}: DebtTableProps) {
  const columns: Column<DebtRow>[] = [
    {
      key: "student_name",
      header: "O'quvchi",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="od-truncate font-semibold text-ink">{row.student_name}</p>
          <p className="money od-truncate text-xs text-ink-muted">{row.phone ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "group_names",
      header: "Guruh",
      render: (row) => (
        <div className="min-w-0">
          <p className="od-truncate text-ink-secondary">{row.group_names ?? "—"}</p>
          <p className="od-truncate text-xs text-ink-muted">{row.branch_name ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "charged_tiyin",
      header: "Hisoblangan",
      align: "right",
      sortable: true,
      render: (row) => (
        <span className="money text-ink-secondary">{formatMoney(row.charged_tiyin)}</span>
      ),
    },
    {
      key: "paid_tiyin",
      header: "To'langan",
      align: "right",
      sortable: true,
      render: (row) => (
        <span className="money text-ink-secondary">{formatMoney(row.paid_tiyin)}</span>
      ),
    },
    {
      key: "debt_tiyin",
      header: "Qoldiq",
      align: "right",
      sortable: true,
      render: (row) => (
        <div className="grid justify-items-end gap-0.5">
          <span
            className={cn(
              "money font-semibold",
              row.debt_tiyin > 0 ? "text-danger-ink" : "text-success-ink",
            )}
          >
            {row.debt_tiyin > 0
              ? formatMoney(row.debt_tiyin)
              : `+${formatMoney(row.advance_tiyin)}`}
          </span>
          {row.overdue_tiyin > 0 && (
            <span className="text-xs text-danger-ink">
              {formatMoney(row.overdue_tiyin)} muddati o'tgan
            </span>
          )}
        </div>
      ),
    },
    {
      key: "oldest_due_date",
      header: "Eng eski muddat",
      render: (row) => (
        <span className="money text-ink-secondary">{formatOptionalDate(row.oldest_due_date)}</span>
      ),
    },
    {
      key: "last_payment_at",
      header: "Oxirgi to'lov",
      align: "right",
      render: (row) => (
        <span className="money text-ink-secondary">{formatOptionalDate(row.last_payment_at)}</span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "72px",
      render: (row) => (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onViewCharges(row)}
          aria-label={`${row.student_name} hisob-fakturalarini ko'rish`}
        >
          <Receipt className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={debts}
      rowKey={(row) => row.student_id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      rowClassName={(row) => (row.overdue_tiyin > 0 ? "bg-danger-soft/25" : undefined)}
      empty={
        <EmptyState
          icon={<HandCoins className="h-6 w-6" />}
          title={onlyDebt ? "Qarzdor yo'q" : "Ma'lumot yo'q"}
          description={
            onlyDebt
              ? "Barcha o'quvchilar to'lovni yopgan — qarzlar ro'yxati bo'sh."
              : "Qidiruv yoki filtrga mos o'quvchi topilmadi."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : undefined
          }
        />
      }
    />
  );
}
