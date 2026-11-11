import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  GraduationCap,
  KanbanSquare,
  List,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import {
  LeadBoard,
  LeadForm,
  LeadTable,
  LEAD_STAGES,
  leadName,
  leadPayload,
  STAGE_COLORS,
  useLeadCreate,
  useLeadDelete,
  useLeadList,
  useLeadMove,
  useLeadSources,
  useLeadStages,
  useLeadUpdate,
  type Lead,
  type LeadStageColumn,
  type LeadValues,
} from "@/modules/leads";
import { useUserList } from "@/modules/users";
import { useSchoolOptions } from "@/modules/schools";
import { StatusBadge } from "@/core/status";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ConfirmModal } from "@/shared/ui/modal";
import { PageHeader } from "@/shared/ui/page-header";
import { Pagination } from "@/shared/ui/pagination";
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
import { Tabs } from "@/shared/ui/tabs";
import { formatDate, formatNumber } from "@/shared/lib";
import { useListState } from "@/shared/model";
import LeadConvertSheet from "@/widgets/lead-convert/LeadConvertSheet";

const FORM_ID = "lead-form";

function toFormValues(lead: Lead): Partial<LeadValues> {
  return {
    first_name: lead.first_name,
    last_name: lead.last_name ?? "",
    phone: lead.phone,
    source_id: lead.source_id ?? "",
    school_id: lead.school_id ?? "",
    teacher_id: lead.teacher_id ?? "",
    age: lead.age ?? undefined,
    lesson_time: lead.lesson_time ?? "",
    lesson_day_type: lead.lesson_day_type ?? undefined,
    status: lead.status,
    stage: lead.stage,
    temperature: lead.temperature ?? undefined,
    body: lead.body ?? "",
  };
}

export default function LeadsPage() {
  const list = useListState({ pageSize: 25 });
  const [view, setView] = useState<"kanban" | "list">("kanban");

  /* Maktab kartasidan kelgan havola: `/leads?school=school-0003`. */
  const { school: schoolFromUrl } = useSearch({ from: "/leads" });

  /**
   * Havoladagi maktab filtrni bir marta qo'llaymiz. Foydalanuvchi filtrni
   * keyin o'zgartirsa, URL o'zgarmagani uchun qayta yozilmaydi.
   */
  useEffect(() => {
    if ((schoolFromUrl ?? "").length > 0) list.setFilter("school_id", schoolFromUrl as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolFromUrl]);

  /* Kanban butun oqimni ko'rsatadi, jadval esa sahifalab. */
  const params = useMemo(
    () =>
      view === "kanban"
        ? {
            page: 1,
            page_size: 100,
            ...(list.search ? { search: list.search } : {}),
            ...(list.filters.stage ? { stage: list.filters.stage } : {}),
            ...(list.filters.school_id ? { school_id: list.filters.school_id } : {}),
          }
        : list.params,
    [view, list.search, list.filters.stage, list.filters.school_id, list.params],
  );

  const { data, isLoading } = useLeadList(params);
  const leads = data?.results ?? [];
  const total = data?.count ?? 0;

  const { data: sourcesData } = useLeadSources({ page: 1, page_size: 50 });
  const { data: stagesData } = useLeadStages({ page: 1, page_size: 50, ordering: "created_at" });
  const { data: teachersData } = useUserList({ page: 1, page_size: 100, role: "teacher" });
  const { data: schoolsData } = useSchoolOptions();

  const sources = (sourcesData?.results ?? []).map((source) => ({
    id: source.id,
    name: source.name,
  }));
  const teachers = (teachersData?.results ?? []).map((teacher) => ({
    id: teacher.id,
    name: `${teacher.first_name} ${teacher.last_name}`,
  }));
  const schools = (schoolsData?.results ?? []).map((school) => ({
    id: school.id,
    // Nofaol maktab ham tanlanadi (eski lid), lekin belgisi ko'rinib turadi.
    name: school.is_active ? school.name : `${school.name} (nofaol)`,
  }));

  /* Tizim bosqichlari + foydalanuvchi qo'shgan ustunlar. */
  const stageColumns = useMemo<LeadStageColumn[]>(
    () => [
      ...LEAD_STAGES,
      ...(stagesData?.results ?? []).map((record) => ({
        value: record.id,
        label: record.name,
        color: record.color,
        id: record.id,
      })),
    ],
    [stagesData],
  );

  const wonCount = leads.filter((lead) => lead.stage === "won").length;
  const conversion = leads.length > 0 ? Math.round((wonCount / leads.length) * 1000) / 10 : 0;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [viewing, setViewing] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<Lead | null>(null);
  const [converting, setConverting] = useState<Lead | null>(null);

  const navigate = useNavigate();

  const create = useLeadCreate(() => setCreating(false));
  const update = useLeadUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useLeadDelete(() => setDeleting(null));
  const move = useLeadMove();

  const viewingStage = viewing
    ? stageColumns.find((column) => column.value === viewing.stage)
    : undefined;

  const formOpen = creating || Boolean(editing);
  const filtered = Boolean(list.search || list.activeFilterCount);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: LeadValues) => {
    const payload = leadPayload(values);
    if (editing) {
      update.mutate(payload);
      return;
    }
    create.mutate(payload);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Lidlar"
        subtitle={`Kanban · ${formatNumber(total)} lid · ${conversion}% konversiya`}
        actions={
          <>
            <Tabs
              variant="pill"
              label="Ko'rinish"
              value={view}
              onChange={(value) => setView(value as "kanban" | "list")}
              items={[
                { value: "kanban", label: "Kanban", icon: <KanbanSquare className="h-4 w-4" /> },
                { value: "list", label: "Ro'yxat", icon: <List className="h-4 w-4" /> },
              ]}
            />
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Yangi lid
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          size="sm"
          label="Jami lidlar"
          value={formatNumber(total)}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="O'quvchiga aylandi"
          value={formatNumber(wonCount)}
          tone="success"
          icon={<UserPlus className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Konversiya"
          value={`${conversion}%`}
          tone="info"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <Card className="p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            size="sm"
            value={list.search}
            onChange={list.setSearch}
            placeholder="Ism, familiya yoki telefon…"
            className="w-full sm:w-[240px]"
          />

          <div className="w-[168px]">
            <Select
              aria-label="Bosqich bo'yicha filtr"
              value={list.filters.stage ?? ""}
              onChange={(event) => list.setFilter("stage", event.target.value)}
              className="h-9 text-sm"
            >
              <option value="">Barcha bosqichlar</option>
              {stageColumns.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-[200px]">
            <Select
              aria-label="Maktab bo'yicha filtr"
              value={list.filters.school_id ?? ""}
              onChange={(event) => list.setFilter("school_id", event.target.value)}
              className="h-9 text-sm"
            >
              <option value="">Barcha maktablar</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </Select>
          </div>

          <span className="ml-auto hidden text-xs text-ink-muted xl:inline">
            {view === "kanban" ? (
              <>
                Kartani boshqa ustunga <span className="font-semibold text-ink">tashlang</span> —
                bosqich avtomatik yangilanadi
              </>
            ) : (
              <>
                <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta lid
              </>
            )}
          </span>
        </div>
      </Card>

      {view === "kanban" ? (
        <LeadBoard
          stages={stageColumns}
          leads={leads}
          isLoading={isLoading}
          onOpen={setViewing}
          onMove={(lead, stage) => move.mutate({ id: lead.id, stage })}
        />
      ) : (
        <Card className="overflow-hidden">
          <LeadTable
            leads={leads}
            isLoading={isLoading}
            stages={stageColumns}
            sort={list.sort}
            onSortChange={list.toggleSort}
            onOpen={setViewing}
            onEdit={setEditing}
            onDelete={setDeleting}
            onCreate={() => setCreating(true)}
            onClearFilters={list.resetFilters}
            filtered={filtered}
          />
        </Card>
      )}

      {view === "list" && total > 0 && (
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
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Lidni tahrirlash" : "Yangi lid"}</SheetTitle>
              <SheetDescription>
                Harorat va bosqich qo'ng'iroq natijasiga qarab yangilanadi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <LeadForm
              key={editing?.id ?? "new"}
              formId={FORM_ID}
              defaultValues={editing ? toFormValues(editing) : undefined}
              sources={sources}
              schools={schools}
              teachers={teachers}
              stages={stageColumns.map((stage) => ({ value: stage.value, label: stage.label }))}
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

      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <SheetContent>
          <SheetHeader>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-action-soft text-action-soft-text">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{viewing ? leadName(viewing) : "Lid"}</SheetTitle>
              <SheetDescription>{viewing?.phone}</SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            {viewing && (
              <dl className="grid gap-3 rounded-lg border border-border bg-surface-inset p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Bosqich</dt>
                  <dd>
                    <StatusBadge
                      status={viewing.stage}
                      label={viewingStage?.label}
                      tone={viewingStage ? STAGE_COLORS[viewingStage.color].chip : undefined}
                    />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink-muted">Holat</dt>
                  <dd>
                    <StatusBadge status={viewing.status} />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Manba</dt>
                  <dd className="font-semibold text-ink">{viewing.source_name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Maktab</dt>
                  <dd className="font-semibold text-ink">{viewing.school_name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Mas'ul</dt>
                  <dd className="font-semibold text-ink">{viewing.teacher_name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Yoshi</dt>
                  <dd className="money font-semibold text-ink">{viewing.age ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">Sinov darsi</dt>
                  <dd className="money font-semibold text-ink">{viewing.lesson_time ?? "—"}</dd>
                </div>
                {viewing.body && (
                  <div className="grid gap-1 border-t border-divider pt-3">
                    <dt className="text-ink-muted">Izoh</dt>
                    <dd className="text-ink-secondary">{viewing.body}</dd>
                  </div>
                )}

                {/*
                 * Konvertatsiya holati — lid o'quvchiga aylantirilgan bo'lsa
                 * qaysi o'quvchi/guruh ekanini ko'rsatamiz, aks holda
                 * aylantirishga taklif qilamiz.
                 */}
                {viewing.converted_to_student_id ? (
                  <div className="grid gap-1 border-t border-divider pt-3">
                    <dt className="text-ink-muted">O'quvchi</dt>
                    <dd className="font-semibold text-success-ink">
                      {viewing.converted_student_name ?? viewing.converted_to_student_id}
                      {viewing.converted_group_name
                        ? ` · ${viewing.converted_group_name}`
                        : ""}
                      {viewing.converted_at
                        ? ` · ${formatDate(viewing.converted_at)}`
                        : ""}
                    </dd>
                  </div>
                ) : (
                  <div className="grid gap-1 border-t border-divider pt-3">
                    <dt className="text-ink-muted">Konvertatsiya</dt>
                    <dd className="text-ink-secondary">
                      Lid hali o'quvchiga aylantirilmagan.
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </SheetBody>

          <SheetFooter>
            <Button variant="ghost" onClick={() => setViewing(null)}>
              Yopish
            </Button>
            {viewing && !viewing.converted_to_student_id && (
              <Button
                variant="secondary"
                onClick={() => {
                  setConverting(viewing);
                  setViewing(null);
                }}
              >
                <GraduationCap className="h-4 w-4" />
                O'quvchiga aylantirish
              </Button>
            )}
            <Button
              onClick={() => {
                setEditing(viewing);
                setViewing(null);
              }}
            >
              Tahrirlash
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <LeadConvertSheet
        lead={converting}
        onClose={() => setConverting(null)}
        onConverted={() => navigate({ to: "/students" })}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Lidni o'chirish"
        description={
          deleting ? `${leadName(deleting)} lidini o'chirishni tasdiqlaysizmi?` : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
