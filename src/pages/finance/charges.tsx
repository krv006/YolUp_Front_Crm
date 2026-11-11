import { useState } from "react";
import { CalendarPlus, HandCoins, ReceiptText, TrendingUp, Wallet } from "lucide-react";

import {
  ChargeAccrualForm,
  ChargeForm,
  ChargeTable,
  chargePayload,
  recentPeriods,
  useChargeAccrue,
  useChargeList,
  useChargeRemove,
  useChargeUpdate,
  type Charge,
  type ChargeAccrualFormValues,
  type ChargeFormValues,
} from "@/modules/finance";
import { useGroupList } from "@/modules/groups";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ConfirmModal } from "@/shared/ui/modal";
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
import { formatMoney, tiyinToSom } from "@/shared/lib";
import { useListState } from "@/shared/model";

const ACCRUAL_FORM_ID = "charge-accrual-form";
const CHARGE_FORM_ID = "charge-form";

export default function FinanceChargesPage() {
  const list = useListState({ pageSize: 10 });

  const { data: page, isLoading } = useChargeList(list.params);
  /* Yig'ma ko'rsatkichlar — demo hajmda to'liq ro'yxatdan hisoblanadi. */
  const { data: totals } = useChargeList({ page: 1, page_size: 500 });
  const { data: groupsData } = useGroupList({ page: 1, page_size: 100 });

  const charges = page?.results ?? [];
  const allCharges = totals?.results ?? [];

  const charged = allCharges.reduce((sum, charge) => sum + (charge.total_tiyin ?? 0), 0);
  const paid = allCharges.reduce((sum, charge) => sum + (charge.paid_tiyin ?? 0), 0);
  const overdue = allCharges
    .filter((charge) => charge.is_overdue === true)
    .reduce((sum, charge) => sum + (charge.debt_tiyin ?? 0), 0);
  const openCount = allCharges.filter((charge) => (charge.debt_tiyin ?? 0) > 0).length;

  const groupOptions = (groupsData?.results ?? []).map((group) => ({
    id: group.id,
    name: group.name,
  }));
  const periods = recentPeriods(12);

  const [accrualOpen, setAccrualOpen] = useState(false);
  const [editing, setEditing] = useState<Charge | null>(null);
  const [deleting, setDeleting] = useState<Charge | null>(null);

  const accrue = useChargeAccrue(() => setAccrualOpen(false));
  const update = useChargeUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useChargeRemove(() => setDeleting(null));

  const filtered = Boolean(list.search || list.activeFilterCount);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Hisob-fakturalar"
        subtitle="Oylik hisob-kitob (billing) — guruh bo'yicha yozuvlar"
        actions={
          <Button onClick={() => setAccrualOpen(true)}>
            <CalendarPlus className="h-4 w-4" />
            Oylik hisoblash
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label="Hisoblangan"
          value={formatMoney(charged)}
          tone="info"
          icon={<ReceiptText className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="To'langan"
          value={formatMoney(paid)}
          tone="success"
          icon={<TrendingUp className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="Qarz"
          value={formatMoney(Math.max(0, charged - paid))}
          tone={charged - paid > 0 ? "warning" : "success"}
          icon={<HandCoins className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="Muddati o'tgan"
          value={formatMoney(overdue)}
          tone={overdue > 0 ? "danger" : "neutral"}
          icon={<Wallet className="h-5 w-5" />}
          size="sm"
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={list.search}
            onChange={list.setSearch}
            placeholder="O'quvchi yoki guruh…"
            size="sm"
            className="w-full sm:w-[240px]"
          />

          <Select
            aria-label="Guruh bo'yicha filtr"
            value={list.filters.group_id ?? ""}
            onChange={(event) => list.setFilter("group_id", event.target.value)}
            className="h-9 text-sm"
            wrapperClassName="w-auto min-w-[180px] max-w-[240px]"
          >
            <option value="">Barcha guruhlar</option>
            {groupOptions.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Davr bo'yicha filtr"
            value={list.filters.period ?? ""}
            onChange={(event) => list.setFilter("period", event.target.value)}
            className="h-9 text-sm"
            wrapperClassName="w-auto min-w-[150px]"
          >
            <option value="">Barcha davrlar</option>
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Holat bo'yicha filtr"
            value={list.filters.status ?? ""}
            onChange={(event) => list.setFilter("status", event.target.value)}
            className="h-9 text-sm"
            wrapperClassName="w-auto min-w-[150px]"
          >
            <option value="">Barcha holat</option>
            <option value="unpaid">To'lanmagan</option>
            <option value="partial">Qismli</option>
            <option value="paid">To'langan</option>
          </Select>

          <span className="ml-auto text-sm text-ink-muted">
            <span className="money font-semibold text-ink">{page?.count ?? 0}</span> ta yozuv ·{" "}
            {openCount} ta yopilmagan
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <ChargeTable
          charges={charges}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onAccrue={() => setAccrualOpen(true)}
          onEdit={setEditing}
          onDelete={setDeleting}
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

      <Sheet open={accrualOpen} onOpenChange={setAccrualOpen}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <CalendarPlus className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>Oylik hisoblash</SheetTitle>
              <SheetDescription>
                Guruhdagi har bir o'quvchi uchun tanlangan davrga hisob-faktura yaratiladi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <ChargeAccrualForm
              formId={ACCRUAL_FORM_ID}
              groups={groupOptions}
              periods={periods}
              isPending={accrue.isPending}
              onSubmit={(values: ChargeAccrualFormValues) => accrue.mutate(values)}
            />
          </SheetBody>

          <SheetFooter>
            <Button
              variant="ghost"
              onClick={() => setAccrualOpen(false)}
              disabled={accrue.isPending}
            >
              Yopish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <ReceiptText className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>Hisob-fakturani tahrirlash</SheetTitle>
              <SheetDescription>
                {editing?.student_name ?? "O'quvchi"} · {editing?.group_name ?? "Guruh"}
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            {editing && (
              <ChargeForm
                key={editing.id}
                formId={CHARGE_FORM_ID}
                defaultValues={{
                  amount_som: tiyinToSom(editing.amount_tiyin),
                  discount_som: tiyinToSom(editing.discount_tiyin),
                  due_date: editing.due_date,
                }}
                isPending={update.isPending}
                onSubmit={(values: ChargeFormValues) => update.mutate(chargePayload(values))}
              />
            )}
          </SheetBody>

          <SheetFooter>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={update.isPending}>
              Bekor qilish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Hisob-fakturani o'chirish"
        description={
          deleting
            ? `${deleting.student_name ?? "O'quvchi"} uchun ${deleting.period} davri yozuvi o'chiriladi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
