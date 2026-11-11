import { MoreHorizontal, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";

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
import { getInitials } from "@/shared/lib";
import type { Parent } from "../model/types";

interface ParentTableProps {
  parents: Parent[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onEdit: (parent: Parent) => void;
  onDelete: (parent: Parent) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
}

export function ParentTable({
  parents,
  isLoading,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
  filtered,
}: ParentTableProps) {
  const columns: Column<Parent>[] = [
    {
      key: "last_name",
      header: "Ota-ona",
      sortable: true,
      render: (parent) => {
        const name = `${parent.first_name} ${parent.last_name}`;
        return (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-action-soft text-xs font-bold text-action-soft-text">
              {getInitials(name)}
            </span>
            <div className="min-w-0">
              <p className="od-truncate font-semibold text-ink">{name}</p>
              <p className="od-truncate text-xs text-ink-muted">{parent.relation ?? "—"}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "phone",
      header: "Telefon",
      render: (parent) => (
        <span className="money flex items-center gap-2 text-ink-secondary">
          <Phone className="h-3.5 w-3.5 flex-none text-ink-muted" />
          {parent.phone}
        </span>
      ),
    },
    {
      key: "student_name",
      header: "Farzand",
      render: (parent) => (
        <span className="od-truncate text-ink-secondary">{parent.student_name ?? "—"}</span>
      ),
    },
    {
      key: "students_count",
      header: "Farzandlar",
      align: "right",
      sortable: true,
      render: (parent) => (
        <Chip tone={(parent.students_count ?? 0) > 1 ? "brand" : "neutral"}>
          {parent.students_count ?? 1}
        </Chip>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "104px",
      render: (parent) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(parent)}
            aria-label={`${parent.first_name} ${parent.last_name} ni tahrirlash`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Amallar">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(parent)}>
                <Pencil className="h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(parent)}
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
      rows={parents}
      rowKey={(parent) => parent.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      empty={
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Ota-ona topilmadi"
          description={
            filtered
              ? "Qidiruvga mos ota-ona yo'q."
              : "Ota-onalar o'quvchilar bilan bog'lanadi va xabarlar oladi."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Ota-ona qo'shish
              </Button>
            )
          }
        />
      }
    />
  );
}
