import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Clock, History, UserX } from "lucide-react";

import {
  useAttendanceBulk,
  useLessonRoster,
  type AttendanceStatus,
} from "@/modules/attendance";
import { useGroupList } from "@/modules/groups";
import { useLessonList } from "@/modules/lessons";
import { ATTENDANCE_STATUS } from "@/core/status";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { Select } from "@/shared/ui/select";
import { StatCard } from "@/shared/ui/stat-card";
import { formatDate, formatNumber, formatTime } from "@/shared/lib";
import { cn } from "@/shared/lib/cn";
import AttendanceRoster from "@/widgets/attendance-roster/AttendanceRoster";

/** Hisobotdagi ko'rsatkichlar uchun — holatning "keldi" hisoblanishi. */
const PRESENT_STATUSES: AttendanceStatus[] = ["PRESENT", "LATE"];

/**
 * Davomat sahifasi — **har bir dars uchun alohida**.
 *
 * Oqim: guruh → dars (sana) → o'quvchilarni belgilash → saqlash.
 * Ilgari bu sahifa har bir o'quvchi uchun bitta global yozuv ko'rsatardi va
 * darsga bog'lanmagan edi.
 */
export default function AttendancePage() {
  const { data: groupsData, isLoading: groupsLoading } = useGroupList({
    page: 1,
    page_size: 100,
  });

  const groups = useMemo(
    () => (groupsData?.results ?? []).filter((group) => group.status !== "archived"),
    [groupsData],
  );

  const [groupId, setGroupId] = useState("");
  const [lessonId, setLessonId] = useState("");

  /* Guruhlar yuklangach birinchisini avtomatik tanlaymiz. */
  useEffect(() => {
    if (!groupId && groups.length > 0) setGroupId(groups[0].id);
  }, [groupId, groups]);

  const { data: lessonsPage, isLoading: lessonsLoading } = useLessonList({
    group_id: groupId,
    page: 1,
    page_size: 50,
    ordering: "-starts_at",
  });
  const lessons = useMemo(() => lessonsPage?.results ?? [], [lessonsPage]);

  /*
   * Davomat faqat **o'tgan** darslar uchun olinadi. Kelgusi darslarni
   * tanlash mantiqiy emas (ular hali o'tmagan) — ilgari ro'yxatda eng
   * yuqorida kelgusi dars turib, standart tanlov ham o'sha bo'lardi.
   */
  const pastLessons = useMemo(() => {
    const nowTime = Date.now();
    return lessons.filter((item) => new Date(item.starts_at).getTime() <= nowTime);
  }, [lessons]);

  /* Darslar yuklangach eng yangisini tanlaymiz (u hali belgilanmagan). */
  useEffect(() => {
    if (lessonId && pastLessons.some((lesson) => lesson.id === lessonId)) return;
    if (pastLessons.length > 0) setLessonId(pastLessons[0].id);
  }, [lessonId, pastLessons]);

  const lesson = pastLessons.find((item) => item.id === lessonId);
  const { data: roster, isLoading: rosterLoading } = useLessonRoster(lessonId);
  const bulk = useAttendanceBulk();

  const history = useMemo(() => pastLessons.slice(0, 12), [pastLessons]);

  const selectedGroup = groups.find((group) => group.id === groupId);
  const groupName = selectedGroup?.name ?? "";

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Davomat"
        subtitle="Har bir dars uchun qatnashuvni belgilang"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Guruhdagi o'quvchilar"
          value={formatNumber(lesson?.students_count ?? roster?.length ?? 0)}
          tone="info"
          icon={<UserX className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="Belgilangan"
          value={formatNumber(lesson?.marked_count ?? 0)}
          tone="action"
          icon={<CheckCircle2 className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="Keldi / kechikdi"
          value={formatNumber(lesson?.present_count ?? 0)}
          tone="success"
          icon={<Clock className="h-5 w-5" />}
          size="sm"
        />
        <StatCard
          label="Davomat foizi"
          value={
            lesson && lesson.marked_count
              ? `${formatNumber(lesson.attendance_rate ?? 0)}%`
              : "—"
          }
          tone={
            lesson && (lesson.attendance_rate ?? 0) >= 80
              ? "success"
              : lesson && (lesson.attendance_rate ?? 0) >= 60
                ? "warning"
                : "danger"
          }
          icon={<CalendarDays className="h-5 w-5" />}
          size="sm"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4">
          <Card className="p-3.5">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                aria-label="Guruh tanlash"
                value={groupId}
                onChange={(event) => {
                  setGroupId(event.target.value);
                  setLessonId("");
                }}
                className="h-9 text-sm"
                wrapperClassName="w-full sm:w-auto sm:min-w-[240px]"
                disabled={groupsLoading}
              >
                {groups.length === 0 && <option value="">Guruh yo'q</option>}
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>

              <Select
                aria-label="Dars tanlash"
                value={lessonId}
                onChange={(event) => setLessonId(event.target.value)}
                className="h-9 text-sm"
                wrapperClassName="w-full sm:w-auto sm:min-w-[240px]"
                disabled={lessonsLoading || pastLessons.length === 0}
              >
                {pastLessons.length === 0 && <option value="">Dars yo'q</option>}
                {pastLessons.map((item) => (
                  <option key={item.id} value={item.id}>
                    {formatDate(item.starts_at)} · {formatTime(item.starts_at)} ·{" "}
                    {item.title ?? "Dars"}
                  </option>
                ))}
              </Select>

              {selectedGroup?.schedule_label ? (
                <Chip tone="neutral">{selectedGroup.schedule_label}</Chip>
              ) : null}

              {lesson && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-ink-secondary">
                  <Chip tone={lesson.is_marked ? "success" : "warning"} dot>
                    {lesson.is_marked ? "Belgilangan" : "Belgilanmagan"}
                  </Chip>
                  <span>{lesson.room_name ?? "—"}</span>
                  {lesson.teacher_name && <span>· {lesson.teacher_name}</span>}
                </div>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            {lessonId && roster ? (
              <AttendanceRoster
                key={lessonId}
                roster={roster}
                isLoading={rosterLoading}
                isPending={bulk.isPending}
                onSave={(items) => bulk.mutate({ lesson_id: lessonId, items })}
              />
            ) : pastLessons.length === 0 ? (
              <EmptyState
                title="Bu guruhda o'tgan darslar yo'q"
                description={
                  selectedGroup?.schedule_label
                    ? `Jadval: ${selectedGroup.schedule_label}. Darslar jadval asosida avtomatik yaratiladi — birozdan so'ng ro'yxat yangilanadi.`
                    : "Guruh jadvalida dars kunlari belgilanmagan. Guruh sahifasida haftalik jadvalni kiriting — shundan keyin davomat darslari paydo bo'ladi."
                }
                action={
                  groupId ? (
                    <Link
                      to="/groups/$groupId"
                      params={{ groupId }}
                      className="text-sm font-semibold text-action hover:underline"
                    >
                      Guruhni ochish
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <EmptyState
                title="Dars tanlanmagan"
                description="Guruh va darsni tanlang — keyin o'quvchilar ro'yxati shu yerda chiqadi."
              />
            )}
          </Card>
        </div>

        <Card className="overflow-hidden self-start">
          <header className="flex items-center gap-2 border-b border-divider px-4 py-3">
            <History className="h-4 w-4 text-ink-muted" />
            <h2 className="text-sm font-bold text-ink">So'nggi darslar</h2>
            <span className="ml-auto text-xs text-ink-muted">{groupName}</span>
          </header>

          {history.length === 0 ? (
            <EmptyState
              title="Dars topilmadi"
              description="Tanlangan guruh uchun darslar hali yaratilmagan."
            />
          ) : (
            <ul className="divide-y divide-divider">
              {history.map((item) => {
                const active = item.id === lessonId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setLessonId(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2",
                        active && "bg-action-soft/40",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {formatDate(item.starts_at)} · {formatTime(item.starts_at)}
                        </span>
                        <span className="block truncate text-xs text-ink-muted">
                          {item.title ?? "Dars"}
                        </span>
                      </span>
                      {item.is_marked ? (
                        <span className="money flex-none text-xs font-semibold text-success-ink">
                          {formatNumber(item.attendance_rate ?? 0)}%
                        </span>
                      ) : (
                        <Chip tone="warning">Yangi</Chip>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <p className="text-xs text-ink-muted">
        Belgilash mumkin bo'lgan holatlar:{" "}
        {PRESENT_STATUSES.map((status) => ATTENDANCE_STATUS[status].label).join(", ")},{" "}
        {ATTENDANCE_STATUS.ABSENT.label}, {ATTENDANCE_STATUS.EXCUSED.label}.
      </p>
    </div>
  );
}
