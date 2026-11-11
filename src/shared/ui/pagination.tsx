import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib/format";
import { Button } from "./button";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const DEFAULT_SIZES = [10, 20, 50, 100];

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_SIZES,
  className,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-sm text-ink-muted">
        {total === 0 ? (
          "Natija yo'q"
        ) : (
          <>
            <span className="money font-semibold text-ink">
              {from}–{to}
            </span>{" "}
            / {formatNumber(total)} ta
          </>
        )}
      </p>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            <span className="hidden sm:inline">Sahifada</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="Sahifa hajmi"
              className="h-9 rounded-md border border-border-strong bg-surface px-2 text-sm text-ink transition-colors hover:border-ink-muted focus:border-action focus:outline-none"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Oldingi sahifa"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="money px-2 text-sm font-semibold text-ink">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Keyingi sahifa"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
