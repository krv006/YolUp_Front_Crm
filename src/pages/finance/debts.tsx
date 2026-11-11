import { useState } from "react";
import { HandCoins, ReceiptText, TrendingDown, Users } from "lucide-react";

import {
  DebtTable,
  formatPeriod,
  useChargeList,
  useDebtList,
  type DebtRow,
} from "@/modules/finance";
import { useBranchList } from "@/modules/branches";
import { StatusBadge } from "@/core/status";
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
import { StatCard } from "@/shared/ui/stat-card";
import { Switch } from "@/shared/ui/switch";
import { formatMoney, formatNumber } from "@/shared/lib";
import { useListState } from "@/shared/model";

export default function FinanceDebtsPage() {
  /* Standart holat: faqat qarzi borlar ko'rsatiladi. */
  const list = useListState({ pageSize: 10, filters: { only_debt: "true" } });

  const { data: page, isLoading } = useDebtList(list.params);
  const { data: allDebts } = useDebtList({ page: 1, page_size: 500, only_debt: "true" });
  const { data: branchesData } = useBranchList({ page: 1, page_size: 100 });

  const debts = page?.results ?? [];
  const debtRows = allDebts?.results ?? [];

  const totalDebt = debtRows.reduce((sum, row) => sum + row.debt_tiyin, 0);
  const overdue = debtRows.reduce((sum, row) => sum + row.overdue_tiyin, 0);
  const charged = debtRows.reduce((sum, row) => sum + row.charged_tiyin, 0);
  const overdueCount = debtRows.filter((row) => row.overdue_tiyin > 0).length;

  const branchOptions = (branchesData?.results ?? []).map((branch) => ({
    id: branch.id,
    name: branch.name,
  }));

  const onlyDebt = (list.filters.only_debt ?? "true") !== "false";
  const overdueOnly = list.filters.overdue === "true";

  const [student, setStudent] = useState<DebtRow | null>(null);
  const { data: studentCharges } = useChargeList({
    student_id: student?.student_id,
    page: 1,
    page_size: 50,
  });

  const filtered = Boolean(list.search || list.activeFilterCount);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Qarzlar"
        subtitle="Hisob-fakturalar asosida o'quvchilar kesimidagi qoldiq"
      />

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label="Umumiy qarz"
          value={formatMoney(totalDebt)}
          tone={totalDebt > 0 ? "warning" : "success"}
          icon={<HandCoins className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="Muddati o'tgan"
          value={formatMoney(overdue)}
          tone={overdue > 0 ? "danger" : "neutral"}
          icon={<TrendingDown className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="Qarzdorlar"
          value={formatNumber(debtRows.length)}
          hint={overdueCount > 0 ? `${overdueCount} tasida muddat o'tgan` : undefined}
          tone="info"
          icon={<Users className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="Jami hisoblangan"
          value={formatMoney(charged)}
          tone="neutral"
          icon={<ReceiptText className="h-5 w-5" />}
          size="sm"
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={list.search}
            onChange={list.setSearch}
            placeholder="O'quvchi yoki telefon…"
            size="sm"
            className="w-full sm:w-[240px]"
          />

          <Select
            aria-label="Filial bo'yicha filtr"
            value={list.filters.branch_id ?? ""}
            onChange={(event) => list.setFilter("branch_id", event.target.value)}
            className="h-9 text-sm"
            wrapperClassName="w-auto min-w-[180px]"
          >
            <option value="">Barcha filiallar</option>
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>

          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <Switch
              checked={onlyDebt}
              onCheckedChange={(checked) =>
                list.setFilter("only_debt", checked ? "true" : "false")
              }
              aria-label="Faqat qarzdorlar"
            />
            Faqat qarzdorlar
          </label>

          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <Switch
              checked={overdueOnly}
              onCheckedChange={(checked) =>
                list.setFilter("overdue", checked ? "true" : "false")
              }
              aria-label="Muddati o'tganlar"
            />
            Muddati o'tganlar
          </label>

          <span className="ml-auto text-sm text-ink-muted">
            <span className="money font-semibold text-ink">{page?.count ?? 0}</span> ta o'quvchi
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <DebtTable
          debts={debts}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onViewCharges={setStudent}
          onClearFilters={list.resetFilters}
          filtered={filtered}
          onlyDebt={onlyDebt}
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

      <Sheet open={Boolean(student)} onOpenChange={(open) => !open && setStudent(null)}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-warning-soft text-warning-ink">
              <HandCoins className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{student?.student_name ?? "O'quvchi"}</SheetTitle>
              <SheetDescription>
                {student?.group_names ?? "Guruh yo'q"} · {student?.phone ?? "Telefon yo'q"}
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            {student && (
              <div className="grid gap-3 rounded-lg border border-border bg-surface-inset p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-muted">Hisoblangan</span>
                  <span className="money font-semibold text-ink">
                    {formatMoney(student.charged_tiyin)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-muted">To'langan</span>
                  <span className="money font-semibold text-ink">
                    {formatMoney(student.paid_tiyin)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink-muted">Qoldiq</span>
                  <span
                    className={
                      student.debt_tiyin > 0
                        ? "money font-display text-lg font-extrabold text-danger-ink"
                        : "money font-display text-lg font-extrabold text-success-ink"
                    }
                  >
                    {student.debt_tiyin > 0
                      ? formatMoney(student.debt_tiyin)
                      : `+${formatMoney(student.advance_tiyin)}`}
                  </span>
                </div>
              </div>
            )}

            <ul className="mt-4 divide-y divide-divider rounded-lg border border-border">
              {(studentCharges?.results ?? []).map((charge) => (
                <li
                  key={charge.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{formatPeriod(charge.period)}</p>
                    <p className="text-xs text-ink-muted">{charge.due_date} gacha</p>
                  </div>
                  <div className="flex flex-none items-center gap-3">
                    <span className="money text-ink-secondary">
                      {formatMoney(charge.total_tiyin ?? charge.amount_tiyin)}
                    </span>
                    <StatusBadge
                      status={charge.status ?? "unpaid"}
                      label={
                        charge.status === "paid"
                          ? "To'langan"
                          : charge.status === "partial"
                            ? "Qismli"
                            : "To'lanmagan"
                      }
                      tone={charge.is_overdue === true ? "danger" : undefined}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </SheetBody>

          <SheetFooter>
            <Button variant="ghost" onClick={() => setStudent(null)}>
              Yopish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
