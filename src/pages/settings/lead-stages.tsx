import { useState } from "react";
import { Filter, Pencil, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  LEAD_STAGES,
  STAGE_COLORS,
  STAGE_COLOR_ORDER,
  useLeadStageCreate,
  useLeadStageDelete,
  useLeadStageUpdate,
  useLeadStages,
  type LeadStageColor,
  type LeadStageRecord,
} from "@/modules/leads";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { ConfirmModal } from "@/shared/ui/modal";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { PageHeader } from "@/shared/ui/page-header";
import { cn } from "@/shared/lib/cn";
import { formatNumber } from "@/shared/lib";

const stageSchema = z.object({
  name: z.string().min(1, "Ustun nomi majburiy").max(40, "Juda uzun nom"),
  color: z.enum(["action", "info", "success", "warning", "danger", "neutral"]),
  is_active: z.boolean().default(true),
});

type StageFormValues = z.infer<typeof stageSchema>;

/** Tizim bosqichlari kalitlari — ular o'chirilmaydi va tahrirlanmaydi. */
const SYSTEM_VALUES = new Set(LEAD_STAGES.map((stage) => stage.value));

export default function SettingsLeadStagesPage() {
  const { data, isLoading } = useLeadStages({ page: 1, page_size: 50, ordering: "order" });
  const stages: LeadStageRecord[] = data?.results ?? [];

  const create = useLeadStageCreate(() => setCreating(false));
  const remove = useLeadStageDelete(() => setDeleting(null));

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<LeadStageRecord | null>(null);
  const [deleting, setDeleting] = useState<LeadStageRecord | null>(null);

  const update = useLeadStageUpdate(editing?.id ?? "", () => setEditing(null));

  const formOpen = creating || Boolean(editing);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Lid bosqichlari"
        subtitle="Kanban ustunlari — tizim bosqichlari o'chirilmaydi, qo'shilganlar faqat shu yerda boshqariladi"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Ustun qo'shish
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-divider bg-surface-2/60">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Ustun
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Rang
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
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-b border-divider">
                      {[0, 1, 2, 3, 4].map((j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 w-24 rounded-md bg-surface-2" />
                        </td>
                      ))}
                    </tr>
                  ))
                : stages.length === 0
                  ? [
                      <tr key="empty">
                        <td colSpan={5} className="p-0">
                          <div className="flex flex-col items-center justify-center py-10 text-ink-muted">
                            Bosqich topilmadi
                          </div>
                        </td>
                      </tr>,
                    ]
                  : stages.map((stage) => {
                      const system = SYSTEM_VALUES.has(stage.name as never);
                      const colorInfo =
                        STAGE_COLORS[stage.color as LeadStageColor] ?? STAGE_COLORS.neutral;
                      return (
                        <tr
                          key={stage.id}
                          className="border-b border-divider hover:bg-surface-2/50"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-ink">{stage.name}</p>
                            {system && (
                              <span className="text-xs text-ink-muted">Tizim bosqichi</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-2">
                              <span
                                aria-hidden="true"
                                className={cn("h-2.5 w-2.5 rounded-full", colorInfo.dot)}
                              />
                              <span className="text-xs text-ink-secondary">{colorInfo.label}</span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5 money text-ink">{formatNumber(stage.order)}</td>
                          <td className="px-5 py-3.5">
                            <Chip tone={stage.is_active ? "success" : "neutral"} dot>
                              {stage.is_active ? "Faol" : "No'faol"}
                            </Chip>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {system ? (
                              <span className="text-xs text-ink-muted">Tahrirlanmaydi</span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditing(stage)}
                                  className="mr-2 text-sm text-action-soft-text underline underline-offset-4 hover:text-action"
                                >
                                  <Pencil className="mr-1 inline h-4 w-4" />
                                  Tahrirlash
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleting(stage)}
                                  aria-label={`${stage.name} ustunini o'chirish`}
                                  className="text-sm text-danger-ink hover:opacity-80"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
              <Filter className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Ustunni tahrirlash" : "Yangi ustun"}</SheetTitle>
              <SheetDescription>
                Ustun Kanban doskasida lidlar bosqichi sifatida ko'rinadi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <StageForm
              key={editing?.id ?? "new"}
              defaultValues={{
                name: editing?.name ?? "",
                color: (editing?.color as LeadStageColor) ?? "action",
                is_active: editing?.is_active ?? true,
              }}
              isPending={create.isPending || update.isPending}
              onSubmit={(values) => {
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
        title="Ustunni o'chirish"
        description={
          deleting
            ? `"${deleting.name}" ustuni o'chiriladi. Unda lidlar bo'lsa server o'chirishni rad etadi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}

function StageForm({
  defaultValues,
  isPending,
  onSubmit,
}: {
  defaultValues: StageFormValues;
  isPending: boolean;
  onSubmit: (values: StageFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StageFormValues>({
    resolver: zodResolver(stageSchema),
    defaultValues,
  });

  const color = watch("color");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="stage-name" className="mb-1 block text-xs font-semibold text-ink-muted">
          Ustun nomi
        </label>
        <input
          id="stage-name"
          {...register("name")}
          maxLength={40}
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        />
        {errors.name && <p className="mt-1 text-xs text-danger-ink">{errors.name.message}</p>}
      </div>

      <fieldset>
        <legend className="mb-1 text-xs font-semibold text-ink-muted">Rang</legend>
        <div className="flex flex-wrap items-center gap-2">
          {STAGE_COLOR_ORDER.map((item) => (
            <button
              key={item}
              type="button"
              aria-label={STAGE_COLORS[item].label}
              aria-pressed={color === item}
              onClick={() => setValue("color", item, { shouldDirty: true })}
              className={cn(
                "h-7 w-7 flex-none rounded-full transition-transform hover:scale-110",
                STAGE_COLORS[item].dot,
                color === item && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
              )}
            />
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        <input
          type="checkbox"
          {...register("is_active")}
          className="h-4 w-4 rounded border-input bg-background"
        />
        Faol
      </label>

      <Button type="submit" className="w-full" loading={isPending}>
        Saqlash
      </Button>
    </form>
  );
}
