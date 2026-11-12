import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, http } from '@/shared/api';
import { Card } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { formatMoney, formatNumber } from '@/shared/lib';

type Finance = {
  revenue_tiyin: number;
  expenses_tiyin: number;
  net_profit_tiyin: number;
  by_payment_method: { method: string; amount: number }[];
};
type Students = {
  totals: {
    total: number;
    active: number;
    frozen: number;
    new_students: number;
    left_students: number;
  };
  results: { group_id: string; group_name: string; active_students: number }[];
  next: string | null;
};
type Leads = {
  totals: { total: number; won: number; lost: number; conversion_rate: number };
  by_stage: { stage: string; name: string; count: number }[];
};
type Attendance = {
  totals: { lessons: number; present: number; absent: number; attendance_rate: number };
  results: { group_id: string; group_name: string; attendance_rate: number }[];
  next: string | null;
};
type Payroll = {
  totals: { payrolls: number; final_amount_tiyin: number };
  results: { id: string; user_name: string; final_amount_tiyin: number; state: string }[];
  next: string | null;
};
type Tab = 'finance' | 'students' | 'leads' | 'attendance' | 'payroll';

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('finance');
  const [page, setPage] = useState(1);
  const report = useQuery({
    queryKey: ['report', tab, page],
    queryFn: () =>
      http.get<Finance | Students | Leads | Attendance | Payroll>(ENDPOINTS.reports[tab], {
        params: { page, page_size: 20 },
      }),
  });
  const data = report.data;
  const metric = (label: string, value: string) => (
    <div className="rounded-md border p-4">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
  return (
    <div className="grid gap-5">
      <PageHeader title="Hisobotlar" subtitle="Joriy oy bo'yicha hisobotlar" />
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['finance', 'Moliya'],
            ['students', "O'quvchilar"],
            ['leads', 'Lidlar'],
            ['attendance', 'Davomat'],
            ['payroll', 'Ish haqi'],
          ] as const
        ).map(([key, title]) => (
          <Button
            key={key}
            variant={tab === key ? 'primary' : 'outline'}
            onClick={() => {
              setTab(key);
              setPage(1);
            }}
          >
            {title}
          </Button>
        ))}
      </div>
      {report.isLoading && <p>Yuklanmoqda...</p>}
      {report.isError && (
        <Card className="p-4">
          <p role="alert">Hisobotni yuklab bo'lmadi.</p>
          <Button variant="ghost" onClick={() => void report.refetch()}>
            Qayta urinish
          </Button>
        </Card>
      )}
      {data && tab === 'finance' && 'revenue_tiyin' in data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {metric('Tushum', formatMoney(data.revenue_tiyin))}
            {metric('Xarajat', formatMoney(data.expenses_tiyin))}
            {metric('Foyda', formatMoney(data.net_profit_tiyin))}
          </div>
          <Card className="grid gap-2 p-4">
            <h2 className="font-bold">To'lov turlari</h2>
            {data.by_payment_method.map((row) => (
              <p key={row.method}>
                {row.method}: {formatMoney(row.amount)}
              </p>
            ))}
          </Card>
        </>
      )}
      {data && tab === 'students' && 'totals' in data && 'active' in data.totals && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {metric('Jami', formatNumber(data.totals.total))}
            {metric('Faol', formatNumber(data.totals.active))}
            {metric('Yangi', formatNumber(data.totals.new_students))}
          </div>
          <Card className="grid gap-2 p-4">
            {(data as Students).results.map((row) => (
              <p key={row.group_id}>
                {row.group_name}: {formatNumber(row.active_students)}
              </p>
            ))}
          </Card>
        </>
      )}
      {data && tab === 'leads' && 'by_stage' in data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {metric('Jami lidlar', formatNumber(data.totals.total))}
            {metric('Qabul qilingan', formatNumber(data.totals.won))}
            {metric('Konversiya', `${Math.round(data.totals.conversion_rate * 100)}%`)}
          </div>
          <Card className="grid gap-2 p-4">
            {data.by_stage.map((row) => (
              <p key={row.stage}>
                {row.name}: {formatNumber(row.count)}
              </p>
            ))}
          </Card>
        </>
      )}
      {data && tab === 'attendance' && 'totals' in data && 'attendance_rate' in data.totals && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {metric('Darslar', formatNumber(data.totals.lessons))}
            {metric('Davomat', `${Math.round(data.totals.attendance_rate * 100)}%`)}
            {metric("Yo'q", formatNumber(data.totals.absent))}
          </div>
          <Card className="grid gap-2 p-4">
            {(data as Attendance).results.map((row) => (
              <p key={row.group_id}>
                {row.group_name}: {Math.round(row.attendance_rate * 100)}%
              </p>
            ))}
          </Card>
        </>
      )}
      {data && tab === 'payroll' && 'totals' in data && 'payrolls' in data.totals && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {metric('Hisob-kitoblar', formatNumber(data.totals.payrolls))}
            {metric('Jami ish haqi', formatMoney(data.totals.final_amount_tiyin))}
          </div>
          <Card className="grid gap-2 p-4">
            {(data as Payroll).results.map((row) => (
              <p key={row.id}>
                {row.user_name}: {formatMoney(row.final_amount_tiyin)} · {row.state}
              </p>
            ))}
          </Card>
        </>
      )}
      {data && 'next' in data && (
        <div className="flex gap-3">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Oldingi
          </Button>
          <span>{page}</span>
          <Button variant="outline" disabled={!data.next} onClick={() => setPage(page + 1)}>
            Keyingi
          </Button>
        </div>
      )}
    </div>
  );
}
