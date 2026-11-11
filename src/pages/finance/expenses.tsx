import { useState } from "react";
import { TrendingDown } from "lucide-react";

import {
  ExpenseForm,
  ExpenseTable,
  expensePayload,
  useExpenseCategoryList,
  useExpenseCreate,
  useExpenseList,
  type ExpenseValues,
} from "@/modules/finance";
import { useBranchList } from "@/modules/branches";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { Pagination } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";
import { Select } from "@/shared/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { useListState } from "@/shared/model";

const EXPENSE_FORM_ID = "expense-form";

export default function FinanceExpensesPage() {
  const list = useListState({ pageSize: 10 });

  const { data: page, isLoading } = useExpenseList(list.params);
  const { data: categoriesData } = useExpenseCategoryList({ page: 1, page_size: 50 });
  const { data: branchesData } = useBranchList({ page: 1, page_size: 100 });

  const expenses = page?.results ?? [];

  const categoryOptions = (categoriesData?.results ?? []).map((category) => ({
    id: category.id,
    name: category.name,
  }));
  const branchOptions = (branchesData?.results ?? []).map((branch) => ({
    id: branch.id,
    name: branch.name,
  }));

  const [expenseOpen, setExpenseOpen] = useState(false);
  const createExpense = useExpenseCreate(() => setExpenseOpen(false));

  const filtered = Boolean(list.search || list.activeFilterCount);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Xarajatlar"
        subtitle="Kassa chiqimlari — sof foydadan ayiriladi"
        actions={
          <Button onClick={() => setExpenseOpen(true)}>
            <TrendingDown className="h-4 w-4" />
            Xarajat qo'shish
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={list.search}
            onChange={list.setSearch}
            placeholder="Izoh yoki kategoriya…"
            size="sm"
            className="w-full sm:w-[240px]"
          />

          <Select
            aria-label="Kategoriya bo'yicha filtr"
            value={list.filters.category_id ?? ""}
            onChange={(event) => list.setFilter("category_id", event.target.value)}
            className="h-9 text-sm"
            wrapperClassName="w-auto min-w-[170px]"
          >
            <option value="">Barcha kategoriyalar</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <span className="ml-auto text-sm text-ink-muted">
            <span className="money font-semibold text-ink">{page?.count ?? 0}</span> ta xarajat
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <ExpenseTable
          expenses={expenses}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onCreate={() => setExpenseOpen(true)}
          onClearFilters={list.resetFilters}
          filtered={filtered}
        />
      </Card>

      {(page?.count ?? 0) > 0 && (
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={page?.count ?? 0}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
        />
      )}

      <Sheet open={expenseOpen} onOpenChange={setExpenseOpen}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-danger-soft text-danger-ink">
              <TrendingDown className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>Xarajat qo'shish</SheetTitle>
              <SheetDescription>
                Xarajatlar sof foydadan ayiriladi va P&L hisobotida ko'rinadi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <ExpenseForm
              key={expenseOpen ? "open" : "closed"}
              formId={EXPENSE_FORM_ID}
              categories={categoryOptions}
              branches={branchOptions}
              onSubmit={(values: ExpenseValues) => createExpense.mutate(expensePayload(values))}
            />
          </SheetBody>

          <SheetFooter>
            <Button
              variant="ghost"
              onClick={() => setExpenseOpen(false)}
              disabled={createExpense.isPending}
            >
              Bekor qilish
            </Button>
            <Button type="submit" form={EXPENSE_FORM_ID} loading={createExpense.isPending}>
              Qo'shish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
