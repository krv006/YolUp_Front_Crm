import { useState } from "react";
import { CalendarOff, Plus, Trash2 } from "lucide-react";

import {
  DayOffForm,
  useDayOffCreate,
  useDayOffList,
  useDayOffRemove,
  useDayOffUpdate,
  type DayOff,
  type DayOffFormValues,
} from "@/modules/days-off";
import { useBranchList } from "@/modules/branches";
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
import { Pagination } from "@/shared/ui/pagination";
import { ListToolbar } from "@/shared/ui/list-toolbar";
import { Select } from "@/shared/ui/select";
import { formatDate, formatNumber } from "@/shared/lib";
import { useListState } from "@/shared/model";

function toFormValues(dayOff: DayOff | null): DayOffFormValues {
  return {
    name: dayOff?.name ?? "",
    date_from: dayOff?.date_from ?? "",
    date_to: dayOff?.date_to ?? "",
    branch_id: dayOff?.branch_id ?? "",
    note: dayOff?.note ?? "",
  };
}

export default function SettingsDaysOffPage() {
  const list = useListState({ pageSize: 20 });
  const branchesQuery = useBranchList({ page: 1, page_size: 100, ordering: "name" });
  const branches = branchesQuery.data?.results ?? [];

  const { data, isLoading } = useDayOffList(list.params);
  const daysOff: DayOff[] = data?.results ?? [];
  const total = data?.count ?? 0;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DayOff | null>(null);
  const [deleting, setDeleting] = useState<DayOff | null>(null);

  const create = useDayOffCreate(() => setCreating(false));
  const update = useDayOffUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useDayOffRemove(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: DayOffFormValues) => {
    const payload = values.branch_id ? values : { ...values, branch_id: null };
    if (editing) {
      update.mutate(payload);
    } else {
      create.mutate(payload);
    }
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Dam olish kunlari"
        subtitle={`Bayram va dam olish kunlari — jadval tuzishda hisobga olinadi · ${formatNumber(total)} ta`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Kun qo'shish
          </Button>
        }
      />

      <ListToolbar
        value={list.search}
        onSearch={list.setSearch}
        placeholder="Sana yoki tadbir nomi…"
        filters={[
          <Select
            key="branch_id"
            aria-label="Filial bo'yicha filtr"
            value={list.filters.branch_id ?? ""}
            onChange={(event) => list.setFilter("branch_id", event.target.value)}
            className="h-9 text-sm"
          >
            <option value="">Barcha filiallar</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>,
        ]}
        hint={
          <>
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta kun
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-divider bg-surface-2/60">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Sana / tadbir
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Sanalar
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Qamrov
                </th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Izoh
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Amal
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-divider">
                    {[0, 1, 2, 3, 4].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 w-24 rounded-md bg-surface-2" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : daysOff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="flex flex-col items-center justify-center py-10 text-ink-muted">
                      Dam olish kuni qo'shilmagan
                    </div>
                  </td>
                </tr>
              ) : (
                daysOff.map((dayOff) => {
                  const branchName = dayOff.branch_id
                    ? branches.find((branch) => branch.id === dayOff.branch_id)?.name
                    : null;
                  return (
                    <tr
                      key={dayOff.id}
                      className="border-b border-divider hover:bg-surface-2/50"
                    >
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => setEditing(dayOff)}
                          className="font-medium text-ink hover:text-action"
                        >
                          {dayOff.name}
                        </button>
                      </td>
                      <td className="money px-5 py-3.5 text-ink">
                        {formatDate(dayOff.date_from)}
                        {dayOff.date_to && dayOff.date_to !== dayOff.date_from && (
                          <span className="text-ink-muted"> – {formatDate(dayOff.date_to)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Chip tone={dayOff.branch_id ? "info" : "neutral"}>
                          {dayOff.branch_id ? (branchName ?? "Filial") : "Butun markaz"}
                        </Chip>
                      </td>
                      <td className="px-5 py-3.5 text-ink-secondary">{dayOff.note || "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleting(dayOff)}
                          aria-label={`${dayOff.name} ni o'chirish`}
                          className="text-sm text-danger-ink hover:opacity-80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {total > 0 && (
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={total}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
        />
      )}

      <Sheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <CalendarOff className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Dam olish kunini tahrirlash" : "Yangi dam olish kuni"}</SheetTitle>
              <SheetDescription>
                Filial tanlanmasa qoida butun markaz uchun amal qiladi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <DayOffForm
              key={editing?.id ?? "new"}
              branches={branches}
              defaultValues={toFormValues(editing)}
              isPending={create.isPending || update.isPending}
              onSubmit={handleSubmit}
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
        title="Dam olish kunini o'chirish"
        description={
          deleting
            ? `"${deleting.name}" o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
