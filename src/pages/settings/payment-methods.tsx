import { useState } from "react";
import { Pencil, Plus, Trash2, Wallet } from "lucide-react";

import {
  PaymentMethodForm,
  PAYMENT_METHOD_KIND_OPTIONS,
  usePaymentMethodCreate,
  usePaymentMethodList,
  usePaymentMethodRemove,
  usePaymentMethodUpdate,
  type PaymentMethodRecord,
  type PaymentMethodValues,
} from "@/modules/finance";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { ConfirmModal } from "@/shared/ui/modal";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { formatNumber } from "@/shared/lib";

const FORM_ID = "payment-method-form";

const KIND_LABEL: Record<string, string> = Object.fromEntries(
  PAYMENT_METHOD_KIND_OPTIONS.map((option) => [option.value, option.label]),
);

export default function SettingsPaymentMethodsPage() {
  const { data, isLoading } = usePaymentMethodList({ page: 1, page_size: 50, ordering: "sort_order" });
  const methods: PaymentMethodRecord[] = data?.results ?? [];

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PaymentMethodRecord | null>(null);
  const [deleting, setDeleting] = useState<PaymentMethodRecord | null>(null);

  const create = usePaymentMethodCreate(() => setCreating(false));
  const update = usePaymentMethodUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = usePaymentMethodRemove(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);
  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="To'lov turlari"
        subtitle="Kassa va moliya hisobotlari shu katalog asosida yig'iladi"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Tur qo'shish
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-divider bg-surface-2/60">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Nomi
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Guruh
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Tartib
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Holat
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Amal
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`} className="border-b border-divider">
                    {[0, 1, 2, 3, 4].map((cell) => (
                      <td key={cell} className="px-5 py-4">
                        <div className="h-3 w-24 rounded-md bg-surface-2" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : methods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyState
                      icon={<Wallet className="h-6 w-6" />}
                      title="To'lov turi yo'q"
                      description="To'lov qabul qilish uchun kamida bitta tur qo'shilishi kerak."
                      action={
                        <Button size="sm" onClick={() => setCreating(true)}>
                          Tur qo'shish
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                methods.map((method) => (
                  <tr key={method.id} className="border-b border-divider hover:bg-surface-2/50">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink">{method.name}</p>
                      <p className="money text-xs text-ink-muted">{method.code}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-secondary">
                      {KIND_LABEL[method.kind] ?? method.kind}
                    </td>
                    <td className="px-5 py-3.5 money text-ink">{formatNumber(method.sort_order)}</td>
                    <td className="px-5 py-3.5">
                      <Chip tone={method.is_active ? "success" : "neutral"} dot>
                        {method.is_active ? "Faol" : "No'faol"}
                      </Chip>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(method)}
                        className="mr-2 text-sm text-action-soft-text underline underline-offset-4 hover:text-action"
                      >
                        <Pencil className="mr-1 inline h-4 w-4" />
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(method)}
                        aria-label={`${method.name} turini o'chirish`}
                        className="text-sm text-danger-ink hover:opacity-80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "To'lov turini tahrirlash" : "Yangi to'lov turi"}</SheetTitle>
              <SheetDescription>
                Tur to'lov qabul qilish formasida va kassa hisobotida ko'rinadi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <PaymentMethodForm
              key={editing?.id ?? "new"}
              formId={`${FORM_ID}-${editing?.id ?? "new"}`}
              defaultValues={{
                name: editing?.name ?? "",
                code: editing?.code ?? "",
                kind: (editing?.kind as PaymentMethodValues["kind"]) ?? "cash",
                is_active: editing?.is_active ?? true,
              }}
              isPending={create.isPending || update.isPending}
              onSubmit={(values: PaymentMethodValues) => {
                if (editing) {
                  update.mutate(values);
                } else {
                  create.mutate(values);
                }
              }}
            />
          </SheetBody>

          <SheetFooter>
            <Button
              variant="ghost"
              onClick={closeForm}
              disabled={create.isPending || update.isPending}
            >
              Bekor qilish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="To'lov turini o'chirish"
        description={
          deleting
            ? `"${deleting.name}" turi o'chiriladi. Unda to'lovlar bo'lsa server o'chirishni rad etadi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
