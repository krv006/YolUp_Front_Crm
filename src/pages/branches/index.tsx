import { useState } from "react";
import { Building2, DoorOpen, Plus, Users } from "lucide-react";

import {
  BranchForm,
  BranchTable,
  branchPayload,
  useBranchCreate,
  useBranchDelete,
  useBranchList,
  useBranchUpdate,
  type Branch,
  type BranchValues,
} from "@/modules/branches";
import { useGroupList } from "@/modules/groups";
import { useRoomList } from "@/modules/rooms";
import { useStudentList } from "@/modules/students";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ListToolbar } from "@/shared/ui/list-toolbar";
import { ConfirmModal } from "@/shared/ui/modal";
import { PageHeader } from "@/shared/ui/page-header";
import { Pagination } from "@/shared/ui/pagination";
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

const FORM_ID = "branch-form";

function toFormValues(branch: Branch): Partial<BranchValues> {
  return {
    name: branch.name,
    code: branch.code,
    address: branch.address ?? "",
    phone: branch.phone ?? "",
    is_active: branch.is_active,
  };
}

export default function BranchesPage() {
  const list = useListState();
  const { data, isLoading } = useBranchList(list.params);
  const branches = data?.results ?? [];
  const total = data?.count ?? 0;

  /* Filiallar bo'yicha taqsimot — sarlavha ko'rsatkichlari (butun markaz). */
  const { data: branchesStats } = useBranchList({ page: 1, page_size: 1 });
  const { data: roomsData } = useRoomList({ page: 1, page_size: 1 });
  const { data: groupsData } = useGroupList({ page: 1, page_size: 1 });
  const { data: studentsData } = useStudentList({ page: 1, page_size: 1 });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState<Branch | null>(null);

  const create = useBranchCreate(() => setCreating(false));
  const update = useBranchUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useBranchDelete(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);
  const filtered = Boolean(list.search || list.activeFilterCount);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: BranchValues) => {
    const payload = branchPayload(values);
    if (editing) {
      update.mutate(payload);
      return;
    }
    create.mutate(payload);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Filiallar"
        subtitle="Har bir filial o'z xonalari, guruhlari va o'quvchilariga ega"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Filial qo'shish
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          size="sm"
          label="Filiallar"
          value={formatNumber(branchesStats?.count ?? total)}
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="Xonalar"
          value={formatNumber(roomsData?.count ?? 0)}
          tone="info"
          icon={<DoorOpen className="h-4 w-4" />}
        />
        <StatCard
          size="sm"
          label="O'quvchilar"
          value={formatNumber(studentsData?.count ?? 0)}
          tone="success"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <ListToolbar
        value={list.search}
        onSearch={list.setSearch}
        placeholder="Filial nomi yoki kodi…"
        hint={
          <>
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta filial ·{" "}
            <span className="money font-semibold text-ink">
              {formatNumber(groupsData?.count ?? 0)}
            </span>{" "}
            ta guruh
          </>
        }
      />

      <Card className="overflow-hidden">
        <BranchTable
          branches={branches}
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
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-brand-700 text-[#cfe0ff]">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Filialni tahrirlash" : "Yangi filial"}</SheetTitle>
              <SheetDescription>
                Filial kodi hisobotlarda va hujjatlarda ishlatiladi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <BranchForm
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
        title="Filialni o'chirish"
        description={
          deleting
            ? `${deleting.name} filiali o'chiriladi. Bu filialga bog'langan xona va guruhlar ham ta'sirlanadi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
