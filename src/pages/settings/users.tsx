import { useState } from "react";
import { Plus, UserRound } from "lucide-react";

import {
  UserForm,
  UserTable,
  useUserCreate,
  useUserList,
  useUserRemove,
  useUserUpdate,
  type User,
  type UserValues,
} from "@/modules/users";
import { useBranchList } from "@/modules/branches";
import { ROLE_LABELS } from "@/core/auth";
import { ROLE_PERMISSIONS } from "@/core/permission";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ConfirmModal } from "@/shared/ui/modal";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { PageHeader } from "@/shared/ui/page-header";
import { Pagination } from "@/shared/ui/pagination";
import { StatCard } from "@/shared/ui/stat-card";
import { ListToolbar } from "@/shared/ui/list-toolbar";
import { Select } from "@/shared/ui/select";
import { formatNumber } from "@/shared/lib";
import { useListState } from "@/shared/model";

const ROLE_OPTIONS = Object.keys(ROLE_PERMISSIONS).map((value) => ({
  value,
  label: ROLE_LABELS[value as keyof typeof ROLE_LABELS] ?? value,
}));

export default function SettingsUsersPage() {
  const list = useListState({ pageSize: 20 });
  const branchesQuery = useBranchList({ page: 1, page_size: 100, ordering: "name" });
  const branches = branchesQuery.data?.results ?? [];

  const { data, isLoading } = useUserList(list.params);
  const users: User[] = data?.results ?? [];
  const total = data?.count ?? 0;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const create = useUserCreate(() => setCreating(false));
  const update = useUserUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useUserRemove(() => setDeleting(null));

  const formOpen = creating || Boolean(editing);

  const roleCounts = users.reduce<Record<string, number>>((counts, user) => {
    counts[user.role] = (counts[user.role] ?? 0) + 1;
    return counts;
  }, {});

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: UserValues, onError: (error: unknown) => void) => {
    if (creating && !values.password) {
      onError(new Error("Yangi xodim uchun parol majburiy"));
      return;
    }
    const payload = {
      ...values,
      branch_id: values.branch_id || null,
      middle_name: values.middle_name || null,
      email: values.email || null,
      ...(values.password ? {} : { password: undefined }),
    };
    if (editing) {
      update.mutate(payload);
    } else {
      create.mutate(payload);
    }
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Xodimlar"
        subtitle={`Jamoa a'zolari va ularning rollari · ${formatNumber(total)} ta xodim`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Yangi xodim
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ROLE_OPTIONS.map((role) => (
          <StatCard
            key={role.value}
            size="sm"
            label={role.label}
            value={formatNumber(roleCounts[role.value] ?? 0)}
            icon={<UserRound className="h-4 w-4" />}
          />
        ))}
      </div>

      <ListToolbar
        value={list.search}
        onSearch={list.setSearch}
        placeholder="Ism, familiya yoki telefon…"
        filters={[
          <Select
            key="role"
            aria-label="Rol bo'yicha filtr"
            value={list.filters.role ?? ""}
            onChange={(event) => list.setFilter("role", event.target.value)}
            className="h-9 text-sm"
          >
            <option value="">Barcha rollar</option>
            {ROLE_OPTIONS.map((option) => (
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
            <option value="true">Faol</option>
            <option value="false">Nofaol</option>
          </Select>,
        ]}
        hint={
          <>
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta xodim
          </>
        }
      />

      <Card className="overflow-hidden">
        <UserTable
          users={users}
          isLoading={isLoading}
          branchNameOf={(branchId) =>
            branchId
              ? (branches.find((branch) => branch.id === branchId)?.name ?? "Filial")
              : "—"
          }
          sort={list.sort}
          onSortChange={list.toggleSort}
          onEdit={setEditing}
          onDelete={setDeleting}
          onCreate={() => setCreating(true)}
          onClearFilters={list.resetFilters}
          filtered={Boolean(list.search || list.activeFilterCount)}
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
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <SheetTitle>{editing ? "Xodimni tahrirlash" : "Yangi xodim"}</SheetTitle>
              <SheetDescription>
                Rol xodimning ruxsatlarini belgilaydi. Parolni keyin ham o'zgartirish mumkin.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <UserForm
              key={editing?.id ?? "new"}
              roles={ROLE_OPTIONS}
              branches={branches}
              passwordRequired={creating}
              defaultValues={{
                branch_id: editing?.branch_id ?? "",
                role: editing?.role ?? ROLE_OPTIONS[0]?.value ?? "",
                first_name: editing?.first_name ?? "",
                last_name: editing?.last_name ?? "",
                middle_name: editing?.middle_name ?? "",
                phone: editing?.phone ?? "",
                email: editing?.email ?? "",
                password: "",
              }}
              isPending={create.isPending || update.isPending}
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
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xodimni o'chirish"
        description={
          deleting
            ? `"${deleting.first_name} ${deleting.last_name}" xodimini o'chirishni tasdiqlaysizmi?`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
