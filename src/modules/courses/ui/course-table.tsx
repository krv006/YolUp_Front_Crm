import { BookOpen, Eye, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";

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
import { formatMoney, formatNumber } from "@/shared/lib";
import type { Course } from "../model/types";

interface CourseTableProps {
  courses: Course[];
  isLoading: boolean;
  sort: SortState | null;
  onSortChange: (key: string) => void;
  onOpen: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  filtered: boolean;
  /** Kurs id → bog'langan guruhlar soni (guruhlardan hisoblanadi). */
  groupCounts: Record<string, number>;
}

function durationLabel(course: Course): string {
  return course.duration_months != null && course.duration_months > 0
    ? `${formatNumber(course.duration_months)} oy`
    : "—";
}

function lessonsLabel(course: Course): string {
  return course.lessons_count != null && course.lessons_count > 0
    ? `${formatNumber(course.lessons_count)} dars`
    : "dars soni yo'q";
}

export function CourseTable({
  courses,
  isLoading,
  sort,
  onSortChange,
  onOpen,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
  filtered,
  groupCounts,
}: CourseTableProps) {
  const columns: Column<Course>[] = [
    {
      key: "name",
      header: "Kurs",
      sortable: true,
      render: (course) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-sm bg-action-soft text-action-soft-text">
            <BookOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">{course.name}</p>
            <p className="od-truncate text-xs text-ink-muted">
              {(course.code ?? "").length > 0 ? `${course.code} · ` : ""}
              ID: {course.id.slice(-6)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "price_tiyin",
      header: "Oylik narx",
      align: "right",
      sortable: true,
      render: (course) => (
        <div>
          <p className="money font-semibold text-ink">{formatMoney(course.price_tiyin)}</p>
          <p className="text-xs text-ink-muted">oyiga</p>
        </div>
      ),
    },
    {
      key: "duration_months",
      header: "Davomiylik",
      sortable: true,
      render: (course) => (
        <div>
          <p className="font-semibold text-ink">{durationLabel(course)}</p>
          <p className="text-xs text-ink-muted">{lessonsLabel(course)}</p>
        </div>
      ),
    },
    {
      key: "groups",
      header: "Guruhlar",
      render: (course) => {
        const count = groupCounts[course.id] ?? 0;
        return (
          <button
            type="button"
            onClick={() => onOpen(course)}
            title={`${course.name} — guruhlarni ko'rish`}
            className={cn(
              "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold transition-shadow hover:shadow-[var(--focus-ring)]",
              count > 0
                ? "bg-action-soft text-action-soft-text"
                : "bg-neutral-soft text-ink-secondary",
            )}
          >
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {count > 0 ? `${formatNumber(count)} ta guruh` : "Guruh yo'q"}
          </button>
        );
      },
    },
    {
      key: "is_active",
      header: "Holat",
      render: (course) => (
        <Chip tone={course.is_active ? "success" : "neutral"} dot>
          {course.is_active ? "Faol" : "Arxiv"}
        </Chip>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "104px",
      render: (course) => {
        const count = groupCounts[course.id] ?? 0;
        const blocked = count > 0;

        const deleteItem = (
          <DropdownMenuItem
            disabled={blocked}
            onSelect={() => onDelete(course)}
            className="text-danger-ink focus:bg-danger-soft"
          >
            <Trash2 className="h-4 w-4" />
            O'chirish
          </DropdownMenuItem>
        );

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(course)}
              aria-label={`${course.name} kursini tahrirlash`}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`${course.name} uchun amallar`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onOpen(course)}>
                  <Eye className="h-4 w-4" />
                  Batafsil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(course)}>
                  <Pencil className="h-4 w-4" />
                  Tahrirlash
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
                    title={`${count} ta guruh bog'langan — avval guruhlarni boshqa kursga o'tkazing yoki o'chiring`}
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
      rows={courses}
      rowKey={(course) => course.id}
      isLoading={isLoading}
      sort={sort}
      onSortChange={onSortChange}
      empty={
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Kurs topilmadi"
          description={
            filtered
              ? "Qidiruvga mos kurs yo'q. Filtrni o'zgartirib ko'ring."
              : "Kurs — markazning o'quv mahsuloti: narx, davomiylik va guruhlar shundan boshlanadi. Birinchi kursni qo'shing."
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Filtrlarni tozalash
              </Button>
            ) : (
              <Button size="sm" onClick={onCreate}>
                <Plus className="h-4 w-4" />
                Kurs qo'shish
              </Button>
            )
          }
        />
      }
    />
  );
}
