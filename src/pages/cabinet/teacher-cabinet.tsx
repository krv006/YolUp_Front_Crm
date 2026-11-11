import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, ClipboardCheck, DoorOpen, Users } from "lucide-react";

import { useGroupList } from "@/modules/groups";
import { useLessonList } from "@/modules/lessons";
import { useCurrentUser } from "@/core/auth";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Chip } from "@/shared/ui/chip";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { StatCard } from "@/shared/ui/stat-card";
import { formatDate, formatNumber, formatTime } from "@/shared/lib";

/**
 * O'qituvchi kabineti.
 *
 * O'qituvchi uchun eng kerakli ish: bugungi darslarini ko'rish va davomatni
 * belgilash. Shu sabab sahifa "guruhlarim → darslarim → davomat" zanjirini
 * ko'rsatadi. Boshqa bo'limlar (moliya, lidlar) unga yopiq.
 */
export default function TeacherCabinet() {
  const user = useCurrentUser();

  const { data: groupsData, isLoading: groupsLoading } = useGroupList({
    page: 1,
    page_size: 100,
  });

  /* Faqat shu o'qituvchining guruhlari. */
  const groups = useMemo(
    () => (groupsData?.results ?? []).filter((group) => group.teacher_id === user?.id),
    [groupsData, user?.id],
  );

  const groupIds = useMemo(() => new Set(groups.map((group) => group.id)), [groups]);

  const { data: lessonsData, isLoading: lessonsLoading } = useLessonList({
    page: 1,
    page_size: 200,
    ordering: "-starts_at",
  });

  const myLessons = useMemo(
    () => (lessonsData?.results ?? []).filter((lesson) => groupIds.has(lesson.group_id)),
    [lessonsData, groupIds],
  );

  const nowTime = Date.now();
  const today = new Date().toDateString();

  const todays = myLessons
    .filter((lesson) => new Date(lesson.starts_at).toDateString() === today)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const upcoming = myLessons
    .filter((lesson) => new Date(lesson.starts_at).getTime() > nowTime)
    .slice(0, 5);

  const unmarked = myLessons.filter(
    (lesson) => !lesson.is_marked && new Date(lesson.starts_at).getTime() <= nowTime,
  );

  const studentsTotal = groups.reduce(
    (sum, group) => sum + Number(group.students_count ?? 0),
    0,
  );

  const isLoading = groupsLoading || lessonsLoading;

  return (
    <div className="grid gap-5">
      <PageHeader
        title={`Salom, ${user?.first_name ?? ""}`}
        subtitle="Guruhlaringiz, bugungi darslar va belgilanmagan davomat"
        actions={
          <Link to="/attendance">
            <Button>
              <ClipboardCheck className="h-4 w-4" />
              Davomat belgilash
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          size="sm"
          label="Guruhlarim"
          value={formatNumber(groups.length)}
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="O'quvchilarim"
          value={formatNumber(studentsTotal)}
          tone="info"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Bugungi darslar"
          value={formatNumber(todays.length)}
          tone="action"
          icon={<DoorOpen className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Davomat kutilmoqda"
          value={formatNumber(unmarked.length)}
          tone={unmarked.length > 0 ? "warning" : "success"}
          hint={unmarked.length > 0 ? "Belgilanmagan o'tgan darslar" : "Hammasi belgilangan"}
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
            <h2 className="text-sm font-bold text-ink">Bugungi darslar</h2>
            <span className="text-xs text-ink-muted">{formatDate(new Date().toISOString())}</span>
          </header>

          {isLoading ? (
            <div className="grid gap-2 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-md bg-surface-2" />
              ))}
            </div>
          ) : todays.length === 0 ? (
            <EmptyState
              title="Bugun darsingiz yo'q"
              description="Jadval bo'yicha bugun dars rejalashtirilmagan."
            />
          ) : (
            <ul className="divide-y divide-divider">
              {todays.map((lesson) => (
                <li key={lesson.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="money w-16 flex-none text-sm font-bold text-ink">
                    {formatTime(lesson.starts_at)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {lesson.group_name ?? lesson.title ?? "Dars"}
                    </span>
                    <span className="block truncate text-xs text-ink-muted">
                      {lesson.room_name ?? "Xona yo'q"} ·{" "}
                      {formatNumber(lesson.students_count ?? 0)} o'quvchi
                    </span>
                  </span>
                  <Chip tone={lesson.is_marked ? "success" : "warning"} dot>
                    {lesson.is_marked
                      ? `${formatNumber(lesson.attendance_rate ?? 0)}%`
                      : "Belgilanmagan"}
                  </Chip>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3">
            <h2 className="text-sm font-bold text-ink">Kelgusi darslar</h2>
          </header>

          {upcoming.length === 0 ? (
            <EmptyState
              title="Kelgusi dars yo'q"
              description="Jadvalda yaqin kunlar uchun dars topilmadi."
            />
          ) : (
            <ul className="divide-y divide-divider">
              {upcoming.map((lesson) => (
                <li key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="money w-28 flex-none text-xs font-semibold text-ink-secondary">
                    {formatDate(lesson.starts_at)} {formatTime(lesson.starts_at)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {lesson.group_name ?? lesson.title ?? "Dars"}
                  </span>
                  <span className="flex-none text-xs text-ink-muted">
                    {lesson.room_name ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <header className="border-b border-divider px-4 py-3">
          <h2 className="text-sm font-bold text-ink">Guruhlarim</h2>
        </header>

        {groups.length === 0 ? (
          <EmptyState
            title="Guruh biriktirilmagan"
            description="Sizga hali guruh biriktirilmagan — administratorga murojaat qiling."
          />
        ) : (
          <ul className="divide-y divide-divider">
            {groups.map((group) => (
              <li key={group.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span
                  className="h-8 w-1.5 flex-none rounded-full"
                  style={{ backgroundColor: group.color ?? "transparent" }}
                />
                <span className="min-w-0 flex-1">
                  <Link
                    to="/groups/$groupId"
                    params={{ groupId: group.id }}
                    className="block truncate text-sm font-semibold text-ink hover:text-action-soft-text"
                  >
                    {group.name}
                  </Link>
                  <span className="block truncate text-xs text-ink-muted">
                    {group.schedule_label ?? "Jadval yo'q"} · {group.room_name ?? "Xona yo'q"}
                  </span>
                </span>
                <Chip tone="neutral">
                  {formatNumber(group.students_count ?? 0)}/{group.capacity ?? "—"}
                </Chip>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
