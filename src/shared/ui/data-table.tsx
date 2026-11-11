import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Skeleton } from "./skeleton";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface Column<T> {
  /** Stable id, also used as the sort key when `sortable`. */
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  width?: string;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  /** Rendered inside the table when `rows` is empty and not loading. */
  empty?: ReactNode;
  sort?: SortState | null;
  onSortChange?: (key: string) => void;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
}

const ALIGN: Record<"left" | "right" | "center", string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

/**
 * Presentation-only table. Sorting, filtering and paging live in the page
 * (see `useListState`), so this stays reusable across every list screen.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  skeletonRows = 6,
  empty,
  sort,
  onSortChange,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-divider bg-surface-2/60">
            {columns.map((column) => {
              const align = column.align ?? "left";
              const isSorted = sort?.key === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  className={cn(
                    // `relative` — `sr-only` sarlavhalar (masalan "Amallar") shu katakka
                    // bog'lanadi. Aks holda ular jadvalning scroll konteyneridan
                    // chiqib ketib, sahifada gorizontal scroll hosil qiladi.
                    "relative whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted",
                    ALIGN[align],
                    column.headerClassName,
                  )}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key)}
                      aria-label={`${typeof column.header === "string" ? column.header : column.key} bo'yicha saralash`}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-ink",
                        isSorted && "text-ink",
                        align === "right" && "flex-row-reverse",
                      )}
                    >
                      {column.header}
                      {isSorted ? (
                        sort?.direction === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-45" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`} className="border-b border-divider last:border-0">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-5 py-4", ALIGN[column.align ?? "left"])}
                  >
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-divider last:border-0 transition-colors hover:bg-surface-2/50",
                  onRowClick && "cursor-pointer",
                  rowClassName?.(row),
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-5 py-3.5 align-middle text-ink",
                      ALIGN[column.align ?? "left"],
                      column.className,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
