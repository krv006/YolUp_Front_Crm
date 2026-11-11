import { Receipt } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Chip } from "@/shared/ui/chip";
import { DataTable, type Column, type SortState } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatDate, formatMoney } from "@/shared/lib";
import type { Expense } from "../model/types";

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
}

export function ExpenseTable({
  expenses,
  isLoading,
  sort,
  onSortChange,
  onCreate,
  onClearFilters,
  filtered,
}: ExpenseTableProps) {
  const columns: Column<Expense>[] = [
    {
      key: "category_name",
      header: "Kategoriya",
      sortable: true,
      render: (expense) => <Chip tone="neutral">{expense.category_name ?? "Boshqa"}</Chip>,
    },
    {
      key: "description",
      header: "Izoh",
      render: (expense) => (
        <span className="od-truncate text-ink-secondary">{expense.description ?? "—"}</span>
      ),
    },
    {
      key: "amount_tiyin",
      header: "Summa",
      align: "right",
      sortable: true,
      render: (expense) => (
        <span className="money font-semibold text-danger-ink">
          −{formatMoney(expense.amount_tiyin)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Sana",
      align: "right",
      sortable: true,
      render: (expense) => (
        <span className="money text-ink-secondary">{formatDate(expense.date)}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={expenses}
      rowKey={(expense) => expense.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      empty={
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="Bu davrda xarajat yo'q"
          description={
            filtered
              ? "Qidiruv yoki filtrga mos xarajat topilmadi."
              : "Ijara, kommunal va boshqa xarajatlarni shu yerga kiriting."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                Xarajat qo'shish
              </Button>
            )
          }
        />
      }
    />
  );
}
