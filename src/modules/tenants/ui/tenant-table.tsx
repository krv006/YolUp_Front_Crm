import {
  Building2,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldBan,
  Trash2,
} from "lucide-react";

import { StatusBadge } from "@/core/status";
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
import { formatDate, formatNumber } from "@/shared/lib";
import type { Tenant } from "../model/types";

const TIER_LABEL: Record<Tenant["subscription_tier"], string> = {
  basic: "Basic",
  standard: "Standard",
  professional: "Professional",
  enterprise: "Enterprise",
};

const TIER_TONE: Record<Tenant["subscription_tier"], "neutral" | "info" | "brand" | "success"> = {
  basic: "neutral",
  standard: "info",
  professional: "brand",
  enterprise: "success",
};

interface TenantTableProps {
  tenants: Tenant[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onToggleBlock: (tenant: Tenant) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
}

export function TenantTable({
  tenants,
  isLoading,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onToggleBlock,
  onCreate,
  onClearFilters,
  filtered,
}: TenantTableProps) {
  const columns: Column<Tenant>[] = [
    {
      key: "name",
      header: "Markaz",
      sortable: true,
      render: (tenant) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-sm bg-surface-2 text-ink-muted">
            <Building2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="od-truncate font-semibold text-ink">{tenant.name}</p>
            <p className="od-truncate text-xs text-ink-muted">{tenant.slug}.yolup.uz</p>
          </div>
        </div>
      ),
    },
    {
      key: "subscription_tier",
      header: "Tarif",
      sortable: true,
      render: (tenant) => (
        <Chip tone={TIER_TONE[tenant.subscription_tier]}>
          {TIER_LABEL[tenant.subscription_tier]}
        </Chip>
      ),
    },
    {
      key: "subscription_status",
      header: "Obuna",
      render: (tenant) => <StatusBadge status={tenant.subscription_status} />,
    },
    {
      key: "max_students",
      header: "Limit",
      align: "right",
      sortable: true,
      render: (tenant) => (
        <span className="money text-ink-secondary">
          {tenant.max_students ? formatNumber(tenant.max_students) : "∞"}
        </span>
      ),
    },
    {
      key: "subscription_expires_at",
      header: "Muddat",
      align: "right",
      sortable: true,
      render: (tenant) => (
        <span className="money text-ink-secondary">
          {formatDate(tenant.subscription_expires_at)}
        </span>
      ),
    },
    {
      key: "is_blocked",
      header: "Holat",
      render: (tenant) => (
        <Chip tone={tenant.is_blocked ? "danger" : "success"} dot>
          {tenant.is_blocked ? "Bloklangan" : "Ochiq"}
        </Chip>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "104px",
      render: (tenant) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(tenant)}
            aria-label={`${tenant.name} markazini tahrirlash`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`${tenant.name} uchun amallar`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(tenant)}>
                <Pencil className="h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onToggleBlock(tenant)}>
                {tenant.is_blocked ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Blokdan chiqarish
                  </>
                ) : (
                  <>
                    <ShieldBan className="h-4 w-4" />
                    Bloklash
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(tenant)}
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
      rows={tenants}
      rowKey={(tenant) => tenant.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      empty={
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Markaz topilmadi"
          description={
            filtered
              ? "Qidiruv yoki filtrga mos markaz yo'q."
              : "Operator panelida hali markaz yo'q."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Markaz qo'shish
              </Button>
            )
          }
        />
      }
    />
  );
}
