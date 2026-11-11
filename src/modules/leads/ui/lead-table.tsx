import { MoreHorizontal, Pencil, Plus, School as SchoolIcon, Trash2, UserRound } from "lucide-react";

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
import { formatDate } from "@/shared/lib";
import { leadName } from "./lead-card";
import { STAGE_COLORS, type LeadStageColumn } from "./lead-board";
import type { Lead } from "../model/types";

const TEMPERATURE: Record<string, { label: string; tone: "danger" | "warning" | "info" }> = {
  hot: { label: "Issiq", tone: "danger" },
  warm: { label: "Iliq", tone: "warning" },
  cold: { label: "Sovuq", tone: "info" },
};

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  stages: LeadStageColumn[];
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onOpen: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
}

export function LeadTable({
  leads,
  isLoading,
  stages,
  sort,
  onSortChange,
  onOpen,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
  filtered,
}: LeadTableProps) {
  const columns: Column<Lead>[] = [
    {
      key: "first_name",
      header: "Lid",
      sortable: true,
      render: (lead) => (
        <div className="min-w-0">
          <p className="od-truncate font-semibold text-ink">{leadName(lead)}</p>
          <p className="money od-truncate text-xs text-ink-muted">{lead.phone}</p>
        </div>
      ),
    },
    {
      key: "source_name",
      header: "Manba",
      render: (lead) => (
        <span className="od-truncate text-ink-secondary">{lead.source_name ?? "—"}</span>
      ),
    },
    {
      key: "school_name",
      header: "Maktab",
      render: (lead) =>
        lead.school_name ? (
          <span className="flex items-center gap-2 text-ink-secondary">
            <SchoolIcon className="h-3.5 w-3.5 flex-none text-ink-muted" />
            <span className="od-truncate">{lead.school_name}</span>
          </span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: "teacher_name",
      header: "Mas'ul",
      render: (lead) => (
        <span className="flex items-center gap-2 text-ink-secondary">
          <UserRound className="h-3.5 w-3.5 flex-none text-ink-muted" />
          <span className="od-truncate">{lead.teacher_name ?? "Tayinlanmagan"}</span>
        </span>
      ),
    },
    {
      key: "temperature",
      header: "Harorat",
      render: (lead) => {
        const item = lead.temperature ? TEMPERATURE[lead.temperature] : null;
        return item ? <Chip tone={item.tone}>{item.label}</Chip> : <span className="text-ink-muted">—</span>;
      },
    },
    {
      key: "stage",
      header: "Bosqich",
      sortable: true,
      render: (lead) => {
        const column = stages.find((item) => item.value === lead.stage);
        return column ? (
          <StatusBadge
            status={lead.stage}
            label={column.label}
            tone={STAGE_COLORS[column.color].chip}
          />
        ) : (
          <StatusBadge status={lead.stage} />
        );
      },
    },
    {
      key: "created_at",
      header: "Qo'shilgan",
      align: "right",
      sortable: true,
      render: (lead) => (
        <span className="money text-ink-secondary">{formatDate(lead.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "128px",
      render: (lead) => (
        <div
          className="flex items-center justify-end gap-1"
          /* Qatorning o'zi "Batafsil"ni ochadi — ichki tugmalar to'xtatiladi. */
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(lead)}
            aria-label={`${leadName(lead)} lidini tahrirlash`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`${leadName(lead)} uchun amallar`}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onOpen(lead)}>Batafsil</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit(lead)}>
                <Pencil className="h-4 w-4" />
                Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete(lead)}
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
      rows={leads}
      rowKey={(lead) => lead.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onOpen}
      empty={
        <EmptyState
          icon={<UserRound className="h-6 w-6" />}
          title="Lid topilmadi"
          description={
            filtered
              ? "Qidiruv yoki filtrga mos lid yo'q."
              : "Lidlar — yangi mijozlar oqimi. Birinchi lidni qo'shing."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Yangi lid
              </Button>
            )
          }
        />
      }
    />
  );
}
