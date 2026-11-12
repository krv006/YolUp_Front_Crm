import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { LayoutGrid, List, Plus, UserCog, Users } from 'lucide-react';

import {
  GroupCard,
  GroupFormSheet,
  GroupTable,
  useGroupCreate,
  useGroupDelete,
  useGroupList,
  useGroupUpdate,
  type Group,
} from '@/modules/groups';
import { usePermission } from '@/core/permission';
import { useBranchList } from '@/modules/branches';
import { useCourseList } from '@/modules/courses';
import { useRoomList } from '@/modules/rooms';
import { useUserList } from '@/modules/users';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ConfirmModal } from '@/shared/ui/modal';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListToolbar } from '@/shared/ui/list-toolbar';
import { PageHeader } from '@/shared/ui/page-header';
import { Pagination } from '@/shared/ui/pagination';
import { Select } from '@/shared/ui/select';
import { StatCard } from '@/shared/ui/stat-card';
import { Tabs } from '@/shared/ui/tabs';
import { formatNumber } from '@/shared/lib';
import { useListState } from '@/shared/model';

/** Ko'rsatkichlar uchun barcha guruhlar (markaz bo'yicha yig'indi). */
const STATS_PARAMS = { page: 1, page_size: 100 };

export default function GroupsPage() {
  const navigate = useNavigate();
  const list = useListState({ pageSize: 12 });
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const { can } = usePermission();
  const canCreate = can('groups.create');
  const canUpdate = can('groups.update');
  const canDelete = can('groups.delete');
  const canManage = canUpdate || canDelete;

  const { data, isLoading } = useGroupList(list.params);
  const groups = data?.results ?? [];
  const total = data?.count ?? 0;

  const { data: statsData } = useGroupList(STATS_PARAMS);
  const allGroups = statsData?.results ?? [];
  const { data: branchesData } = useBranchList({ page: 1, page_size: 100 });
  const { data: coursesData } = useCourseList({ page: 1, page_size: 100 });
  const { data: roomsData } = useRoomList({ page: 1, page_size: 100, is_active: 'true' });
  const { data: teachersData } = useUserList({ role: 'teacher', page: 1, page_size: 100 });

  const branches = branchesData?.results ?? [];
  const courses = coursesData?.results ?? [];
  const rooms = roomsData?.results ?? [];
  const teachers = teachersData?.results ?? [];

  const activeCount = allGroups.filter((group) => group.status === 'active').length;
  const studentTotal = allGroups.reduce((sum, group) => sum + (group.students_count ?? 0), 0);
  const seatTotal = allGroups.reduce((sum, group) => sum + (group.capacity ?? 0), 0);
  const teachersWithoutGroup = teachers.filter(
    (teacher) => !allGroups.some((group) => group.teacher_id === teacher.id)
  ).length;
  const occupancy = seatTotal > 0 ? Math.round((studentTotal / seatTotal) * 100) : 0;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState<Group | null>(null);

  const create = useGroupCreate(() => setCreating(false));
  const update = useGroupUpdate(editing?.id ?? '', () => setEditing(null));
  const remove = useGroupDelete(() => setDeleting(null));

  const filtered = Boolean(list.search || list.activeFilterCount);
  const openGroup = (group: Group) =>
    navigate({ to: '/groups/$groupId', params: { groupId: group.id } });

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Guruhlar"
        subtitle={`${formatNumber(allGroups.length)} ta guruh · ${formatNumber(studentTotal)} ta o'quvchi · ${teachers.length} ta o'qituvchi`}
        actions={
          canCreate ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Guruh yaratish
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          size="sm"
          label="Jami guruhlar"
          value={formatNumber(statsData?.count ?? 0)}
          hint={`${activeCount} ta faol`}
          icon={<LayoutGrid className="h-5 w-5" />}
        />
        <StatCard
          size="sm"
          label="O'quvchilar"
          value={formatNumber(studentTotal)}
          hint={`${formatNumber(seatTotal)} o'rin mavjud`}
          tone="info"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          size="sm"
          label="Bandlik"
          value={`${occupancy}%`}
          hint={`${formatNumber(studentTotal)} / ${formatNumber(seatTotal)} o'rin`}
          tone="success"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          size="sm"
          label="Guruhsiz o'qituvchilar"
          value={formatNumber(teachersWithoutGroup)}
          hint={`${teachers.length} ta o'qituvchi ichida`}
          tone={teachersWithoutGroup > 0 ? 'warning' : 'neutral'}
          icon={<UserCog className="h-5 w-5" />}
        />
      </div>

      <ListToolbar
        value={list.search}
        onSearch={list.setSearch}
        placeholder="Guruh nomi, kurs yoki o'qituvchi…"
        hint={`${formatNumber(total)} ta guruh`}
        trailing={
          <Tabs
            variant="pill"
            label="Ko'rinish"
            value={view}
            onChange={(value) => setView(value as 'cards' | 'table')}
            items={[
              { value: 'cards', label: 'Kartalar', icon: <LayoutGrid className="h-4 w-4" /> },
              { value: 'table', label: 'Jadval', icon: <List className="h-4 w-4" /> },
            ]}
          />
        }
        filters={[
          <Select
            key="course"
            aria-label="Kurs bo'yicha filtr"
            className="h-9 text-sm"
            value={list.filters.course_id ?? ''}
            onChange={(event) => list.setFilter('course_id', event.target.value)}
          >
            <option value="">Barcha kurslar</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>,
          <Select
            key="teacher"
            aria-label="O'qituvchi bo'yicha filtr"
            className="h-9 text-sm"
            value={list.filters.teacher_id ?? ''}
            onChange={(event) => list.setFilter('teacher_id', event.target.value)}
          >
            <option value="">Barcha o'qituvchilar</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </Select>,
          <Select
            key="status"
            aria-label="Holat bo'yicha filtr"
            className="h-9 text-sm"
            value={list.filters.status ?? ''}
            onChange={(event) => list.setFilter('status', event.target.value)}
          >
            <option value="">Barcha holat</option>
            <option value="active">Faol</option>
            <option value="planned">Rejalashtirilgan</option>
            <option value="completed">Tugallangan</option>
          </Select>,
        ]}
      />

      {view === 'cards' ? (
        groups.length === 0 && !isLoading ? (
          <Card>
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="Guruh topilmadi"
              description={
                canCreate
                  ? "Qidiruvni o'zgartiring yoki yangi guruh yarating."
                  : "Qidiruv yoki filtrga mos guruh yo'q."
              }
              action={
                canCreate ? (
                  <Button size="sm" onClick={() => setCreating(true)}>
                    <Plus className="h-4 w-4" />
                    Guruh yaratish
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} onOpen={openGroup} />
            ))}
          </div>
        )
      ) : (
        <Card className="overflow-hidden">
          <GroupTable
            groups={groups}
            isLoading={isLoading}
            sort={list.sort}
            onSortChange={list.toggleSort}
            onOpen={openGroup}
            onEdit={setEditing}
            onDelete={setDeleting}
            onCreate={() => setCreating(true)}
            onClearFilters={list.resetFilters}
            filtered={filtered}
            canManage={canManage}
            canCreate={canCreate}
          />
        </Card>
      )}

      {total > 0 && (
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={total}
          onPageChange={list.setPage}
          onPageSizeChange={list.setPageSize}
          pageSizeOptions={[12, 24, 48]}
        />
      )}

      <GroupFormSheet
        open={creating || Boolean(editing)}
        group={editing}
        branches={branches.map((branch) => ({ id: branch.id, name: branch.name }))}
        courses={courses.map((course) => ({ id: course.id, name: course.name }))}
        rooms={rooms.map((room) => ({
          id: room.id,
          name: room.name,
          branchId: room.branch_id,
          capacity: room.capacity,
        }))}
        pending={create.isPending || update.isPending}
        onSubmit={(payload) => (editing ? update.mutate(payload) : create.mutate(payload))}
        onClose={closeForm}
      />

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Guruhni o'chirish"
        description={
          deleting ? `${deleting.name} guruhi o'chiriladi. O'quvchilar guruhsiz qoladi.` : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
