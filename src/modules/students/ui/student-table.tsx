import { Eye, MoreHorizontal, Pencil, Trash2, UserPlus, Users } from "lucide-react";

import { StatusBadge } from "@/core/status";
import { Avatar } from "@/shared/ui/avatar";
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
import type { Student } from "../model/types";

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  /** True when a search term or filter is narrowing the result set. */
  filtered: boolean;
  /** Tahrirlash/o'chirish amallari ko'rinadimi (rol bo'yicha). */
  canManage?: boolean;
  /** Bo'sh holatdagi "O'quvchi qo'shish" tugmasi ko'rinadimi. */
  canCreate?: boolean;
}

export function fullName(student: Student): string {
  return [student.first_name, student.last_name].filter(Boolean).join(" ");
}

function BalanceCell({ student }: { student: Student }) {
  if (student.balance_tiyin < 0) {
    return (
      <span className="money money-neg whitespace-nowrap font-semibold">
        {"\u2212"}
        {formatMoney(Math.abs(student.balance_tiyin))}
      </span>
    );
  }
  if (student.balance_tiyin > 0) {
    return (
      <span className="money money-pos whitespace-nowrap font-semibold">
        +{formatMoney(student.balance_tiyin)}
      </span>
    );
  }
  return <span className="text-sm font-medium text-success-ink">Qarzsiz</span>;
}

export function StudentTable({
  students,
  isLoading,
  sort,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
  filtered,
  canManage = true,
  canCreate = true,
}: StudentTableProps) {
  const columns: Column<Student>[] = [
    {
      key: "last_name",
      header: "O'quvchi",
      sortable: true,
      render: (student) => (
        <div className="flex items-center gap-3">
          <Avatar name={fullName(student)} src={student.photo_url} />
          <div className="min-w-0">
            <p className="od-truncate font-semibold text-ink">{fullName(student)}</p>
            <p className="od-truncate text-xs text-ink-muted">
              {student.parent_name ?? "Ota-ona kiritilmagan"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "group",
      header: "Guruh",
      render: (student) => (
        <span className="od-truncate text-ink-secondary">{student.group_name ?? "—"}</span>
      ),
    },
    {
      key: "phone",
      header: "Telefon",
      render: (student) => (
        <span className="money text-ink-secondary">{student.phone ?? "—"}</span>
      ),
    },
    {
      key: "balance_tiyin",
      header: "Balans",
      align: "right",
      sortable: true,
      render: (student) => <BalanceCell student={student} />,
    },
    {
      key: "status",
      header: "Holat",
      render: (student) => <StatusBadge status={student.status} />,
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "112px",
      render: (student) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onView(student)}
            aria-label={`${fullName(student)} profilini ochish`}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${fullName(student)} uchun amallar`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onView(student)}>
                  <Eye className="h-4 w-4" />
                  Tafsilot
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(student)}>
                  <Pencil className="h-4 w-4" />
                  Tahrirlash
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onDelete(student)}
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
      rows={students}
      rowKey={(student) => student.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      empty={
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Hech narsa topilmadi"
          description={
            filtered
              ? "Qidiruv yoki filtrga mos o'quvchi yo'q. Shartlarni o'zgartirib ko'ring."
              : "Hali o'quvchi qo'shilmagan. Har bir yangi o'quvchi guruhga biriktirilishi kerak."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : canCreate ? (
              <Button size="sm" onClick={onCreate}>
                <UserPlus className="h-4 w-4" />
                O'quvchi qo'shish
              </Button>
            ) : undefined
          }
        />
      }
    />
  );
}
