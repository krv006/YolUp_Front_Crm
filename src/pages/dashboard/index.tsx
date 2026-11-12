import { useQuery } from '@tanstack/react-query';
import { http, ENDPOINTS } from '@/shared/api';
import { Card } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import { StatCard } from '@/shared/ui/stat-card';
import { formatMoney, formatNumber } from '@/shared/lib';

type Dashboard = {
  students: { total: number; active: number; trial: number; frozen: number };
  groups: { active: number; planned: number };
  leads: { open: number; trial: number; won_this_month: number; conversion_rate: number };
  finance: {
    revenue_this_month_tiyin: number;
    expenses_this_month_tiyin: number;
    debt_total_tiyin: number;
    debtors_count: number;
  };
  attendance: { today_lessons: number; marked_lessons: number; attendance_rate_30d: number };
  generated_at: string;
};

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => http.get<Dashboard>(ENDPOINTS.dashboard.overview),
  });
  return (
    <div className="grid gap-5">
      <PageHeader title="Bosh sahifa" subtitle="Markaz faoliyati" />
      {isLoading && <p>Yuklanmoqda...</p>}
      {isError && (
        <Card className="p-4">
          <p role="alert">Ma'lumotlarni yuklab bo'lmadi.</p>
          <button className="text-action" onClick={() => void refetch()}>
            Qayta urinish
          </button>
        </Card>
      )}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Faol o'quvchilar" value={formatNumber(data.students.active)} />
            <StatCard label="Faol guruhlar" value={formatNumber(data.groups.active)} />
            <StatCard
              label="Oylik tushum"
              value={formatMoney(data.finance.revenue_this_month_tiyin)}
            />
            <StatCard label="Jami qarz" value={formatMoney(data.finance.debt_total_tiyin)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="grid gap-2 p-5">
              <h2 className="font-bold">Lidlar</h2>
              <p>Ochiq: {formatNumber(data.leads.open)}</p>
              <p>Shu oy qabul qilingan: {formatNumber(data.leads.won_this_month)}</p>
            </Card>
            <Card className="grid gap-2 p-5">
              <h2 className="font-bold">Davomat</h2>
              <p>Bugungi darslar: {formatNumber(data.attendance.today_lessons)}</p>
              <p>Belgilangani: {formatNumber(data.attendance.marked_lessons)}</p>
              <p>30 kunlik davomat: {Math.round(data.attendance.attendance_rate_30d * 100)}%</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
