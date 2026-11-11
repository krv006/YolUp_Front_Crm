import { useMemo, useState, type ReactNode } from "react";
import { BookOpen, CheckCircle2, Pencil, Plus, Users } from "lucide-react";

import {
  CourseForm,
  CourseGroups,
  CourseTable,
  coursePayload,
  useCourseCreate,
  useCourseDelete,
  useCourseList,
  useCourseUpdate,
  type Course,
  type CourseValues,
} from "@/modules/courses";
import { useGroupList } from "@/modules/groups";
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
import { formatMoney, formatNumber, tiyinToSom } from "@/shared/lib";
import { useListState } from "@/shared/model";

const FORM_ID = "course-form";

function toFormValues(course: Course): Partial<CourseValues> {
  return {
    name: course.name,
    code: course.code ?? "",
    description: course.description ?? "",
    price_som: tiyinToSom(course.price_tiyin),
    duration_months: course.duration_months ?? undefined,
    lessons_count: course.lessons_count ?? undefined,
    is_active: course.is_active,
  };
}

/** Kurs narxi ÷ (darslar soni ÷ davomiylik) — bir darsning o'rtacha narxi. */
function lessonPrice(course: Course): number | null {
  const months = course.duration_months;
  const lessons = course.lessons_count;

  if (months == null || lessons == null || months <= 0 || lessons <= 0) return null;

  return Math.round(tiyinToSom(course.price_tiyin) / (lessons / months));
}

/** Raqamli maydon uchun "—" bilan xavfsiz ko'rinish (0 va null → "—"). */
function numberLabel(value: number | null | undefined, suffix: string): string {
  return value != null && value > 0 ? `${formatNumber(value)} ${suffix}` : "—";
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-sm font-semibold text-ink">{children}</dd>
    </div>
  );
}

export default function CoursesPage() {
  const list = useListState();
  const { data, isLoading } = useCourseList(list.params);
  const courses = data?.results ?? [];
  const total = data?.count ?? 0;

  /* Ko'rsatkichlar butun markaz bo'yicha — qidiruv/filtrlardan qat'i nazar.
     Jadval ostidagi son esa joriy natijalarni ko'rsatadi. */
  const { data: stats } = useCourseList({ page: 1, page_size: 100 });
  const allCourses = stats?.results ?? [];
  const activeCount = allCourses.filter((course) => course.is_active).length;

  /* Kurs ↔ guruh bog'lanishi (1 kurs → N guruh). */
  const { data: groupsData, isLoading: groupsLoading } = useGroupList({
    page: 1,
    page_size: 100,
  });
  const groups = useMemo(() => groupsData?.results ?? [], [groupsData]);

  const groupCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const group of groups) {
      if (!group.course_id) continue;
      map[group.course_id] = (map[group.course_id] ?? 0) + 1;
    }
    return map;
  }, [groups]);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [detail, setDetail] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);

  const create = useCourseCreate(() => setCreating(false));
  const update = useCourseUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useCourseDelete(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);
  const filtered = Boolean(list.search || list.activeFilterCount);

  const detailGroups = useMemo(
    () => (detail ? groups.filter((group) => group.course_id === detail.id) : []),
    [detail, groups],
  );

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: CourseValues) => {
    const payload = coursePayload(values);
    if (editing) {
      update.mutate(payload);
      return;
    }
    create.mutate(payload);
  };

  const openEdit = (course: Course) => {
    setDetail(null);
    setEditing(course);
  };

  const detailLessonPrice = detail ? lessonPrice(detail) : null;
  const editingGroups = editing ? (groupCounts[editing.id] ?? 0) : 0;

  /* Tahrirlanayotgan kursning o'z kodi "band" hisoblanmasin. */
  const takenCodes = allCourses
    .filter((course) => course.id !== editing?.id)
    .map((course) => (course.code ?? "").toUpperCase())
    .filter((code) => code.length > 0);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Kurslar"
        subtitle="Narx, davomiylik va guruhlar"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Kurs qo'shish
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          size="sm"
          label="Jami kurslar"
          value={formatNumber(stats?.count ?? total)}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Faol kurslar"
          value={formatNumber(activeCount)}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Bog'langan guruhlar"
          value={formatNumber(groups.length)}
          tone="info"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <ListToolbar
        value={list.search}
        onSearch={list.setSearch}
        placeholder="Kurs nomi yoki kodi…"
        filters={[
          <Select
            key="status"
            aria-label="Holat bo'yicha filtr"
            value={list.filters.is_active ?? ""}
            onChange={(event) => list.setFilter("is_active", event.target.value)}
            className="h-9 text-sm"
          >
            <option value="">Barcha kurslar</option>
            <option value="true">Faol kurslar</option>
            <option value="false">Arxiv</option>
          </Select>,
        ]}
        hint={
          <>
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta kurs
          </>
        }
      />

      <Card className="overflow-hidden">
        <CourseTable
          courses={courses}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onOpen={setDetail}
          onEdit={openEdit}
          onDelete={setDeleting}
          onCreate={() => setCreating(true)}
          onClearFilters={list.resetFilters}
          filtered={filtered}
          groupCounts={groupCounts}
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
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Kursni tahrirlash" : "Yangi kurs"}</SheetTitle>
              <SheetDescription>
                Kurs — o'quv mahsuloti: guruhlar narx va davomiylikni shundan oladi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <CourseForm
              key={editing?.id ?? "new"}
              formId={FORM_ID}
              defaultValues={editing ? toFormValues(editing) : undefined}
              onSubmit={handleSubmit}
              groupsCount={editingGroups}
              takenCodes={takenCodes}
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
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="od-truncate">{detail?.name}</SheetTitle>
              <SheetDescription>
                {(detail?.code ?? "").length > 0 ? `${detail?.code} · ` : ""}Kurs ma'lumoti va
                guruhlari
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            {detail && (
              <>
                <dl className="grid gap-4 rounded-lg border border-border bg-surface-2 p-4 sm:grid-cols-2">
                  <DetailRow label="Oylik narx">{formatMoney(detail.price_tiyin)}</DetailRow>
                  <DetailRow label="Holat">
                    <Chip tone={detail.is_active ? "success" : "neutral"} dot>
                      {detail.is_active ? "Faol" : "Arxiv"}
                    </Chip>
                  </DetailRow>
                  <DetailRow label="Davomiyligi">
                    {numberLabel(detail.duration_months, "oy")}
                  </DetailRow>
                  <DetailRow label="Darslar soni">
                    {numberLabel(detail.lessons_count, "dars")}
                  </DetailRow>
                  <DetailRow label="1 dars narxi">
                    {detailLessonPrice != null
                      ? `≈ ${formatNumber(detailLessonPrice)} so'm`
                      : "—"}
                  </DetailRow>
                  <DetailRow label="Guruhlar">
                    {formatNumber(groupCounts[detail.id] ?? 0)} ta
                  </DetailRow>
                  {(detail.description ?? "").length > 0 && (
                    <div className="grid gap-0.5 sm:col-span-2">
                      <dt className="text-xs text-ink-muted">Tavsif</dt>
                      <dd className="text-sm leading-relaxed text-ink-secondary">
                        {detail.description}
                      </dd>
                    </div>
                  )}
                </dl>

                <section className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-ink">
                      Bog'langan guruhlar
                      <span className="ml-2 font-normal text-ink-muted">
                        {formatNumber(detailGroups.length)} ta
                      </span>
                    </h3>
                  </div>

                  <CourseGroups groups={detailGroups} isLoading={groupsLoading} />
                </section>
              </>
            )}
          </SheetBody>

          <SheetFooter>
            <Button variant="ghost" onClick={() => setDetail(null)}>
              Yopish
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
        title="Kursni o'chirish"
        description={
          deleting
            ? `"${deleting.name}" kursi o'chiriladi. Bu amalni qaytarish mumkin emas.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
