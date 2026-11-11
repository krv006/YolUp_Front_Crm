import { Pencil, Plus, Trash2, UserRound } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Chip } from "@/shared/ui/chip";
import { DataTable, type Column, type SortState } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { ROLE_LABELS } from "@/core/auth";
import { cn } from "@/shared/lib/cn";
import type { User } from "../model/types";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  /** Filial nomini `branch_id` orqali ko'rsatish uchun. */
  branchNameOf: (branchId: string | null | undefined) => string;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
}

export function UserTable({
  users,
  isLoading,
  branchNameOf,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
  filtered,
}: UserTableProps) {
  const columns: Column<User>[] = [
    {
      key: "first_name",
      header: "Xodim",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-action-soft text-action-soft-text">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">
              {user.first_name} {user.last_name}
            </p>
            <p className="money text-xs text-ink-muted">{user.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      sortable: true,
      render: (user) => (
        <Chip tone={user.role === "ceo" || user.role === "admin" ? "brand" : "neutral"}>
          {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
        </Chip>
      ),
    },
    {
      key: "branch_id",
      header: "Filial",
      render: (user) => (
        <span
          className={cn("text-sm", user.branch_id ? "text-ink" : "text-ink-muted")}
        >
          {branchNameOf(user.branch_id)}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => (
        <span className={cn("text-sm", user.email ? "text-ink" : "text-ink-muted")}>
          {user.email ?? "—"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Holat",
      render: (user) => (
        <Chip tone={user.is_active ? "success" : "neutral"} dot>
          {user.is_active ? "Faol" : "Nofaol"}
        </Chip>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "104px",
      render: (user) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(user)}
            aria-label={`${user.first_name} ${user.last_name} ni tahrirlash`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(user)}
            aria-label={`${user.first_name} ${user.last_name} ni o'chirish`}
            className="text-danger-ink hover:bg-danger-soft hover:text-danger-ink"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={users}
      rowKey={(user) => user.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onEdit}
      empty={
        <EmptyState
          icon={<UserRound className="h-6 w-6" />}
          title="Xodim topilmadi"
          description={
            filtered
              ? "Qidiruv yoki filtrga mos xodim yo'q — filtrni o'zgartirib ko'ring."
              : "Jamoa a'zolarini qo'shing: har biriga rol beriladi va rol uning ruxsatlarini belgilaydi."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Xodim qo'shish
              </Button>
            )
          }
        />
      }
    />
  );
}
