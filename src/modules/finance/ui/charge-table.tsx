import { Pencil, Receipt, Trash2 } from "lucide-react";

import { StatusBadge } from "@/core/status";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column, type SortState } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/lib/cn";
import { formatMoney } from "@/shared/lib";
import { formatPeriod } from "../model/format";
import type { Charge, ChargeStatus } from "../model/types";

const STATUS_LABEL: Record<ChargeStatus, string> = {
  paid: "To'langan",
  partial: "Qismli",
  unpaid: "To'lanmagan",
};

const STATUS_TONE = {
  paid: "success",
  partial: "warning",
  unpaid: "neutral",
} as const;

interface ChargeTableProps {
  charges: Charge[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onAccrue: () => void;
  onEdit: (charge: Charge) => void;
  onDelete: (charge: Charge) => void;
  onClearFilters: () => void;
  filtered: boolean;
}

/**
 * Hisob-fakturalar jadvali. To'lov qilingan yozuvlar "yopilgan" hisoblanadi:
 * ularni tahrirlash/o'chirish tugmalari ko'rsatilmaydi (server ham rad etadi).
 */
export function ChargeTable({
  charges,
  isLoading,
  sort,
  onSortChange,
  onAccrue,
  onEdit,
  onDelete,
  onClearFilters,
  filtered,
}: ChargeTableProps) {
  const columns: Column<Charge>[] = [
    {
      key: "student_name",
      header: "O'quvchi",
      sortable: true,
      render: (charge) => (
        <div className="min-w-0">
          <p className="od-truncate font-semibold text-ink">
            {charge.student_name ?? "O'quvchi"}
          </p>
          <p className="od-truncate text-xs text-ink-muted">{charge.group_name ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "period",
      header: "Davr",
      sortable: true,
      render: (charge) => (
        <div className="min-w-0">
          <p className="font-medium text-ink">{formatPeriod(charge.period)}</p>
          <p className="money text-xs text-ink-muted">{charge.due_date} gacha</p>
        </div>
      ),
    },
    {
      key: "total_tiyin",
      header: "Summa",
      align: "right",
      sortable: true,
      render: (charge) => (
        <div className="grid justify-items-end gap-0.5">
          <span className="money font-semibold text-ink">
            {formatMoney(charge.total_tiyin ?? charge.amount_tiyin)}
          </span>
          {(charge.discount_tiyin ?? 0) > 0 && (
            <span className="text-xs text-ink-muted">
              chegirma −{formatMoney(charge.discount_tiyin)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "paid_tiyin",
      header: "To'langan",
      align: "right",
      render: (charge) => (
        <span className="money text-ink-secondary">{formatMoney(charge.paid_tiyin ?? 0)}</span>
      ),
    },
    {
      key: "debt_tiyin",
      header: "Qarz",
      align: "right",
      sortable: true,
      render: (charge) => (
        <span
          className={cn(
            "money font-semibold",
            (charge.debt_tiyin ?? 0) > 0 ? "text-danger-ink" : "text-ink-muted",
          )}
        >
          {formatMoney(charge.debt_tiyin ?? 0)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Holat",
      render: (charge) => {
        const status = charge.status ?? "unpaid";
        return (
          <span className="flex items-center gap-2">
            <StatusBadge
              status={status}
              label={STATUS_LABEL[status]}
              tone={charge.is_overdue ? "danger" : STATUS_TONE[status]}
            />
            {charge.is_overdue && <span className="text-xs text-danger-ink">muddati o'tgan</span>}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "104px",
      render: (charge) =>
        (charge.paid_tiyin ?? 0) > 0 ? (
          <span className="text-xs text-ink-muted">Yopilgan</span>
        ) : (
          <span className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(charge)}
              aria-label={`${charge.student_name ?? "Hisob-faktura"} yozuvini tahrirlash`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(charge)}
              aria-label={`${charge.student_name ?? "Hisob-faktura"} yozuvini o'chirish`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={charges}
      rowKey={(charge) => charge.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      empty={
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="Hisob-faktura yo'q"
          description={
            filtered
              ? "Qidiruv yoki filtrga mos yozuv topilmadi."
              : "Guruh va davrni tanlab, oylik to'lovni hisoblang."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onAccrue}>
                Oylik hisoblash
              </Button>
            )
          }
        />
      }
    />
  );
}
