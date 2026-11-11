import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Pencil, Plus, School as SchoolIcon, TrendingUp, Users } from "lucide-react";

import {
  SCHOOL_TYPE_OPTIONS,
  SchoolForm,
  SchoolTable,
  schoolPayload,
  schoolTypeLabel,
  useSchoolCreate,
  useSchoolDelete,
  useSchoolList,
  useSchoolUpdate,
  type School,
  type SchoolValues,
} from "@/modules/schools";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
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
import { formatDate, formatNumber } from "@/shared/lib";
import { useListState } from "@/shared/model";

const FORM_ID = "school-form";

function toFormValues(school: School): Partial<SchoolValues> {
  return {
    name: school.name,
    type: school.type,
    district: school.district ?? "",
    address: school.address ?? "",
    contact_person: school.contact_person ?? "",
    phone: school.phone ?? "",
    student_capacity: school.student_capacity ?? undefined,
    partner_since: school.partner_since ?? "",
    is_active: school.is_active,
    notes: school.notes ?? "",
  };
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-sm font-semibold text-ink">{children}</dd>
    </div>
  );
}

export default function SchoolsPage() {
  const list = useListState();
  const navigate = useNavigate();

  const { data, isLoading } = useSchoolList(list.params);
  const schools = data?.results ?? [];
  const total = data?.count ?? 0;

  /* Ko'rsatkichlar butun katalog bo'yicha — qidiruv/filtrlardan qat'i nazar. */
  const { data: stats } = useSchoolList({ page: 1, page_size: 100 });
  const allSchools = useMemo(() => stats?.results ?? [], [stats]);

  const activeCount = allSchools.filter((school) => school.is_active).length;
  const leadsTotal = allSchools.reduce((sum, school) => sum + (school.leads_count ?? 0), 0);
  const enrolledTotal = allSchools.reduce((sum, school) => sum + (school.enrolled_count ?? 0), 0);
  const conversion = leadsTotal > 0 ? Math.round((enrolledTotal / leadsTotal) * 1000) / 10 : 0;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [detail, setDetail] = useState<School | null>(null);
  const [deleting, setDeleting] = useState<School | null>(null);

  const create = useSchoolCreate(() => setCreating(false));
  const update = useSchoolUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useSchoolDelete(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);
  const filtered = Boolean(list.search || list.activeFilterCount);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: SchoolValues) => {
    const payload = schoolPayload(values);
    if (editing) {
      update.mutate(payload);
      return;
    }
    create.mutate(payload);
  };

  const openEdit = (school: School) => {
    setDetail(null);
    setEditing(school);
  };

  /* Maktab lidlarini ko'rish — lidlar ro'yxati `?school=` orqali filtrlanadi. */
  const openLeads = (school: School) => {
    void navigate({ to: "/leads", search: { school: school.id } });
  };

  /* Tahrirlanayotgan maktabning o'z nomi "band" hisoblanmasin. */
  const takenNames = allSchools
    .filter((school) => school.id !== editing?.id)
    .map((school) => school.name.trim().toLowerCase())
    .filter((name) => name.length > 0);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Maktablar"
        subtitle="Lidlar qaysi maktabdan kelgani va konversiya"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Maktab qo'shish
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          size="sm"
          label="Jami maktablar"
          value={formatNumber(stats?.count ?? total)}
          icon={<SchoolIcon className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Faol maktablar"
          value={formatNumber(activeCount)}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Shu maktablardan lidlar"
          value={formatNumber(leadsTotal)}
          tone="info"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Konversiya"
          value={`${conversion}%`}
          hint={`${formatNumber(enrolledTotal)} ta o'quvchiga aylandi`}
          tone="warning"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <ListToolbar
        value={list.search}
        onSearch={list.setSearch}
        placeholder="Maktab, tuman yoki mas'ul shaxs…"
        filters={[
          <Select
            key="type"
            aria-label="Maktab turi bo'yicha filtr"
            value={list.filters.type ?? ""}
            onChange={(event) => list.setFilter("type", event.target.value)}
            className="h-9 text-sm"
          >
            <option value="">Barcha turlar</option>
            {SCHOOL_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>,
          <Select
            key="is_active"
            aria-label="Holat bo'yicha filtr"
            value={list.filters.is_active ?? ""}
            onChange={(event) => list.setFilter("is_active", event.target.value)}
            className="h-9 text-sm"
          >
            <option value="">Barcha holatlar</option>
            <option value="true">Faol maktablar</option>
            <option value="false">Nofaol maktablar</option>
          </Select>,
        ]}
        hint={
          <>
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta maktab
          </>
        }
      />

      <Card className="overflow-hidden">
        <SchoolTable
          schools={schools}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onOpen={setDetail}
          onOpenLeads={openLeads}
          onEdit={openEdit}
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
              <SchoolIcon className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Maktabni tahrirlash" : "Yangi maktab"}</SheetTitle>
              <SheetDescription>
                Maktab lidlar manbasi sifatida ishlatiladi — lid qaysi maktabdan kelganini
                tanlash uchun katalogda bo'lishi kerak.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <SchoolForm
              key={editing?.id ?? "new"}
              formId={FORM_ID}
              defaultValues={editing ? toFormValues(editing) : undefined}
              onSubmit={handleSubmit}
              leadsCount={editing?.leads_count ?? 0}
              takenNames={takenNames}
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
            <Button type="submit" form={FORM_ID} loading={create.isPending || update.isPending}>
              {editing ? "Saqlash" : "Qo'shish"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:w-[min(560px,100vw)]">
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <SchoolIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="od-truncate">{detail?.name}</SheetTitle>
              <SheetDescription>
                {detail ? schoolTypeLabel(detail.type) : ""}
                {(detail?.district ?? "").length > 0 ? ` · ${detail?.district}` : ""}
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            {detail && (
              <>
                <dl className="grid gap-4 rounded-lg border border-border bg-surface-2 p-4 sm:grid-cols-2">
                  <DetailRow label="Hamkorlikdan">
                    {(detail.partner_since ?? "").length > 0
                      ? formatDate(detail.partner_since)
                      : "Hamkor emas"}
                  </DetailRow>
                  <DetailRow label="Holat">
                    <Chip tone={detail.is_active ? "success" : "neutral"} dot>
                      {detail.is_active ? "Faol" : "Nofaol"}
                    </Chip>
                  </DetailRow>
                  <DetailRow label="Mas'ul shaxs">{detail.contact_person ?? "—"}</DetailRow>
                  <DetailRow label="Telefon">
                    {(detail.phone ?? "").length > 0 ? (
                      <span className="money">{detail.phone}</span>
                    ) : (
                      "—"
                    )}
                  </DetailRow>
                  <DetailRow label="O'quvchilar soni">
                    {detail.student_capacity != null && detail.student_capacity > 0
                      ? formatNumber(detail.student_capacity)
                      : "—"}
                  </DetailRow>
                  <DetailRow label="Manzil">{detail.address ?? "—"}</DetailRow>
                </dl>

                <section className="grid gap-3">
                  <h3 className="text-sm font-semibold text-ink">Lidlar bo'yicha</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatCard
                      size="sm"
                      label="Jami lidlar"
                      value={formatNumber(detail.leads_count ?? 0)}
                      icon={<Users className="h-4 w-4" />}
                    />
                    <StatCard
                      size="sm"
                      label="O'quvchiga aylandi"
                      value={formatNumber(detail.enrolled_count ?? 0)}
                      tone="success"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                    />
                    <StatCard
                      size="sm"
                      label="Konversiya"
                      value={`${detail.conversion_rate ?? 0}%`}
                      tone="warning"
                      icon={<TrendingUp className="h-4 w-4" />}
                    />
                  </div>
                  {(detail.notes ?? "").length > 0 && (
                    <div className="grid gap-0.5">
                      <p className="text-xs text-ink-muted">Izoh</p>
                      <p className="text-sm leading-relaxed text-ink-secondary">{detail.notes}</p>
                    </div>
                  )}
                </section>
              </>
            )}
          </SheetBody>

          <SheetFooter>
            <Button variant="ghost" onClick={() => setDetail(null)}>
              Yopish
            </Button>
            <Button
              variant="outline"
              disabled={(detail?.leads_count ?? 0) === 0}
              onClick={() => detail && openLeads(detail)}
            >
              <Users className="h-4 w-4" />
              Lidlarini ko'rish
            </Button>
            <Button onClick={() => detail && openEdit(detail)}>
              <Pencil className="h-4 w-4" />
              Tahrirlash
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Maktabni o'chirish"
        description={
          deleting
            ? `"${deleting.name}" maktabi o'chiriladi. Bu amalni qaytarish mumkin emas.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
