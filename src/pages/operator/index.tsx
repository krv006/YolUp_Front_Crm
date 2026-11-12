import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, type Paginated } from '@/shared/api';
import { toastError, toastSuccess } from '@/shared/lib';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { Tenant } from '@/modules/tenants';

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
type Audit = { id: string; action: string; created_at: string };

export default function OperatorPanel({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<
    'list' | 'create' | 'edit' | 'subscription' | 'owners' | 'audit'
  >('list');
  const list = useQuery({
    queryKey: ['operator-tenants', search, page],
    queryFn: () => http.list<Tenant>('/tenants/', { search, page, page_size: 20 }),
  });
  const owners = useQuery({
    queryKey: ['operator-owners', selected?.id],
    queryFn: () => http.get<Owner[]>(`/tenants/${selected!.id}/owners/`),
    enabled: mode === 'owners' && !!selected,
  });
  const usage = useQuery({
    queryKey: ['operator-usage', selected?.id],
    queryFn: () => http.get<Usage>(`/tenants/${selected!.id}/usage/`),
    enabled: mode === 'owners' && !!selected,
  });
  const audit = useQuery({
    queryKey: ['operator-audit'],
    queryFn: () => http.get<Paginated<Audit>>('/tenants/audit-logs/'),
    enabled: mode === 'audit',
  });
  const mutation = useMutation({
    mutationFn: async ({ path, body, patch }: { path: string; body: unknown; patch?: boolean }) =>
      patch ? http.patch(path, body) : http.post(path, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['operator-tenants'] });
      void qc.invalidateQueries({ queryKey: ['operator-owners'] });
      toastSuccess('Saqlandi');
    },
    onError: toastError,
  });
  function form(
    event: FormEvent<HTMLFormElement>,
    action: 'create' | 'edit' | 'subscription' | 'owner'
  ) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (action === 'create') {
      const { first_name, last_name, ceo_phone, password, ...tenant } = values;
      mutation.mutate(
        {
          path: '/tenants/',
          body: {
            ...tenant,
            max_students: Number(tenant.max_students),
            ceo: { first_name, last_name, phone: ceo_phone, password },
          },
        },
        { onSuccess: () => setMode('list') }
      );
    }
    if (action === 'edit' && selected)
      mutation.mutate(
        { path: `/tenants/${selected.id}/`, body: values, patch: true },
        { onSuccess: () => setMode('list') }
      );
    if (action === 'subscription' && selected)
      mutation.mutate(
        {
          path: `/tenants/${selected.id}/subscription/`,
          body: {
            ...values,
            max_students: Number(values.max_students),
            expires_at: new Date(String(values.expires_at)).toISOString(),
          },
        },
        { onSuccess: () => setMode('list') }
      );
    if (action === 'owner' && selected) {
      const formElement = event.currentTarget;
      mutation.mutate(
        { path: `/tenants/${selected.id}/owners/`, body: values },
        { onSuccess: () => formElement.reset() }
      );
    }
  }
  function resetOwner(owner: Owner) {
    const password = window.prompt(`${owner.first_name} uchun yangi vaqtinchalik parol`);
    if (password)
      mutation.mutate({
        path: `/tenants/${selected!.id}/owners/${owner.id}/reset-password/`,
        body: { new_password: password },
      });
  }
  const field = (label: string, name: string, value = '', type = 'text', required = true) => (
    <label className="grid gap-1 text-sm">
      {label}
      <Input name={name} type={type} defaultValue={value} required={required} />
    </label>
  );
  return (
    <main className="mx-auto grid max-w-6xl gap-5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">YolUp operator paneli</h1>
          <p>Markazlar va obunalarni boshqarish</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode('list')}>
            Markazlar
          </Button>
          <Button variant="outline" onClick={() => setMode('audit')}>
            Jurnal
          </Button>
          <Button variant="ghost" onClick={onLogout}>
            Chiqish
          </Button>
        </div>
      </header>
      {mode === 'list' && (
        <section className="grid gap-4">
          <div className="flex gap-3">
            <Input
              placeholder="Markazni qidirish"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Button onClick={() => setMode('create')}>Markaz qo'shish</Button>
          </div>
          {list.isError && <p role="alert">Markazlarni yuklab bo'lmadi.</p>}
          {list.isLoading && <p>Yuklanmoqda...</p>}
          {list.data?.results.map((t) => (
            <article key={t.id} className="grid gap-3 rounded-md border p-4">
              <div>
                <strong>{t.name}</strong> · {t.slug}.yolup.uz · {t.subscription_tier} ·{' '}
                {t.subscription_status} {t.is_blocked && '· Bloklangan'}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelected(t);
                    setMode('edit');
                  }}
                >
                  Tahrirlash
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelected(t);
                    setMode('subscription');
                  }}
                >
                  Obuna
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelected(t);
                    setMode('owners');
                  }}
                >
                  Direktorlar va foydalanish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        `${t.name}: ${t.is_blocked ? 'blokdan chiqarilsinmi' : 'bloklansinmi'}?`
                      )
                    )
                      mutation.mutate({
                        path: `/tenants/${t.id}/${t.is_blocked ? 'unblock' : 'block'}/`,
                        body: {},
                      });
                  }}
                >
                  {t.is_blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                </Button>
              </div>
            </article>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Oldingi
            </Button>
            <span>{page}</span>
            <Button variant="outline" disabled={!list.data?.next} onClick={() => setPage(page + 1)}>
              Keyingi
            </Button>
          </div>
        </section>
      )}
      {(mode === 'create' || mode === 'edit') && (
        <form key={mode} className="grid max-w-xl gap-3" onSubmit={(e) => form(e, mode)}>
          <h2 className="text-lg font-semibold">
            {mode === 'create' ? 'Yangi markaz' : 'Markazni tahrirlash'}
          </h2>
          {field('Nomi', 'name', mode === 'edit' ? selected?.name : '')}
          {mode === 'create' && field('Subdomen (slug)', 'slug')}
          {field('Telefon', 'phone', mode === 'edit' ? (selected?.phone ?? '') : '', 'tel', false)}
          {field('Email', 'email', mode === 'edit' ? (selected?.email ?? '') : '', 'email', false)}
          {field(
            'Manzil',
            'address',
            mode === 'edit' ? (selected?.address ?? '') : '',
            'text',
            false
          )}
          {mode === 'create' && (
            <>
              {field('Limit', 'max_students', '100', 'number')}
              {field('Direktor ismi', 'first_name')}
              {field('Direktor familiyasi', 'last_name')}
              {field('Direktor telefoni', 'ceo_phone', '', 'tel')}
              {field('Direktor paroli', 'password', '', 'password')}
            </>
          )}
          <Button type="submit" loading={mutation.isPending}>
            Saqlash
          </Button>
          <Button variant="ghost" onClick={() => setMode('list')}>
            Bekor qilish
          </Button>
        </form>
      )}
      {mode === 'subscription' && selected && (
        <form className="grid max-w-xl gap-3" onSubmit={(e) => form(e, 'subscription')}>
          <h2 className="text-lg font-semibold">{selected.name}: obuna</h2>
          <label>
            Tarif
            <select
              name="subscription_tier"
              defaultValue={selected.subscription_tier}
              className="block w-full rounded border p-2"
            >
              {['basic', 'standard', 'professional', 'enterprise'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          {field(
            "O'quvchilar limiti",
            'max_students',
            String(selected.max_students ?? 100),
            'number'
          )}
          {field('Tugash vaqti', 'expires_at', '', 'datetime-local')}
          <Button type="submit" loading={mutation.isPending}>
            Saqlash
          </Button>
        </form>
      )}
      {mode === 'owners' && selected && (
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">{selected.name}: direktorlar</h2>
          {usage.data && (
            <p>
              O'quvchilar: {usage.data.students_count}/{usage.data.max_students} · Xodimlar:{' '}
              {usage.data.staff_count} · Filiallar: {usage.data.branches_count}
            </p>
          )}
          {owners.isError && <p role="alert">Direktorlarni yuklab bo'lmadi.</p>}
          {owners.data?.map((o) => (
            <div key={o.id} className="flex items-center gap-3">
              <span>
                {o.first_name} {o.last_name} · {o.phone}
              </span>
              <Button size="sm" variant="outline" onClick={() => resetOwner(o)}>
                Parolni tiklash
              </Button>
            </div>
          ))}
          <form className="grid max-w-xl gap-3" onSubmit={(e) => form(e, 'owner')}>
            <h3>Direktor qo'shish</h3>
            {field('Ism', 'first_name')}
            {field('Familiya', 'last_name')}
            {field('Telefon', 'phone', '', 'tel')}
            {field('Vaqtinchalik parol', 'password', '', 'password')}
            <Button type="submit" loading={mutation.isPending}>
              Qo'shish
            </Button>
          </form>
        </section>
      )}
      {mode === 'audit' && (
        <section>
          <h2 className="text-lg font-semibold">Operator jurnali</h2>
          {audit.isError && <p role="alert">Jurnalni yuklab bo'lmadi.</p>}
          {audit.data?.results.map((a) => (
            <p key={a.id}>
              {a.created_at} · {a.action}
            </p>
          ))}
        </section>
      )}
    </main>
  );
}
