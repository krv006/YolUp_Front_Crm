import { useState } from "react";
import { Building2, Pencil } from "lucide-react";

import {
  CenterForm,
  useCenterSettings,
  useCenterUpdate,
  type CenterFormValues,
} from "@/modules/center";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
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

const LANGUAGE_LABELS: Record<string, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

export default function SettingsCenterPage() {
  const { data: center, isLoading } = useCenterSettings();
  const [open, setOpen] = useState(false);
  const update = useCenterUpdate(() => setOpen(false));

  /** Bo'sh satrlar serverga `null` sifatida yuboriladi. */
  const handleSubmit = (values: CenterFormValues, onError: (error: unknown) => void) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value === "" ? null : value]),
    );
    update.mutate(payload, { onError });
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Markaz"
        subtitle="O'quv markazi haqidagi umumiy ma'lumotlar — nom, manzil, ish vaqti, til va valyuta"
        actions={
          <Button onClick={() => setOpen(true)} disabled={isLoading || !center}>
            <Pencil className="h-4 w-4" />
            Tahrirlash
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-ink">{center?.name ?? "—"}</h2>
              {center?.legal_name && (
                <p className="text-sm text-ink-muted">{center.legal_name}</p>
              )}
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted">
                Telefon
              </dt>
              <dd className="money text-ink">{center?.phone ?? "—"}</dd>
            </div>
            <div className="grid gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted">
                Email
              </dt>
              <dd className="text-ink">{center?.email ?? "—"}</dd>
            </div>
            <div className="grid gap-0.5 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.05em] text-ink-muted">
                Manzil
              </dt>
              <dd className="text-ink">{center?.address ?? "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink">Ish rejimi</h3>
          <p className="money mt-2 text-2xl font-bold text-ink">
            {center?.work_hours_from ?? "—"}
            <span className="text-ink-muted"> – </span>
            {center?.work_hours_to ?? "—"}
          </p>

          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-muted">Til</span>
              <Chip tone="neutral">
                {LANGUAGE_LABELS[center?.language ?? "uz"] ?? center?.language ?? "—"}
              </Chip>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink-muted">Valyuta</span>
              <Chip tone="neutral">{center?.currency ?? "—"}</Chip>
            </div>
          </div>
        </Card>
      </div>

      <Sheet
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) update.reset();
        }}
      >
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>Markaz profilini tahrirlash</SheetTitle>
              <SheetDescription>
                Filiallar, xonalar va kurslar alohida bo'limlarda sozlanadi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            {center && (
              <CenterForm
                defaultValues={center}
                isPending={update.isPending}
                onSubmit={handleSubmit}
              />
            )}
          </SheetBody>

          <SheetFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={update.isPending}>
              Bekor qilish
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
