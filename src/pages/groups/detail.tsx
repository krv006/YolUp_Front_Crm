import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CalendarRange,
  DoorOpen,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";

import { StatusBadge } from "@/core/status";
import { usePermission } from "@/core/permission";
import {
  GroupFormSheet,
  GroupStudentsPanel,
  GroupTeachersPanel,
  useGroupDelete,
  useGroupDetail,
  useGroupEnroll,
  useGroupStudentRemove,
  useGroupStudentUpdate,
  useGroupStudents,
  useGroupTeacherCreate,
  useGroupTeacherDelete,
  useGroupTeacherSetMain,
  useGroupTeachers,
  useGroupUpdate,
  type GroupTeacher,
} from "@/modules/groups";
import { useBranchList } from "@/modules/branches";
import { useCourseList } from "@/modules/courses";
import { useRoomList } from "@/modules/rooms";
import { useStudentList } from "@/modules/students";
import { useUserList } from "@/modules/users";
import { useShellStore } from "@/shared/model";
import { formatMoney, formatNumber } from "@/shared/lib";
import {
  WEEKDAY_LABEL,
  normalizeTime,
  parseScheduleLabel,
  scheduleSummary,
} from "@/shared/lib/schedule";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EmptyState } from "@/shared/ui/empty-state";
import { ConfirmModal } from "@/shared/ui/modal";
import { PageHeader } from "@/shared/ui/page-header";
import { Progress, occupancyTone } from "@/shared/ui/progress";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatCard } from "@/shared/ui/stat-card";

const BILLING_LABELS: Record<string, string> = {
  monthly_calendar: "Oylik — kalendar oyi bo'yicha",
  monthly_from_enrollment: "Oylik — qo'shilgan sanadan",
  per_lesson: "Har bir dars uchun",
};

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-divider py-2.5 last:border-b-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink">{children}</dd>
    </div>
  );
}

/**
 * Guruh sahifasi — guruh haqidagi hamma narsa bir joyda: ko'rsatkichlar,
 * ma'lumotlar, o'qituvchilar va a'zolar. Ro'yxatdagi har bir guruh shu
 * sahifaga ochiladi.
 */
export default function GroupDetailPage() {
  const { groupId } = useParams({ strict: false }) as { groupId: string };
  const navigate = useNavigate();
  const openTab = useShellStore((s) => s.openTab);
  const { can } = usePermission();
  const canManage = can("groups.update");

  const groupQuery = useGroupDetail(groupId ?? "");
  const group = groupQuery.data;

  const teachersQuery = useGroupTeachers(groupId ?? "");
  const membersQuery = useGroupStudents(groupId ?? "");

  const { data: branchesData } = useBranchList({ page: 1, page_size: 100 });
  const { data: coursesData } = useCourseList({ page: 1, page_size: 100 });
  const { data: roomsData } = useRoomList({ page: 1, page_size: 100, is_active: "true" });
  const { data: usersData } = useUserList({ role: "teacher", page: 1, page_size: 100 });
  const { data: studentsData } = useStudentList({ page: 1, page_size: 100 });

  const branches = branchesData?.results ?? [];
  const courses = coursesData?.results ?? [];
  const rooms = roomsData?.results ?? [];
  const teacherOptions = (usersData?.results ?? []).map((user) => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
  }));
  const studentOptions = (studentsData?.results ?? []).map((student) => ({
    id: student.id,
    name: `${student.first_name} ${student.last_name}`,
    groupName: student.group_name ?? null,
  }));

  const teachers = teachersQuery.data?.results ?? [];
  const members = membersQuery.data?.results ?? [];

  const update = useGroupUpdate(groupId ?? "", () => setEditingOpen(false));
  const remove = useGroupDelete(() => navigate({ to: "/groups" }));
  const enroll = useGroupEnroll(groupId ?? "");
  const studentUpdate = useGroupStudentUpdate(groupId ?? "");
  const studentRemove = useGroupStudentRemove(groupId ?? "");
  const teacherCreate = useGroupTeacherCreate(groupId ?? "");
  const teacherDelete = useGroupTeacherDelete(groupId ?? "");
  const teacherSetMain = useGroupTeacherSetMain(groupId ?? "");

  const [editingOpen, setEditingOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* Tab nomi — guruh nomi bilan ko'rinadi. */
  const groupName = group?.name;
  const currentGroupId = group?.id;
  useEffect(() => {
    if (groupName && currentGroupId) {
      openTab({ href: `/groups/${currentGroupId}`, label: groupName });
    }
  }, [groupName, currentGroupId, openTab]);

  if (groupQuery.isLoading) {
    return (
      <div className="grid gap-5">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <Card>
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Guruh topilmadi"
          description="Bu guruh o'chirilgan yoki havola noto'g'ri."
          action={
            <Button size="sm" onClick={() => navigate({ to: "/groups" })}>
              <ArrowLeft className="h-4 w-4" />
              Guruhlarga qaytish
            </Button>
          }
        />
      </Card>
    );
  }

  const capacity = group.capacity ?? 0;
  const activeCount = members.filter(
    (member) => member.status !== "left" && member.status !== "completed",
  ).length;
  const percent = capacity > 0 ? Math.round((activeCount / capacity) * 100) : 0;
  const monthlyRevenue = activeCount * group.price_tiyin;
  const mainTeacher = teachers.find((teacher) => teacher.role === "main");
  const canDelete = activeCount === 0;
  const schedule =
    group.schedule && group.schedule.length > 0
      ? group.schedule
      : parseScheduleLabel(group.schedule_label);

  /** Asosiy o'qituvchini almashtirish — avvalgisi yordamchiga o'tadi. */
  const handleSetMain = (teacher: GroupTeacher) => {
    teacherSetMain.mutate({
      teacherId: teacher.id,
      currentMainId: mainTeacher && mainTeacher.id !== teacher.id ? mainTeacher.id : undefined,
    });
  };

  return (
    <div className="grid gap-5">
      <Link
        to="/groups"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Guruhlar
      </Link>

      <PageHeader
        title={group.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={group.status} />
            <span>{group.course_name ?? "Kurs belgilanmagan"}</span>
            <span aria-hidden="true">·</span>
            <span>{group.branch_name ?? "Filial yo'q"}</span>
            {group.room_name ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{group.room_name}</span>
              </>
            ) : null}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate({ to: "/attendance" })}>
              <CalendarDays className="h-4 w-4" />
              Davomat
            </Button>
            {canManage ? (
              <Button variant="secondary" onClick={() => setEditingOpen(true)}>
                <Pencil className="h-4 w-4" />
                Tahrirlash
              </Button>
            ) : null}
            {canManage ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Guruh amallari">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-danger-ink"
                    disabled={!canDelete}
                    onSelect={() => {
                      if (canDelete) setDeleting(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Guruhni o'chirish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          size="sm"
          label="Faol a'zolar"
          value={capacity > 0 ? `${activeCount}/${capacity}` : formatNumber(activeCount)}
          hint={
            capacity > 0
              ? `${percent}% bandlik · ${formatNumber(Math.max(capacity - activeCount, 0))} bo'sh joy`
              : "Sig'im cheklanmagan"
          }
          tone="info"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          size="sm"
          label="Oylik narx"
          value={formatMoney(group.price_tiyin)}
          hint="Bir o'quvchi uchun"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          size="sm"
          label="Oylik tushum"
          value={formatMoney(monthlyRevenue)}
          hint={`${activeCount} faol a'zo × narx`}
          tone="success"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          size="sm"
          label="O'qituvchilar"
          value={formatNumber(teachers.length)}
          hint={mainTeacher?.user_name ?? "Asosiy belgilanmagan"}
          tone={mainTeacher ? "action" : "warning"}
          icon={<UserCog className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid content-start gap-5">
          <GroupTeachersPanel
            teachers={teachers}
            isLoading={teachersQuery.isLoading}
            options={teacherOptions}
            canManage={canManage}
            pending={teacherCreate.isPending || teacherDelete.isPending || teacherSetMain.isPending}
            onCreate={(payload) => teacherCreate.mutate(payload)}
            onSetMain={handleSetMain}
            onRemove={(teacherId) => teacherDelete.mutate(teacherId)}
          />

          <GroupStudentsPanel
            members={members}
            isLoading={membersQuery.isLoading}
            options={studentOptions}
            capacity={capacity}
            canManage={canManage}
            pending={enroll.isPending || studentUpdate.isPending || studentRemove.isPending}
            onEnroll={(payload) => enroll.mutate(payload)}
            onStatusChange={(enrollmentId, payload) =>
              studentUpdate.mutate({ id: enrollmentId, values: payload })
            }
            onRemove={(enrollmentId) => studentRemove.mutate(enrollmentId)}
          />
        </div>

        <aside className="grid content-start gap-4">
          <Card className="p-4">
            <h2 className="mb-1 text-sm font-semibold text-ink">Guruh ma'lumotlari</h2>
            <dl className="grid">
              <InfoRow label="Kurs">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-ink-muted" />
                  {group.course_name ?? "—"}
                </span>
              </InfoRow>
              <InfoRow label="Filial">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-ink-muted" />
                  {group.branch_name ?? "—"}
                </span>
              </InfoRow>
              <InfoRow label="Xona">
                <span className="inline-flex items-center gap-1.5">
                  <DoorOpen className="h-4 w-4 text-ink-muted" />
                  {group.room_name ?? "Belgilanmagan"}
                </span>
              </InfoRow>
              <InfoRow label="Jadval">
                {schedule.length > 0 ? (
                  <span className="text-ink">{scheduleSummary(schedule)}</span>
                ) : (
                  <span className="text-warning-ink">Belgilanmagan</span>
                )}
              </InfoRow>
              <InfoRow label="Boshlanish">
                <span className="money">{group.start_date?.slice(0, 10) ?? "—"}</span>
              </InfoRow>
              <InfoRow label="Tugash">
                <span className="money">{group.end_date?.slice(0, 10) ?? "Belgilanmagan"}</span>
              </InfoRow>
              <InfoRow label="Hisob-kitob">
                {BILLING_LABELS[group.billing_mode] ?? group.billing_mode}
              </InfoRow>
              <InfoRow label="Sig'im">
                {capacity > 0 ? `${capacity} o'rin` : "Cheklanmagan"}
              </InfoRow>
            </dl>

            {schedule.length > 0 ? (
              <ul className="mt-3 grid gap-1.5 border-t border-divider pt-3">
                {schedule.map((slot, index) => (
                  <li
                    key={`${slot.day_of_week}-${index}`}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-ink-secondary">
                      {WEEKDAY_LABEL[slot.day_of_week] ?? "Kun"}
                    </span>
                    <span className="money font-semibold text-ink">
                      {normalizeTime(slot.start_time)}–{normalizeTime(slot.end_time)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : canManage ? (
              <div className="mt-3 rounded-md border border-warning-soft bg-warning-soft px-3 py-2 text-xs text-warning-ink">
                Jadval kiritilmagan — davomat darslari yaratilmaydi.{" "}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => setEditingOpen(true)}
                >
                  Jadval kiritish
                </button>
              </div>
            ) : null}

            {capacity > 0 ? (
              <div className="mt-4 grid gap-2">
                <Progress value={percent} tone={occupancyTone(percent)} />
                <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <CalendarRange className="h-3.5 w-3.5" />
                  {percent}% bandlik · {formatNumber(Math.max(capacity - activeCount, 0))} bo'sh joy
                </p>
              </div>
            ) : null}
          </Card>
        </aside>
      </div>

      <GroupFormSheet
        open={editingOpen}
        group={group}
        branches={branches.map((branch) => ({ id: branch.id, name: branch.name }))}
        courses={courses.map((course) => ({ id: course.id, name: course.name }))}
        rooms={rooms.map((room) => ({
          id: room.id,
          name: room.name,
          branchId: room.branch_id,
          capacity: room.capacity,
        }))}
        pending={update.isPending}
        onSubmit={(payload) => update.mutate(payload)}
        onClose={() => setEditingOpen(false)}
      />

      <ConfirmModal
        open={deleting}
        onOpenChange={setDeleting}
        title="Guruhni o'chirish"
        description={`${group.name} guruhi o'chiriladi. O'qituvchilar biriktirilishi ham olib tashlanadi.`}
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => remove.mutate(group.id)}
      />
    </div>
  );
}
