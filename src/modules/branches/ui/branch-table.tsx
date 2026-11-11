import { Building2, MapPin, MoreHorizontal, Pencil, Phone, Plus, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Chip } from "@/shared/ui/chip";
import { DataTable, type Column, type SortState } from "@/shared/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EmptyState } from "@/shared/ui/empty-state";
import type { Branch } from "../model/types";

interface BranchTableProps {
  branches: Branch[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
}

export function BranchTable({
  branches,
  isLoading,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
  filtered,
}: BranchTableProps) {
  const columns: Column<Branch>[] = [
    {
      key: "name",
      header: "Filial",
      sortable: true,
      render: (branch) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-sm bg-brand-700 text-[#cfe0ff]">
            <Building2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="od-truncate font-semibold text-ink">{branch.name}</p>
            <p className="money text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted">
              {branch.code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "address",
      header: "Manzil",
      render: (branch) =>
        branch.address ? (
          <span className="flex items-center gap-2 text-ink-secondary">
            <MapPin className="h-3.5 w-3.5 flex-none text-ink-muted" />
            <span className="od-truncate">{branch.address}</span>
          </span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "phone",
      header: "Telefon",
      render: (branch) =>
        branch.phone ? (
          <span className="money flex items-center gap-2 text-ink-secondary">
            <Phone className="h-3.5 w-3.5 flex-none text-ink-muted" />
            {branch.phone}
          </span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "is_active",
      header: "Holat",
      render: (branch) => (
        <Chip tone={branch.is_active ? "success" : "neutral"} dot>
          {branch.is_active ? "Faol" : "Nofaol"}
        </Chip>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "104px",
      render: (branch) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(branch)}
            aria-label={`${branch.name} filialini tahrirlash`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${branch.name} uchun amallar`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(branch)}>
                <Pencil className="h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(branch)}
                className="text-danger-ink focus:bg-danger-soft"
              >
                <Trash2 className="h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={branches}
      rowKey={(branch) => branch.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      empty={
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Filial topilmadi"
          description={
            filtered
              ? "Qidiruvga mos filial yo'q."
              : "Filiallar o'quvchi, guruh va xonalarni ajratadi. Birinchi filialni qo'shing."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Filial qo'shish
              </Button>
            )
          }
        />
      }
    />
  );
}
