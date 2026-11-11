import { Eye, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";

import { StatusBadge } from "@/core/status";
import { Button } from "@/shared/ui/button";
import { DataTable, type Column, type SortState } from "@/shared/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EmptyState } from "@/shared/ui/empty-state";
import { formatMoney } from "@/shared/lib";
import type { Group } from "../model/types";

interface GroupTableProps {
  groups: Group[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onOpen: (group: Group) => void;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
  /** Tahrirlash/o'chirish amallari ko'rinadimi (rol bo'yicha). */
  canManage?: boolean;
  /** Bo'sh holatdagi "Guruh yaratish" tugmasi ko'rinadimi. */
  canCreate?: boolean;
}

export function GroupTable({
  groups,
  isLoading,
  sort,
  onSortChange,
  onOpen,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
  filtered,
  canManage = true,
  canCreate = true,
}: GroupTableProps) {
  const columns: Column<Group>[] = [
    {
      key: "name",
      header: "Guruh",
      sortable: true,
      render: (group) => (
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-8 w-1.5 flex-none rounded-full"
            style={{ backgroundColor: group.color ?? "var(--action)" }}
          />
          <div className="min-w-0">
            <p className="od-truncate font-semibold text-ink">{group.name}</p>
            <p className="od-truncate text-xs text-ink-muted">
              {group.course_name ?? "Kurs belgilanmagan"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "teacher",
      header: "O'qituvchi",
      render: (group) => (
        <span className="od-truncate text-ink-secondary">
          {group.teacher_name ?? "Tayinlanmagan"}
        </span>
      ),
    },
    {
      key: "room",
      header: "Xona",
      render: (group) => (
        <span className="money text-ink-secondary">
          {group.room_name ?? "—"}
        </span>
      ),
    },
    {
      key: "students_count",
      header: "O'quvchi",
      align: "right",
      sortable: true,
      render: (group) => (
        <span className="money font-semibold text-ink">
          {group.students_count ?? 0}
          <span className="text-ink-muted">/{group.capacity ?? "—"}</span>
        </span>
      ),
    },
    {
      key: "price_tiyin",
      header: "Narx",
      align: "right",
      sortable: true,
      render: (group) => (
        <span className="money font-semibold text-ink">{formatMoney(group.price_tiyin)}</span>
      ),
    },
    {
      key: "status",
      header: "Holat",
      render: (group) => <StatusBadge status={group.status} />,
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "128px",
      render: (group) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpen(group)}
            aria-label={`${group.name} guruhini ochish`}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${group.name} uchun amallar`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(group)}>
                  <Pencil className="h-4 w-4" />
                  Tahrirlash
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onDelete(group)}
                  className="text-danger-ink focus:bg-danger-soft"
                >
                  <Trash2 className="h-4 w-4" />
                  O'chirish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={groups}
      rowKey={(group) => group.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onOpen}
      empty={
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Guruh topilmadi"
          description={
            filtered
              ? "Qidiruv yoki filtrga mos guruh yo'q."
              : "Guruh — o'quvchi, jadval va to'lovlarni bog'laydigan asosiy birlik."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : canCreate ? (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Guruh yaratish
              </Button>
            ) : undefined
          }
        />
      }
    />
  );
}
