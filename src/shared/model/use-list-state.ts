import { useCallback, useMemo, useState } from "react";

import type { ListQueryParams } from "@/shared/api";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import type { SortState } from "@/shared/ui/data-table";

export interface ListStateOptions {
  search?: string;
  filters?: Record<string, string>;
  page?: number;
  pageSize?: number;
  sort?: SortState | null;
  /** Extra params merged into every request (e.g. a fixed `branch_id`). */
  base?: ListQueryParams;
}

/**
 * One place to own the state every list screen shares: debounced search,
 * filters, paging and sorting. `params` is ready to hand straight to a
 * react-query list hook.
 */
export function useListState(options: ListStateOptions = {}) {
  const { base } = options;

  const [search, setSearchRaw] = useState(options.search ?? "");
  const [filters, setFiltersRaw] = useState<Record<string, string>>(options.filters ?? {});
  const [page, setPage] = useState(options.page ?? 1);
  const [pageSize, setPageSizeRaw] = useState(options.pageSize ?? 20);
  const [sort, setSort] = useState<SortState | null>(options.sort ?? null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPage(1);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFiltersRaw((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersRaw({});
    setSearchRaw("");
    setPage(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeRaw(size);
    setPage(1);
  }, []);

  const toggleSort = useCallback((key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null;
    });
  }, []);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => value && value !== "all").length,
    [filters],
  );

  const params = useMemo<ListQueryParams>(
    () => ({
      ...base,
      search: debouncedSearch.trim() || undefined,
      ...filters,
      page,
      page_size: pageSize,
      ordering: sort ? (sort.direction === "desc" ? `-${sort.key}` : sort.key) : undefined,
    }),
    [base, debouncedSearch, filters, page, pageSize, sort],
  );

  return {
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    toggleSort,
    params,
  };
}

export type ListState = ReturnType<typeof useListState>;
