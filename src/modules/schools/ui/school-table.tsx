import { Eye, MoreHorizontal, Pencil, Plus, School as SchoolIcon, Trash2, Users } from "lucide-react";

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
import { cn } from "@/shared/lib/cn";
import { formatDate, formatNumber } from "@/shared/lib";
import { schoolTypeLabel } from "../model/labels";
import type { School } from "../model/types";

interface SchoolTableProps {
  schools: School[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onOpen: (school: School) => void;
  onOpenLeads: (school: School) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
}

export function SchoolTable({
  schools,
  isLoading,
  sort,
  onSortChange,
  onOpen,
  onOpenLeads,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
  filtered,
}: SchoolTableProps) {
  const columns: Column<School>[] = [
    {
      key: "name",
      header: "Maktab",
      sortable: true,
      render: (school) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-sm bg-action-soft text-action-soft-text">
            <SchoolIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">{school.name}</p>
            <p className="od-truncate text-xs text-ink-muted">
              {schoolTypeLabel(school.type)}
              {(school.address ?? "").length > 0 ? ` · ${school.address}` : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "district",
      header: "Tuman",
      sortable: true,
      render: (school) => (
        <span
          className={cn(
            "text-sm",
            (school.district ?? "").length > 0 ? "text-ink" : "text-ink-muted",
          )}
        >
          {school.district ?? "—"}
        </span>
      ),
    },
    {
      key: "contact_person",
      header: "Mas'ul",
      render: (school) => (
        <div className="min-w-0">
          <p
            className={cn(
              "text-sm",
              (school.contact_person ?? "").length > 0 ? "text-ink" : "text-ink-muted",
            )}
          >
            {school.contact_person ?? "Kiritilmagan"}
          </p>
          {(school.phone ?? "").length > 0 && (
            <p className="money od-truncate text-xs text-ink-muted">{school.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "leads",
      header: "Lidlar",
      align: "right",
      render: (school) => {
        const leads = school.leads_count ?? 0;
        const enrolled = school.enrolled_count ?? 0;
        const rate = school.conversion_rate ?? 0;

        return (
          <button
            type="button"
            onClick={(event) => {
              // Qator ham bosiladigan — "Batafsil" oynasi ochilib ketmasin.
              event.stopPropagation();
              onOpenLeads(school);
            }}
            disabled={leads === 0}
            title={
              leads > 0
                ? `${school.name} — lidlarni ko'rish`
                : `${school.name}dan hali lid kelmagan`
            }
            className={cn(
              "inline-flex flex-col items-end rounded-sm px-2 py-1 text-right transition-colors",
              leads > 0
                ? "hover:bg-action-soft/60"
                : "cursor-default text-ink-muted opacity-70",
            )}
          >
            <span className="money text-sm font-semibold text-ink">
              {leads > 0 ? `${formatNumber(leads)} ta` : "0 ta"}
            </span>
            {leads > 0 && (
              <span className="text-xs text-ink-muted">
                {formatNumber(enrolled)} o'quvchi · {rate}%
              </span>
            )}
          </button>
        );
      },
    },
    {
      key: "partner_since",
      header: "Hamkorlikdan",
      sortable: true,
      render: (school) =>
        (school.partner_since ?? "").length > 0 ? (
          <span className="text-sm text-ink">{formatDate(school.partner_since)}</span>
        ) : (
          <span className="text-sm text-ink-muted">Hamkor emas</span>
        ),
    },
    {
      key: "is_active",
      header: "Holat",
      render: (school) => (
        <Chip tone={school.is_active ? "success" : "neutral"} dot>
          {school.is_active ? "Faol" : "Nofaol"}
        </Chip>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "104px",
      render: (school) => {
        const leads = school.leads_count ?? 0;
        const blocked = leads > 0;

        const deleteItem = (
          <DropdownMenuItem
            disabled={blocked}
            onSelect={() => onDelete(school)}
            className="text-danger-ink focus:bg-danger-soft"
          >
            <Trash2 className="h-4 w-4" />
            O'chirish
          </DropdownMenuItem>
        );

        return (
          <div
            className="flex items-center justify-end gap-1"
            /* Qatorning o'zi "Batafsil"ni ochadi — ichki tugmalar to'xtatiladi. */
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpen(school)}
              aria-label={`${school.name} maktabi tafsilotlari`}
            >
              <Eye className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`${school.name} uchun amallar`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onOpen(school)}>
                  <Eye className="h-4 w-4" />
                  Batafsil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(school)}>
                  <Pencil className="h-4 w-4" />
                  Tahrirlash
                </DropdownMenuItem>
                <DropdownMenuItem disabled={leads === 0} onSelect={() => onOpenLeads(school)}>
                  <Users className="h-4 w-4" />
                  Lidlarini ko'rish
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/*
                  Radix o'chirilgan elementga `pointer-events: none` beradi va
                  native tooltip ko'rinmay qoladi — shuning uchun izoh tashqi
                  o'ramda turadi.
                */}
                {blocked ? (
                  <span
                    className="block"
                    title={`${leads} ta lid bog'langan — avval ularni boshqa maktabga o'tkazing`}
                  >
                    {deleteItem}
                  </span>
                ) : (
                  deleteItem
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={schools}
      rowKey={(school) => school.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={onOpen}
      empty={
        <EmptyState
          icon={<SchoolIcon className="h-6 w-6" />}
          title="Maktab topilmadi"
          description={
            filtered
              ? "Qidiruvga mos maktab yo'q. Filtrni o'zgartirib ko'ring."
              : "Maktablar katalogi lidlarning manbasini kuzatish uchun kerak: qaysi maktabdan qancha lid kelgani va qanchasi o'quvchiga aylangani shu yerda ko'rinadi."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Maktab qo'shish
              </Button>
            )
          }
        />
      }
    />
  );
}
