import { useMemo, useState, type ComponentType } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { ConfirmModal } from "@/shared/ui/modal";
import { Input } from "@/shared/ui/input";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { ListToolbar } from "@/shared/ui/list-toolbar";
import { formatNumber } from "@/shared/lib";

export interface LookupItem {
  id: string;
  name: string;
  is_active: boolean;
}

interface LookupManagerProps {
  icon: ComponentType<{ className?: string }>;
  items: LookupItem[];
  isLoading: boolean;
  emptyMessage: string;
  /** Yozuv nomi uchun izoh (masalan "manba" / "sabab"). */
  noun: string;
  creating: boolean;
  updating: boolean;
  removing: boolean;
  /** `onDone` faqat server yozuvni qabul qilganda chaqiriladi (xato bo'lsa oyna ochiq qoladi). */
  onCreate: (name: string, onDone: () => void) => void;
  onUpdate: (id: string, name: string, onDone: () => void) => void;
  onRemove: (id: string, onDone: () => void) => void;
}

/**
 * Sozlamalardagi oddiy "nom + faollik" kataloglari uchun umumiy ko'rinish.
 * Lid manbalari va yo'qotish sabablari bir xil shaklda bo'lgani uchun bir
 * marta yozilgan.
 */
export function LookupManager({
  icon: Icon,
  items,
  isLoading,
  emptyMessage,
  noun,
  creating,
  updating,
  removing,
  onCreate,
  onUpdate,
  onRemove,
}: LookupManagerProps) {
  const [search, setSearch] = useState("");
  const [creatingForm, setCreatingForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.name.toLowerCase().includes(query));
  }, [items, search]);

  const busy = creating || updating || removing;
  const deleting = items.find((item) => item.id === deletingId) ?? null;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start gap-2">
        <ListToolbar
          value={search}
          onSearch={setSearch}
          placeholder={`${noun} nomi…`}
          className="flex-1"
          hint={
            <>
              <span className="money font-semibold text-ink">{formatNumber(items.length)}</span>{" "}
              ta {noun}
            </>
          }
        />
        <Button onClick={() => setCreatingForm(true)} disabled={busy}>
          <Plus className="h-4 w-4" />
          Qo'shish
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-divider bg-surface-2/60">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.05em] text-ink-muted">
                  Nomi
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
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-divider">
                    {[0, 1, 2].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 w-24 rounded-md bg-surface-2" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-0">
                    <div className="flex flex-col items-center justify-center py-10 text-ink-muted">
                      {search ? "Hech narsa topilmadi" : emptyMessage}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-divider hover:bg-surface-2/50">
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-ink">{item.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Chip tone={item.is_active ? "success" : "neutral"} dot>
                        {item.is_active ? "Faol" : "No'faol"}
                      </Chip>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingId(item.id)}
                        disabled={busy}
                        className="mr-2 text-sm text-action-soft-text underline underline-offset-4 hover:text-action disabled:opacity-50"
                      >
                        <Pencil className="mr-1 inline h-4 w-4" />
                        Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(item.id)}
                        disabled={busy}
                        aria-label={`${item.name} ni o'chirish`}
                        className="text-sm text-danger-ink hover:opacity-80 disabled:opacity-50"
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

      <Sheet open={creatingForm} onOpenChange={setCreatingForm}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>Yangi {noun}</SheetTitle>
              <SheetDescription>Nomi tizimda takrorlanmasligi kerak.</SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <LookupForm
              key="create"
              label={`${noun} nomi`}
              isPending={creating}
              submitLabel="Qo'shish"
              onSubmit={(name) => onCreate(name, () => setCreatingForm(false))}
            />
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(editingId)} onOpenChange={(open) => !open && setEditingId(null)}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>Tahrirlash</SheetTitle>
              <SheetDescription>
                {items.find((item) => item.id === editingId)?.name} — nomini o'zgartirish
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            {editingId && (
              <LookupForm
                key={editingId}
                label={`${noun} nomi`}
                isPending={updating}
                submitLabel="Saqlash"
                defaultValue={items.find((item) => item.id === editingId)?.name ?? ""}
                onSubmit={(name) => onUpdate(editingId, name, () => setEditingId(null))}
              />
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={`${noun}ni o'chirish`}
        description={
          deleting
            ? `"${deleting.name}" o'chiriladi. Agar u biror lidga bog'langan bo'lsa, server o'chirishni rad etadi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={removing}
        onConfirm={() => {
          if (deletingId) onRemove(deletingId, () => setDeletingId(null));
        }}
      />
    </div>
  );
}

function LookupForm({
  label,
  defaultValue = "",
  isPending,
  submitLabel,
  onSubmit,
}: {
  label: string;
  defaultValue?: string;
  isPending: boolean;
  submitLabel: string;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(defaultValue);
  const trimmed = name.trim();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (trimmed) onSubmit(trimmed);
      }}
      className="space-y-4"
    >
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-ink-secondary">{label}</span>
        <Input
          value={name}
          autoFocus
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <Button type="submit" className="w-full" loading={isPending} disabled={!trimmed}>
        {submitLabel}
      </Button>
    </form>
  );
}
