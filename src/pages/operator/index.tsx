import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Plus,
  ShieldBan,
  UsersRound,
} from 'lucide-react';
import { ENDPOINTS, http, type Paginated } from '@/shared/api';
import {
  formatDate,
  formatDateTime,
  formatNumber,
  toastError,
  toastSuccess,
  useDebouncedValue,
} from '@/shared/lib';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { DataTable, type Column } from '@/shared/ui/data-table';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { ConfirmModal } from '@/shared/ui/modal';
import { Pagination } from '@/shared/ui/pagination';
import { StatusBadge } from '@/core/status';
import type { Tenant } from '@/modules/tenants';
import { OperatorLayout } from './components/operator-layout';
import { OperatorFormSheet, type OperatorFormMode } from './components/operator-form-sheet';

type Owner = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
};
type Usage = {
  students_count: number;
  max_students: number;
  staff_count: number;
  branches_count: number;
};
type Audit = {
  id: string;
  action: string;
  actor_name?: string | null;
  target_type?: string | null;
  created_at: string;
};
type MutationInput = { path: string; body: unknown; patch?: boolean };
const PAGE_SIZE = 20;

export default function OperatorPanel({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const detailId = path.match(/^\/cpanel\/tenants\/([^/]+)\/?$/)?.[1];
  const auditMode = path.startsWith('/cpanel/audit');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [status, setStatus] = useState('');
  const [sheet, setSheet] = useState<OperatorFormMode | null>(null);
  const [target, setTarget] = useState<Tenant | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [confirm, setConfirm] = useState<Tenant | null>(null);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);
  const list = useQuery({
    queryKey: ['operator-tenants', debouncedSearch, page, status],
    queryFn: () =>
      http.list<Tenant>(ENDPOINTS.tenants.root, {
        search: debouncedSearch || undefined,
        page,
        page_size: PAGE_SIZE,
        status: status || undefined,
      }),
    enabled: !auditMode && !detailId,
  });
  const total = useQuery({
    queryKey: ['operator-stats', 'all'],
    queryFn: () => http.list<Tenant>(ENDPOINTS.tenants.root, { page: 1, page_size: 1 }),
    enabled: !auditMode && !detailId,
  });
  const active = useQuery({
    queryKey: ['operator-stats', 'active'],
    queryFn: () => http.list<Tenant>(ENDPOINTS.tenants.root, { page: 1, page_size: 1, status: 'active' }),
    enabled: !auditMode && !detailId,
  });
  const trial = useQuery({
    queryKey: ['operator-stats', 'trial'],
    queryFn: () => http.list<Tenant>(ENDPOINTS.tenants.root, { page: 1, page_size: 1, status: 'trial' }),
    enabled: !auditMode && !detailId,
  });
  const blocked = useQuery({
    queryKey: ['operator-stats', 'blocked'],
    queryFn: () => http.list<Tenant>(ENDPOINTS.tenants.root, { page: 1, page_size: 1, is_blocked: true }),
    enabled: !auditMode && !detailId,
  });
  const detail = useQuery({
    queryKey: ['operator-detail', detailId],
    queryFn: () => http.get<Tenant>(ENDPOINTS.tenants.byId(detailId!)),
    enabled: !!detailId,
  });
  const owners = useQuery({
    queryKey: ['operator-owners', detailId],
    queryFn: () => http.get<Owner[]>(ENDPOINTS.tenants.owners(detailId!)),
    enabled: !!detailId,
  });
  const usage = useQuery({
    queryKey: ['operator-usage', detailId],
    queryFn: () => http.get<Usage>(ENDPOINTS.tenants.usage(detailId!)),
    enabled: !!detailId,
  });
  const audit = useQuery({
    queryKey: ['operator-audit', auditPage],
    queryFn: () =>
      http.get<Paginated<Audit>>(ENDPOINTS.tenants.audit, {
        params: { page: auditPage, page_size: PAGE_SIZE },
      }),
    enabled: auditMode,
  });
  const mutation = useMutation({
    mutationFn: ({ path: url, body, patch }: MutationInput) =>
      patch ? http.patch(url, body) : http.post(url, body),
    onSuccess: () => {
      for (const key of [
        'operator-tenants',
        'operator-stats',
        'operator-detail',
        'operator-owners',
        'operator-usage',
        'operator-audit',
      ])
        void qc.invalidateQueries({ queryKey: [key] });
      toastSuccess('Ma’lumotlar saqlandi');
      setSheet(null);
      setConfirm(null);
      setOwner(null);
    },
    onError: toastError,
  });
  function openForm(mode: OperatorFormMode, tenant: Tenant | null = null) {
    setTarget(tenant);
    setSheet(mode);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sheet) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (sheet === 'create') {
      const { first_name, last_name, ceo_phone, password, ...tenant } = values;
      mutation.mutate({
        path: ENDPOINTS.tenants.root,
        body: {
          ...tenant,
          max_students: Number(tenant.max_students),
          ceo: { first_name, last_name, phone: ceo_phone, password },
        },
      });
      return;
    }
    if (!target) return;
    if (sheet === 'edit')
      mutation.mutate({ path: ENDPOINTS.tenants.byId(target.id), body: values, patch: true });
    if (sheet === 'subscription')
      mutation.mutate({
        path: ENDPOINTS.tenants.subscription(target.id),
        body: {
          ...values,
          max_students: Number(values.max_students),
          expires_at: new Date(String(values.expires_at)).toISOString(),
        },
      });
    if (sheet === 'owner') mutation.mutate({ path: ENDPOINTS.tenants.owners(target.id), body: values });
    if (sheet === 'password' && owner)
      mutation.mutate({
        path: ENDPOINTS.tenants.resetOwnerPassword(target.id, owner.id),
        body: values,
      });
  }
  const goList = () => void navigate({ to: '/cpanel/tenants' });
  const goDetail = (tenant: Tenant) =>
    void navigate({ to: '/cpanel/tenants/$tenantId', params: { tenantId: tenant.id } });
  const columns: Column<Tenant>[] = [
    {
      key: 'name',
      header: 'Markaz',
      render: (tenant) => (
        <button
          type="button"
          onClick={() => goDetail(tenant)}
          className="text-left focus-visible:outline-action"
        >
          <span className="block font-semibold text-ink hover:text-action">{tenant.name}</span>
          <span className="text-xs text-ink-muted">{tenant.slug}.yolup.uz</span>
        </button>
      ),
    },
    {
      key: 'subscription_tier',
      header: 'Tarif',
      render: (tenant) => <span className="capitalize">{tenant.subscription_tier}</span>,
    },
    {
      key: 'subscription_status',
      header: 'Obuna',
      render: (tenant) => <StatusBadge status={tenant.subscription_status} />,
    },
    {
      key: 'max_students',
      header: 'Limit',
      align: 'right',
      render: (tenant) => formatNumber(tenant.max_students ?? 0),
    },
    {
      key: 'subscription_expires_at',
      header: 'Muddat',
      render: (tenant) => formatDate(tenant.subscription_expires_at),
    },
    {
      key: 'is_blocked',
      header: 'Kirish',
      render: (tenant) => (
        <StatusBadge
          status={tenant.is_blocked ? 'blocked' : 'active'}
          label={tenant.is_blocked ? 'Bloklangan' : 'Ochiq'}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (tenant) => (
        <Button size="sm" variant="outline" onClick={() => goDetail(tenant)}>
          Batafsil
        </Button>
      ),
    },
  ];
  const auditColumns: Column<Audit>[] = [
    { key: 'created_at', header: 'Sana va vaqt', render: (row) => formatDateTime(row.created_at) },
    {
      key: 'action',
      header: 'Amal',
      render: (row) => <span className="font-medium">{row.action}</span>,
    },
    { key: 'actor_name', header: 'Bajardi', render: (row) => row.actor_name || 'Tizim' },
    { key: 'target_type', header: 'Obyekt', render: (row) => row.target_type || '?' },
  ];
  const stat = (label: string, count: number | undefined, Icon: typeof Building2) => (
    <Card className="flex items-center gap-4 p-4 sm:p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-action-soft text-action">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {count === undefined ? '—' : formatNumber(count)}
        </p>
      </div>
    </Card>
  );
  const heading = (title: string, description: string) => (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-action">
        C-Panel / {auditMode ? 'Jurnal' : 'Markazlar'}
      </p>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-secondary">{description}</p>
    </div>
  );
  return (
    <OperatorLayout onLogout={onLogout}>
      <div className="grid gap-6">
        {!auditMode && !detailId && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              {heading('Markazlar', 'Ta’lim markazlari, obunalar va kirish holatini boshqaring.')}
              <Button onClick={() => openForm('create')}>
                <Plus className="h-4 w-4" />
                Markaz qo‘shish
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stat('Jami markazlar', total.data?.count, Building2)}
              {stat('Faol obuna', active.data?.count, CheckCircle2)}
              {stat('Sinov muddatida', trial.data?.count, Clock3)}
              {stat('Bloklangan', blocked.data?.count, ShieldBan)}
            </div>
            <Card className="overflow-hidden">
              <div className="flex flex-wrap gap-3 border-b border-divider p-4">
                <div className="min-w-[220px] flex-1">
                  <Input
                    aria-label="Markazni qidirish"
                    placeholder="Markaz nomi, telefon yoki slug…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-52">
                  <Select
                    aria-label="Obuna holati"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Barcha obunalar</option>
                    <option value="active">Faol</option>
                    <option value="trial">Sinov</option>
                    <option value="expired">Muddati tugagan</option>
                    <option value="cancelled">Bekor qilingan</option>
                  </Select>
                </div>
              </div>
              {list.isError ? (
                <div
                  role="alert"
                  className="grid justify-items-center gap-3 p-10 text-sm text-ink-secondary"
                >
                  Markazlarni yuklab bo‘lmadi.
                  <Button variant="outline" onClick={() => void list.refetch()}>
                    Qayta urinish
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  rows={list.data?.results ?? []}
                  rowKey={(row) => row.id}
                  isLoading={list.isLoading}
                  empty={
                    <EmptyState
                      icon={<Building2 className="h-6 w-6" />}
                      title="Markaz topilmadi"
                      description="Qidiruvni o‘zgartiring yoki yangi markaz qo‘shing."
                    />
                  }
                />
              )}
              {list.data && (
                <div className="border-t border-divider p-4">
                  <Pagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={list.data.count}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </Card>
          </>
        )}
        {detailId && (
          <>
            <Button variant="ghost" size="sm" className="w-fit" onClick={goList}>
              <ArrowLeft className="h-4 w-4" /> Markazlarga qaytish
            </Button>
            {detail.isLoading && <p className="text-sm text-ink-muted">Yuklanmoqda…</p>}
            {detail.isError && (
              <div role="alert">
                Markazni yuklab bo‘lmadi.{' '}
                <Button variant="ghost" onClick={() => void detail.refetch()}>
                  Qayta urinish
                </Button>
              </div>
            )}
            {detail.data && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {heading(detail.data.name, `${detail.data.slug}.yolup.uz`)}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => openForm('edit', detail.data)}>
                      Tahrirlash
                    </Button>
                    <Button variant="outline" onClick={() => openForm('subscription', detail.data)}>
                      Obunani boshqarish
                    </Button>
                    <Button
                      variant={detail.data.is_blocked ? 'outline' : 'soft-danger'}
                      onClick={() => setConfirm(detail.data)}
                    >
                      {detail.data.is_blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Card className="grid content-start gap-4 p-5 lg:col-span-2">
                    <h2 className="font-display text-lg font-bold">Markaz ma’lumotlari</h2>
                    <dl className="grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-ink-muted">Telefon</dt>
                        <dd className="mt-1 font-medium">{detail.data.phone || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-muted">Email</dt>
                        <dd className="mt-1 font-medium">{detail.data.email || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-muted">Manzil</dt>
                        <dd className="mt-1 font-medium">{detail.data.address || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-muted">Kirish holati</dt>
                        <dd className="mt-1">
                          <StatusBadge status={detail.data.is_blocked ? 'blocked' : 'active'} />
                        </dd>
                      </div>
                    </dl>
                  </Card>
                  <Card className="grid content-start gap-4 p-5">
                    <h2 className="font-display text-lg font-bold">Obuna</h2>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Tarif</span>
                      <span className="font-semibold capitalize">
                        {detail.data.subscription_tier}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Holat</span>
                      <StatusBadge status={detail.data.subscription_status} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Tugash sanasi</span>
                      <span>{formatDate(detail.data.subscription_expires_at)}</span>
                    </div>
                  </Card>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Card className="grid content-start gap-4 p-5 lg:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="font-display text-lg font-bold">Direktorlar</h2>
                        <p className="mt-1 text-sm text-ink-muted">Markazning direktor hisoblari</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openForm('owner', detail.data)}
                      >
                        <Plus className="h-4 w-4" /> Qo‘shish
                      </Button>
                    </div>
                    {owners.isError && (
                      <p role="alert" className="text-sm text-danger-ink">
                        Direktorlarni yuklab bo‘lmadi.
                      </p>
                    )}
                    {owners.isLoading && <p className="text-sm text-ink-muted">Yuklanmoqda…</p>}
                    {owners.data?.length === 0 && (
                      <p className="text-sm text-ink-muted">Direktorlar topilmadi.</p>
                    )}
                    {owners.data?.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-3"
                      >
                        <div>
                          <p className="font-semibold">
                            {item.first_name} {item.last_name}
                          </p>
                          <p className="text-sm text-ink-muted">{item.phone}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOwner(item);
                            openForm('password', detail.data);
                          }}
                        >
                          Parolni tiklash
                        </Button>
                      </div>
                    ))}
                  </Card>
                  <Card className="grid content-start gap-3 p-5">
                    <div className="flex items-center gap-2">
                      <UsersRound className="h-5 w-5 text-action" />
                      <h2 className="font-display text-lg font-bold">Foydalanish</h2>
                    </div>
                    {usage.isError ? (
                      <p className="text-sm text-danger-ink">Ma’lumot yuklanmadi.</p>
                    ) : usage.data ? (
                      <>
                        <p className="text-sm">
                          O‘quvchilar:{' '}
                          <strong>
                            {usage.data.students_count} / {usage.data.max_students}
                          </strong>
                        </p>
                        <p className="text-sm">
                          Xodimlar: <strong>{usage.data.staff_count}</strong>
                        </p>
                        <p className="text-sm">
                          Filiallar: <strong>{usage.data.branches_count}</strong>
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-ink-muted">Yuklanmoqda…</p>
                    )}
                  </Card>
                </div>
              </>
            )}
          </>
        )}
        {auditMode && (
          <>
            {heading('Faoliyat jurnali', 'Operator tomonidan bajarilgan amallar.')}
            <Card className="overflow-hidden">
              {audit.isError ? (
                <div role="alert" className="p-6">
                  Jurnalni yuklab bo‘lmadi.{' '}
                  <Button variant="ghost" onClick={() => void audit.refetch()}>
                    Qayta urinish
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={auditColumns}
                  rows={audit.data?.results ?? []}
                  rowKey={(row) => row.id}
                  isLoading={audit.isLoading}
                  empty={<EmptyState title="Jurnal hozircha bo‘sh" />}
                />
              )}
              {audit.data && (
                <div className="border-t border-divider p-4">
                  <Pagination
                    page={auditPage}
                    pageSize={PAGE_SIZE}
                    total={audit.data.count}
                    onPageChange={setAuditPage}
                  />
                </div>
              )}
            </Card>
          </>
        )}
      </div>
      <OperatorFormSheet
        mode={sheet}
        tenant={target}
        pending={mutation.isPending}
        onClose={() => setSheet(null)}
        onSubmit={submit}
      />
      <ConfirmModal
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={
          confirm?.is_blocked
            ? 'Markazni blokdan chiqarmoqchimisiz?'
            : 'Markazni bloklamoqchimisiz?'
        }
        description={
          confirm?.is_blocked
            ? 'Markaz foydalanuvchilari qayta tizimga kirishlari mumkin.'
            : 'Markaz foydalanuvchilari tizimdan chiqariladi va blok ochilgandan keyin qayta kirishlari kerak bo‘ladi.'
        }
        confirmLabel={confirm?.is_blocked ? 'Blokdan chiqarish' : 'Bloklash'}
        tone={confirm?.is_blocked ? 'info' : 'danger'}
        loading={mutation.isPending}
        onConfirm={() => {
          if (confirm)
            mutation.mutate({
              path: confirm.is_blocked ? ENDPOINTS.tenants.unblock(confirm.id) : ENDPOINTS.tenants.block(confirm.id),
              body: {},
            });
        }}
      />
    </OperatorLayout>
  );
}
