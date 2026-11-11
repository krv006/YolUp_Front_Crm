import { useState } from "react";
import { AlertTriangle, CheckCircle2, Pencil, UserPlus, Users } from "lucide-react";

import {
  StudentDetail,
  StudentForm,
  StudentTable,
  studentPayload,
  useStudentCreate,
  useStudentDelete,
  useStudentList,
  useStudentUpdate,
  type Student,
  type StudentValues,
} from "@/modules/students";
import { usePermission } from "@/core/permission";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { FilterChip } from "@/shared/ui/chip";
import { ConfirmModal } from "@/shared/ui/modal";
import { PageHeader } from "@/shared/ui/page-header";
import { Pagination } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";
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

const FILTERS = [
  { key: "all", label: "Hammasi" },
  { key: "debt", label: "Qarzdorlar" },
  { key: "active", label: "Faol" },
  { key: "trial", label: "Sinov" },
  { key: "frozen", label: "Muzlatilgan" },
] as const;

const FORM_ID = "student-form";

function toFormValues(student: Student): Partial<StudentValues> {
  return {
    first_name: student.first_name,
    last_name: student.last_name,
    middle_name: student.middle_name ?? "",
    phone: student.phone ?? "",
    email: student.email ?? "",
    birth_date: student.birth_date ? student.birth_date.slice(0, 10) : "",
    gender: student.gender ?? undefined,
    address: student.address ?? "",
  };
}

export default function StudentsPage() {
  const list = useListState();
  const { can } = usePermission();
  const canCreate = can("students.create");
  const canUpdate = can("students.update");
  const canDelete = can("students.delete");
  const canManage = canUpdate || canDelete;

  const { data, isLoading } = useStudentList(list.params);
  const students = data?.results ?? [];
  const total = data?.count ?? 0;

  /* Header counters — lightweight `page_size=1` requests that only read `count`. */
  const { data: allData } = useStudentList({ page: 1, page_size: 1 });
  const { data: debtData } = useStudentList({ page: 1, page_size: 1, has_debt: true });
  const { data: activeData } = useStudentList({ page: 1, page_size: 1, status: "active" });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const create = useStudentCreate(() => setCreating(false));
  const update = useStudentUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useStudentDelete(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);
  const activeFilter = list.filters.has_debt === "true" ? "debt" : list.filters.status || "all";
  const filtered = Boolean(list.search || list.activeFilterCount);

  const applyFilter = (key: string) => {
    list.setFilter("status", key === "all" || key === "debt" ? "" : key);
    list.setFilter("has_debt", key === "debt" ? "true" : "");
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: StudentValues) => {
    const payload = studentPayload(values);
    if (editing) {
      update.mutate(payload);
      return;
    }
    create.mutate({ ...payload, status: "trial" });
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="O'quvchilar"
        subtitle="Ro'yxat, qarz filtri va ota-onalar"
        actions={
          canCreate ? (
            <Button onClick={() => setCreating(true)}>
              <UserPlus className="h-4 w-4" />
              O'quvchi qo'shish
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Jami o'quvchilar"
          value={formatNumber(allData?.count ?? 0)}
          icon={<Users className="h-5 w-5" />}
          tone="action"
        />
        <StatCard
          label="Faol"
          value={formatNumber(activeData?.count ?? 0)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success"
        />
        <StatCard
          label="Qarzdorlar"
          value={formatNumber(debtData?.count ?? 0)}
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={list.search}
            onChange={list.setSearch}
            placeholder="Ism, telefon yoki guruh…"
            className="w-full sm:w-[300px]"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            {FILTERS.map((filter) => (
              <FilterChip
                key={filter.key}
                active={activeFilter === filter.key}
                onClick={() => applyFilter(filter.key)}
              >
                {filter.label}
              </FilterChip>
            ))}
          </div>

          <span className="ml-auto text-sm text-ink-muted">
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta yozuv
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <StudentTable
          students={students}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onView={setViewing}
          onEdit={setEditing}
          onDelete={setDeleting}
          onCreate={() => setCreating(true)}
          onClearFilters={list.resetFilters}
          filtered={filtered}
          canManage={canManage}
          canCreate={canCreate}
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

      {/* Create / edit — a sheet, per the design system. */}
      <Sheet
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              {editing ? <Pencil className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </span>
            <div>
              <SheetTitle>{editing ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}</SheetTitle>
              <SheetDescription>
                {editing
                  ? "O'zgarishlar saqlangach ro'yxatga darhol qo'llanadi."
                  : "O'quvchi sinov holatida qo'shiladi va guruhga biriktiriladi."}
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <StudentForm
              key={editing?.id ?? "new"}
              formId={FORM_ID}
              defaultValues={editing ? toFormValues(editing) : undefined}
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
            <Button
              type="submit"
              form={FORM_ID}
              loading={create.isPending || update.isPending}
            >
              {editing ? "Saqlash" : "Qo'shish"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Read-only profile. */}
      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-brand-700 text-[#cfe0ff]">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>O'quvchi profili</SheetTitle>
              <SheetDescription>To'liq ma'lumot va joriy balans</SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>{viewing && <StudentDetail student={viewing} />}</SheetBody>

          <SheetFooter>
            <Button variant="ghost" onClick={() => setViewing(null)}>
              Yopish
            </Button>
            {canUpdate ? (
              <Button
                onClick={() => {
                  setEditing(viewing);
                  setViewing(null);
                }}
              >
                <Pencil className="h-4 w-4" />
                Tahrirlash
              </Button>
            ) : null}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="O'quvchini o'chirish"
        description={
          deleting
            ? `${deleting.first_name} ${deleting.last_name} ro'yxatdan o'chiriladi. Bu amalni qaytarib bo'lmaydi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
