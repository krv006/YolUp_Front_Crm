import { useState } from "react";
import { Phone, Plus, UserRound, Users } from "lucide-react";

import {
  ParentForm,
  ParentTable,
  parentPayload,
  useParentCreate,
  useParentDelete,
  useParentList,
  useParentUpdate,
  type Parent,
  type ParentValues,
} from "@/modules/parents";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ListToolbar } from "@/shared/ui/list-toolbar";
import { ConfirmModal } from "@/shared/ui/modal";
import { PageHeader } from "@/shared/ui/page-header";
import { Pagination } from "@/shared/ui/pagination";
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
import { formatNumber } from "@/shared/lib";
import { useListState } from "@/shared/model";

const FORM_ID = "parent-form";

function toFormValues(parent: Parent): Partial<ParentValues> {
  return {
    first_name: parent.first_name,
    last_name: parent.last_name,
    middle_name: parent.middle_name ?? "",
    phone: parent.phone,
    email: parent.email ?? "",
    relation: parent.relation ?? "Ona",
  };
}

export default function ParentsPage() {
  const list = useListState();
  const { data, isLoading } = useParentList(list.params);
  const parents = data?.results ?? [];
  const total = data?.count ?? 0;

  /* Ko'rsatkichlar butun markaz bo'yicha — qidiruv/filtrlardan qat'i nazar. */
  const { data: stats } = useParentList({ page: 1, page_size: 100 });
  const allParents = stats?.results ?? [];

  /* Bir nechta farzandi borlar: 2 va undan ko'p (aniq 2 emas). */
  const multiCount = allParents.filter((parent) => (parent.students_count ?? 0) > 1).length;
  /* SMS faqat telefon raqami bor ota-onalarga ketadi. */
  const smsCount = allParents.filter((parent) => parent.phone.trim() !== "").length;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Parent | null>(null);
  const [deleting, setDeleting] = useState<Parent | null>(null);

  const create = useParentCreate(() => setCreating(false));
  const update = useParentUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useParentDelete(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);
  const filtered = Boolean(list.search || list.activeFilterCount);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: ParentValues) => {
    const payload = parentPayload(values);
    if (editing) {
      update.mutate(payload);
      return;
    }
    create.mutate(payload);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Ota-onalar"
        subtitle="Bog'lanish ma'lumotlari va farzandlar"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Ota-ona qo'shish
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          size="sm"
          label="Jami ota-onalar"
          value={formatNumber(stats?.count ?? total)}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Ko'p farzandli"
          value={formatNumber(multiCount)}
          hint="2 va undan ko'p farzand"
          tone="info"
          icon={<UserRound className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="SMS oluvchilar"
          value={formatNumber(smsCount)}
          hint="telefon raqami bor"
          tone="success"
          icon={<Phone className="h-4 w-4" />}
        />
      </div>

      <ListToolbar
        value={list.search}
        onSearch={list.setSearch}
        placeholder="Ism, familiya yoki telefon…"
        filters={[
          <Select
            key="relation"
            aria-label="Kim bo'ladi bo'yicha filtr"
            value={list.filters.relation ?? ""}
            onChange={(event) => list.setFilter("relation", event.target.value)}
            className="h-9 text-sm"
          >
            <option value="">Barchasi</option>
            <option value="Ota">Ota</option>
            <option value="Ona">Ona</option>
            <option value="Vasiy">Vasiy</option>
          </Select>,
        ]}
        hint={
          <>
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta ota-ona
          </>
        }
      />

      <Card className="overflow-hidden">
        <ParentTable
          parents={parents}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onEdit={setEditing}
          onDelete={setDeleting}
          onCreate={() => setCreating(true)}
          onClearFilters={list.resetFilters}
          filtered={filtered}
        />
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
              <Users className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Ota-onani tahrirlash" : "Yangi ota-ona"}</SheetTitle>
              <SheetDescription>
                Telefon raqami SMS yuborish va qarz eslatmalari uchun ishlatiladi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <ParentForm
              key={editing?.id ?? "new"}
              formId={FORM_ID}
              defaultValues={editing ? toFormValues(editing) : undefined}
              onSubmit={handleSubmit}
            />
          </SheetBody>

          <SheetFooter>
            <Button variant="ghost" onClick={closeForm} disabled={create.isPending || update.isPending}>
              Bekor qilish
            </Button>
            <Button type="submit" form={FORM_ID} loading={create.isPending || update.isPending}>
              {editing ? "Saqlash" : "Qo'shish"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Ota-onani o'chirish"
        description={
          deleting
            ? `${deleting.first_name} ${deleting.last_name} o'chiriladi. O'quvchi bilan bog'lanish uziladi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
