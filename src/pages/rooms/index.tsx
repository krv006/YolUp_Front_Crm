import { useMemo, useState } from "react";
import { CheckCircle2, DoorOpen, Plus, Users } from "lucide-react";

import {
  RoomForm,
  RoomTable,
  roomPayload,
  useRoomCreate,
  useRoomDelete,
  useRoomList,
  useRoomUpdate,
  type Room,
  type RoomValues,
} from "@/modules/rooms";
import { useBranchList } from "@/modules/branches";
import { useGroupList } from "@/modules/groups";
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

const FORM_ID = "room-form";

function toFormValues(room: Room): Partial<RoomValues> {
  return {
    branch_id: room.branch_id,
    name: room.name,
    capacity: room.capacity,
    is_active: room.is_active,
  };
}

export default function RoomsPage() {
  const list = useListState();
  const { data, isLoading } = useRoomList(list.params);
  const rooms = data?.results ?? [];
  const total = data?.count ?? 0;

  /* Ko'rsatkichlar butun markaz bo'yicha — qidiruv/filtrlardan qat'i nazar.
     Jadval ostidagi son esa joriy natijalarni ko'rsatadi. */
  const { data: stats } = useRoomList({ page: 1, page_size: 100 });
  const allRooms = stats?.results ?? [];

  /* Filial nomlari va guruh bandligi — jadval uchun qo'shimcha ma'lumot. */
  const { data: branchesData } = useBranchList({ page: 1, page_size: 100 });
  const { data: groupsData } = useGroupList({ page: 1, page_size: 100 });
  const branches = branchesData?.results ?? [];

  const occupancy = useMemo(() => {
    const map: Record<string, number> = {};
    for (const group of groupsData?.results ?? []) {
      if (!group.room_name) continue;
      map[group.room_name] = (map[group.room_name] ?? 0) + (group.students_count ?? 0);
    }
    return map;
  }, [groupsData]);

  const activeCount = allRooms.filter((room) => room.is_active).length;
  const capacityTotal = allRooms.reduce((sum, room) => sum + room.capacity, 0);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);

  const create = useRoomCreate(() => setCreating(false));
  const update = useRoomUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useRoomDelete(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);
  const filtered = Boolean(list.search || list.activeFilterCount);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: RoomValues) => {
    const payload = roomPayload(values);
    if (editing) {
      update.mutate(payload);
      return;
    }
    create.mutate(payload);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Xonalar"
        subtitle="Sig'im, filial va bandlik"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Xona qo'shish
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          size="sm"
          label="Jami xonalar"
          value={formatNumber(stats?.count ?? total)}
          icon={<DoorOpen className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Faol xonalar"
          value={formatNumber(activeCount)}
          tone="success"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Umumiy sig'im"
          value={formatNumber(capacityTotal)}
          tone="info"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <ListToolbar
        value={list.search}
        onSearch={list.setSearch}
        placeholder="Xona raqami…"
        filters={[
          <Select
            key="branch"
            aria-label="Filial bo'yicha filtr"
            value={list.filters.branch_id ?? ""}
            onChange={(event) => list.setFilter("branch_id", event.target.value)}
            className="h-9 text-sm"
          >
            <option value="">Barcha filiallar</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </Select>,
        ]}
        hint={
          <>
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta xona
          </>
        }
      />

      <Card className="overflow-hidden">
        <RoomTable
          rooms={rooms}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onEdit={setEditing}
          onDelete={setDeleting}
          onCreate={() => setCreating(true)}
          onClearFilters={list.resetFilters}
          filtered={filtered}
          occupancy={occupancy}
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
              <DoorOpen className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Xonani tahrirlash" : "Yangi xona"}</SheetTitle>
              <SheetDescription>
                Xona sig'imi guruh bandligi va jadval hisobida ishlatiladi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <RoomForm
              key={editing?.id ?? "new"}
              formId={FORM_ID}
              defaultValues={editing ? toFormValues(editing) : undefined}
              branches={branches}
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
        title="Xonani o'chirish"
        description={
          deleting
            ? `${deleting.name}-xona o'chiriladi. Unga bog'langan jadval yozuvlari ham ta'sirlanadi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
