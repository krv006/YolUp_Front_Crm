import { useState } from "react";
import { Ban, Building2, CreditCard, Plus, TrendingUp } from "lucide-react";

import {
  TenantForm,
  TenantTable,
  tenantPayload,
  useTenantBlock,
  useTenantCreate,
  useTenantDelete,
  useTenantList,
  useTenantUnblock,
  useTenantUpdate,
  type Tenant,
  type TenantValues,
} from "@/modules/tenants";
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
import { formatNumber } from "@/shared/lib";
import { useListState } from "@/shared/model";

const FORM_ID = "tenant-form";

function toFormValues(tenant: Tenant): Partial<TenantValues> {
  return {
    name: tenant.name,
    slug: tenant.slug,
    phone: tenant.phone ?? "",
    email: tenant.email ?? "",
    address: tenant.address ?? "",
    currency: tenant.currency,
    subscription_tier: tenant.subscription_tier,
    max_students: tenant.max_students ?? undefined,
  };
}

export default function TenantsPage() {
  const list = useListState();
  const { data, isLoading } = useTenantList(list.params);
  const tenants = data?.results ?? [];
  const total = data?.count ?? 0;

  /* Operator panel ko'rsatkichlari. */
  const { data: activeData } = useTenantList({ page: 1, page_size: 1, subscription_status: "active" });
  const { data: trialData } = useTenantList({ page: 1, page_size: 1, subscription_status: "trial" });
  const { data: blockedData } = useTenantList({ page: 1, page_size: 1, is_blocked: true });

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const [deleting, setDeleting] = useState<Tenant | null>(null);

  const create = useTenantCreate(() => setCreating(false));
  const update = useTenantUpdate(editing?.id ?? "", () => setEditing(null));
  const remove = useTenantDelete(() => setDeleting(null));
  const block = useTenantBlock();
  const unblock = useTenantUnblock();

  const formOpen = creating || Boolean(editing);
  const filtered = Boolean(list.search || list.activeFilterCount);

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (values: TenantValues) => {
    const payload = tenantPayload(values);
    if (editing) {
      update.mutate(payload);
      return;
    }
    create.mutate(payload);
  };

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Markazlar"
        subtitle="Operator paneli — barcha YolUp markazlari, tariflar va obunalar"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Markaz qo'shish
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Jami markazlar"
          value={formatNumber(total)}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          label="Faol obuna"
          value={formatNumber(activeData?.count ?? 0)}
          tone="success"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Sinov muddatida"
          value={formatNumber(trialData?.count ?? 0)}
          tone="info"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          label="Bloklangan"
          value={formatNumber(blockedData?.count ?? 0)}
          tone="danger"
          icon={<Ban className="h-5 w-5" />}
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={list.search}
            onChange={list.setSearch}
            placeholder="Markaz nomi yoki slug…"
            className="w-full sm:w-[280px]"
          />

          <Select
            aria-label="Obuna holati bo'yicha filtr"
            value={list.filters.subscription_status ?? ""}
            onChange={(event) => list.setFilter("subscription_status", event.target.value)}
            className="h-10 w-auto min-w-[160px]"
          >
            <option value="">Barcha obunalar</option>
            <option value="active">Faol</option>
            <option value="trial">Sinov</option>
            <option value="expired">Muddati tugagan</option>
            <option value="blocked">Bloklangan</option>
          </Select>

          <Select
            aria-label="Tarif bo'yicha filtr"
            value={list.filters.subscription_tier ?? ""}
            onChange={(event) => list.setFilter("subscription_tier", event.target.value)}
            className="h-10 w-auto min-w-[160px]"
          >
            <option value="">Barcha tariflar</option>
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </Select>

          <span className="ml-auto text-sm text-ink-muted">
            <span className="money font-semibold text-ink">{formatNumber(total)}</span> ta markaz
          </span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <TenantTable
          tenants={tenants}
          isLoading={isLoading}
          sort={list.sort}
          onSortChange={list.toggleSort}
          onEdit={setEditing}
          onDelete={setDeleting}
          onToggleBlock={(tenant) =>
            tenant.is_blocked ? unblock.mutate(tenant.id) : block.mutate(tenant.id)
          }
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
              <SheetTitle>{editing ? "Markazni tahrirlash" : "Yangi markaz"}</SheetTitle>
              <SheetDescription>
                Slug subdomen uchun ishlatiladi va keyinchalik o'zgartirilmaydi.
              </SheetDescription>
            </div>
          </SheetHeader>

          <SheetBody>
            <TenantForm
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
        title="Markazni o'chirish"
        description={
          deleting
            ? `${deleting.name} markazi va uning barcha ma'lumotlari o'chiriladi. Bu amalni qaytarib bo'lmaydi.`
            : undefined
        }
        confirmLabel="O'chirish"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </div>
  );
}
