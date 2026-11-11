import { useMemo, useState, type FormEvent } from "react";
import { BadgeCheck, Banknote, Clock, Wallet } from "lucide-react";

import {
  usePayrollAction,
  usePayrollAdjustmentCreate,
  usePayrollList,
  type Payroll,
} from "@/modules/payroll";
import { StatusBadge } from "@/core/status";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { DataTable, type Column } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { Input } from "@/shared/ui/input";
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
import { Textarea } from "@/shared/ui/textarea";
import { formatMoney, formatMonth, formatNumber } from "@/shared/lib";
import { useListState } from "@/shared/model";

const ADJUSTMENT_TYPES: Array<{ value: "bonus" | "fine" | "advance"; label: string }> = [
  { value: "bonus", label: "Bonus" },
  { value: "fine", label: "Jarima" },
  { value: "advance", label: "Avans" },
];

const ROLE_LABEL: Record<string, string> = {
  ceo: "Direktor",
  admin: "Administrator",
  teacher: "O'qituvchi",
  cashier: "Kassir",
  accountant: "Buxgalter",
};

export default function PayrollPage() {
  const list = useListState({ pageSize: 25 });

  /*
   * Oylar dinamik — joriy oydan orqaga 8 oy. Ilgari ro'yxat qo'lda yozilgan
   * (`2026-08..10`) va noyabrdan boshlab sahifa bo'sh ko'rinardi.
   */
  const months = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 8 }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return { value, label: formatMonth(value) };
    });
  }, []);

  const month = (list.filters.month as string | undefined) ?? months[0].value;
  const params = useMemo(
    () => ({ ...list.params, month }),
    [list.params, month],
  );

  const { data, isLoading } = usePayrollList(params);
  const rows = data?.results ?? [];
  const total = data?.count ?? 0;

  /* Oy bo'yicha yig'ma ko'rsatkichlar. */
  const { data: all } = usePayrollList({ page: 1, page_size: 100, month });
  const allRows = all?.results ?? [];
  const accrued = allRows.reduce((sum, row) => sum + row.final_amount_tiyin, 0);
  const paid = allRows
    .filter((row) => row.state === "PAID")
    .reduce((sum, row) => sum + row.final_amount_tiyin, 0);
  const pending = accrued - paid;

  const action = usePayrollAction();

  /* Tuzatish (bonus/jarima/avans) — faqat qoralama holatida. */
  const [adjusting, setAdjusting] = useState<Payroll | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"bonus" | "fine" | "advance">("bonus");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const adjustment = usePayrollAdjustmentCreate(() => {
    setAdjusting(null);
    setAdjustmentAmount("");
    setAdjustmentReason("");
  });

  const openAdjustment = (row: Payroll) => {
    setAdjusting(row);
    setAdjustmentType("bonus");
    setAdjustmentAmount("");
    setAdjustmentReason("");
  };

  const submitAdjustment = (event: FormEvent) => {
    event.preventDefault();
    if (!adjusting) return;
    const amount = Number(adjustmentAmount.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return;
    adjustment.mutate({
      payroll_id: adjusting.id,
      type: adjustmentType,
      amount_tiyin: Math.round(amount * 100),
      reason: adjustmentReason.trim() || undefined,
    });
  };

  const columns: Column<Payroll>[] = [
    {
      key: "user_name",
      header: "Xodim",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="od-truncate font-semibold text-ink">{row.user_name ?? "Xodim"}</p>
          <p className="od-truncate text-xs text-ink-muted">
            {ROLE_LABEL[row.role ?? ""] ?? row.role ?? "—"}
          </p>
        </div>
      ),
    },
    {
      key: "base_amount_tiyin",
      header: "Baza",
      align: "right",
      sortable: true,
      render: (row) => (
        <span className="money text-ink-secondary">{formatMoney(row.base_amount_tiyin)}</span>
      ),
    },
    {
      key: "adjustments_tiyin",
      header: "Tuzatish",
      align: "right",
      sortable: true,
      render: (row) => (
        <span
          className={
            row.adjustments_tiyin === 0
              ? "money text-ink-muted"
              : row.adjustments_tiyin > 0
                ? "money font-semibold text-success-ink"
                : "money font-semibold text-danger-ink"
          }
        >
          {row.adjustments_tiyin > 0 ? "+" : ""}
          {formatMoney(row.adjustments_tiyin)}
        </span>
      ),
    },
    {
      key: "final_amount_tiyin",
      header: "Yakuniy",
      align: "right",
      sortable: true,
      render: (row) => (
        <span className="money font-display font-extrabold text-ink">
          {formatMoney(row.final_amount_tiyin)}
        </span>
      ),
    },
    {
      key: "state",
      header: "Holat",
      render: (row) => <StatusBadge status={row.state} />,
    },
    {
      key: "actions",
      header: <span className="sr-only">Amallar</span>,
      align: "right",
      width: "200px",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.state === "DRAFT" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => openAdjustment(row)}>
                Tuzatish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => action.mutate({ id: row.id, action: "lock" })}
              >
                Qayd etish
              </Button>
            </>
          )}
          {row.state === "LOCKED" && (
            <Button size="sm" onClick={() => action.mutate({ id: row.id, action: "pay" })}>
              To'lash
            </Button>
          )}
          {row.state === "PAID" && <Chip tone="success">Yopilgan</Chip>}
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Ish haqi"
        subtitle="Oylik hisob-kitob: qoralama → qayd etilgan → to'langan"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Hisoblangan"
          value={formatMoney(accrued)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="To'langan"
          value={formatMoney(paid)}
          tone="success"
          icon={<BadgeCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Kutilmoqda"
          value={formatMoney(pending)}
          tone="warning"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={list.search}
            onChange={list.setSearch}
            placeholder="Xodim ismi…"
            className="w-full sm:w-[260px]"
          />

          <Select
            aria-label="Oy bo'yicha filtr"
            value={month}
            onChange={(event) => list.setFilter("month", event.target.value)}
            className="h-10 w-auto min-w-[170px]"
          >
            {months.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Holat bo'yicha filtr"
            value={list.filters.state ?? ""}
            onChange={(event) => list.setFilter("state", event.target.value)}
            className="h-10 w-auto min-w-[150px]"
          >
            <option value="">Barcha holat</option>
            <option value="DRAFT">Qoralama</option>
            <option value="LOCKED">Qayd etilgan</option>
            <option value="PAID">To'langan</option>
          </Select>

          <span className="ml-auto flex items-center gap-2 text-sm text-ink-muted">
            <Banknote className="h-4 w-4" />
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta yozuv
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          empty={
            <EmptyState
              icon={<Wallet className="h-6 w-6" />}
              title="Bu oyda hisob-kitob yo'q"
              description="Ish haqi loyihasi oy boshida avtomatik yaratiladi yoki qo'lda kiritiladi."
            />
          }
        />
      </Card>

      <Sheet
        open={Boolean(adjusting)}
        onOpenChange={(open) => {
          if (!open) setAdjusting(null);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <Banknote className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>Ish haqiga tuzatish</SheetTitle>
              <SheetDescription>
                {adjusting
                  ? `${adjusting.user_name ?? "Xodim"} · ${formatMonth(adjusting.month)} · joriy ${formatMoney(adjusting.final_amount_tiyin)}`
                  : "Bonus, jarima yoki avans qo'shish."}
              </SheetDescription>
            </div>
          </SheetHeader>

          {/*
            Forma butun tana va futerni o'rab turadi: ilgari yuborish tugmasi
            `form="…"` atributi bilan formadan tashqarida edi va portal ichida
            native submit React tomonidan ushlanmasdi — «Saqlash» hech narsa
            qilmasdi. Endi tugma formaning bevosita avlodi.
          */}
          <form
            onSubmit={submitAdjustment}
            className="flex min-h-0 flex-1 flex-col"
          >
            <SheetBody>
              <div className="grid gap-1.5">
                <label
                  htmlFor="payroll-adjustment-type"
                  className="text-xs font-semibold text-ink-secondary"
                >
                  Tuzatish turi
                </label>
                <Select
                  id="payroll-adjustment-type"
                  value={adjustmentType}
                  onChange={(event) =>
                    setAdjustmentType(event.target.value as "bonus" | "fine" | "advance")
                  }
                >
                  {ADJUSTMENT_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-ink-muted">
                  Bonus qo'shiladi; jarima va avans yakuniy summadan ayiriladi.
                </p>
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="payroll-adjustment-amount"
                  className="text-xs font-semibold text-ink-secondary"
                >
                  Summa (so'm)
                </label>
                <Input
                  id="payroll-adjustment-amount"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={adjustmentAmount}
                  onChange={(event) => setAdjustmentAmount(event.target.value)}
                  placeholder="200 000"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="payroll-adjustment-reason"
                  className="text-xs font-semibold text-ink-secondary"
                >
                  Izoh
                </label>
                <Textarea
                  id="payroll-adjustment-reason"
                  value={adjustmentReason}
                  onChange={(event) => setAdjustmentReason(event.target.value)}
                  placeholder="Masalan: o'quvchilarni jalb qilgani uchun bonus"
                  rows={3}
                />
              </div>

              {adjusting && adjusting.state !== "DRAFT" ? (
                <p className="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning-ink">
                  Bu yozuv qayd etilgan — tuzatish kiritilmaydi.
                </p>
              ) : null}
            </SheetBody>

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjusting(null)}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={
                  adjustment.isPending ||
                  !adjustmentAmount ||
                  Number(adjustmentAmount) <= 0 ||
                  adjusting?.state !== "DRAFT"
                }
              >
                {adjustment.isPending ? "Saqlanmoqda…" : "Saqlash"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
