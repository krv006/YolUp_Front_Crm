import { useState } from "react";
import {
  Banknote,
  CalendarCheck,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  useAttendanceReport,
  useFinanceReport,
  useLeadsReport,
  usePayrollReport,
  useStudentsReport,
} from "@/modules/reports";
import { StatusBadge } from "@/core/status";
import { Card, CardBody, CardHeader, CardSub, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { Progress, occupancyTone, type ProgressTone } from "@/shared/ui/progress";
import { StatCard } from "@/shared/ui/stat-card";
import { Tabs } from "@/shared/ui/tabs";
import { formatMoney, formatNumber } from "@/shared/lib";

type ReportTab = "finance" | "students" | "leads" | "attendance" | "payroll";

const EMPTY = {};

/** Nom + qiymatdan iborat gorizontal taqsimot qatori. */
function BreakdownRow({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: string;
  percent?: number;
  tone?: ProgressTone;
}) {
  return (
    <li className="grid gap-2 border-b border-divider py-3 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="od-truncate font-semibold text-ink-secondary">{label}</span>
        <span className="money flex-none font-semibold text-ink">{value}</span>
      </div>
      {percent !== undefined && (
        <Progress
          value={percent}
          tone={tone ?? occupancyTone(percent)}
          label={`${label} ulushi`}
        />
      )}
    </li>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("finance");

  const { data: finance } = useFinanceReport(EMPTY);
  const { data: students } = useStudentsReport(EMPTY);
  const { data: leads } = useLeadsReport(EMPTY);
  const { data: attendance } = useAttendanceReport(EMPTY);
  const { data: payroll } = usePayrollReport(EMPTY);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Hisobotlar"
        subtitle="Moliya, o'quvchilar, lidlar, davomat va ish haqi"
      />

      <Tabs
        variant="pill"
        label="Hisobot bo'limi"
        value={tab}
        onChange={(value) => setTab(value as ReportTab)}
        items={[
          { value: "finance", label: "Moliya", icon: <Wallet className="h-4 w-4" /> },
          { value: "students", label: "O'quvchilar", icon: <GraduationCap className="h-4 w-4" /> },
          { value: "leads", label: "Lidlar", icon: <TrendingUp className="h-4 w-4" /> },
          { value: "attendance", label: "Davomat", icon: <CalendarCheck className="h-4 w-4" /> },
          { value: "payroll", label: "Ish haqi", icon: <Banknote className="h-4 w-4" /> },
        ]}
      />

      {tab === "finance" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Tushum"
              value={formatMoney(finance?.revenue_tiyin ?? 0)}
              tone="success"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              label="Xarajat"
              value={formatMoney(finance?.expenses_tiyin ?? 0)}
              tone="danger"
              icon={<TrendingDown className="h-5 w-5" />}
            />
            <StatCard
              label="Sof foyda"
              value={formatMoney(finance?.net_profit_tiyin ?? 0)}
              tone={(finance?.net_profit_tiyin ?? 0) >= 0 ? "info" : "danger"}
              icon={<Wallet className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>To'lov usullari</CardTitle>
                  <CardSub>Usul bo'yicha tushum taqsimoti</CardSub>
                </div>
              </CardHeader>
              <CardBody>
                {(finance?.by_payment_method.length ?? 0) === 0 ? (
                  <EmptyState
                    icon={<Wallet className="h-6 w-6" />}
                    title="Ma'lumot yo'q"
                    description="To'lovlar qabul qilinganda taqsimot shu yerda ko'rinadi."
                  />
                ) : (
                  <ul className="grid">
                    {finance?.by_payment_method.map((item) => {
                      const total = finance.revenue_tiyin || 1;
                      const percent = Math.round((item.amount / total) * 100);
                      return (
                        <BreakdownRow
                          key={item.method}
                          label={item.method}
                          value={formatMoney(item.amount)}
                          percent={percent}
                        />
                      );
                    })}
                  </ul>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Eng katta to'lovlar</CardTitle>
                  <CardSub>O'quvchi bo'yicha jami</CardSub>
                </div>
              </CardHeader>
              <CardBody>
                {(finance?.by_student.length ?? 0) === 0 ? (
                  <EmptyState
                    icon={<GraduationCap className="h-6 w-6" />}
                    title="Ma'lumot yo'q"
                    description="O'quvchi bo'yicha to'lovlar shu yerda ko'rinadi."
                  />
                ) : (
                  <ul className="grid">
                    {finance?.by_student.map((item) => {
                      const top = finance.by_student[0]?.amount || 1;
                      return (
                        <BreakdownRow
                          key={item.student_id}
                          label={item.student_name}
                          value={formatMoney(item.amount)}
                          percent={Math.round((item.amount / top) * 100)}
                        />
                      );
                    })}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {tab === "students" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Jami o'quvchi"
              value={formatNumber(students?.total_students ?? 0)}
              icon={<GraduationCap className="h-5 w-5" />}
            />
            <StatCard
              label="Faol"
              value={formatNumber(students?.active_students ?? 0)}
              tone="success"
              icon={<GraduationCap className="h-5 w-5" />}
            />
            <StatCard
              label="Muzlatilgan"
              value={formatNumber(students?.frozen_students ?? 0)}
              tone="warning"
              icon={<GraduationCap className="h-5 w-5" />}
            />
            <StatCard
              label="Umumiy qarz"
              value={formatMoney(students?.total_debt_tiyin ?? 0)}
              tone="danger"
              icon={<TrendingDown className="h-5 w-5" />}
            />
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Holat bo'yicha taqsimot</CardTitle>
                <CardSub>Jami {formatNumber(students?.total_students ?? 0)} o'quvchi</CardSub>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="grid">
                {[
                  { label: "Faol", value: students?.active_students ?? 0 },
                  { label: "Muzlatilgan", value: students?.frozen_students ?? 0 },
                  { label: "Ketgan", value: students?.left_students ?? 0 },
                  { label: "Bitirgan", value: students?.graduates ?? 0 },
                ].map((item) => {
                  const total = students?.total_students || 1;
                  return (
                    <BreakdownRow
                      key={item.label}
                      label={item.label}
                      value={formatNumber(item.value)}
                      percent={Math.round((item.value / total) * 100)}
                    />
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </>
      )}

      {tab === "leads" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Jami lidlar"
              value={formatNumber(leads?.total_leads ?? 0)}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              label="Konversiya"
              value={`${leads?.conversion_rate ?? 0}%`}
              tone="success"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              label="Manbalar"
              value={formatNumber(leads?.by_source.length ?? 0)}
              tone="info"
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Bosqichlar</CardTitle>
                  <CardSub>Kanban bosqichlari bo'yicha</CardSub>
                </div>
              </CardHeader>
              <CardBody>
                <ul className="grid">
                  {leads?.by_stage.map((item) => {
                    const total = leads.total_leads || 1;
                    return (
                      <BreakdownRow
                        key={item.stage}
                        label={item.stage}
                        value={formatNumber(item.count)}
                        percent={Math.round((item.count / total) * 100)}
                      />
                    );
                  })}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Manbalar</CardTitle>
                  <CardSub>Lid qayerdan kelgan</CardSub>
                </div>
              </CardHeader>
              <CardBody>
                <ul className="grid">
                  {leads?.by_source.map((item) => {
                    const total = leads.total_leads || 1;
                    return (
                      <BreakdownRow
                        key={item.source}
                        label={item.source}
                        value={formatNumber(item.count)}
                        percent={Math.round((item.count / total) * 100)}
                      />
                    );
                  })}
                </ul>
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {tab === "attendance" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Darslar"
              value={formatNumber(attendance?.total_lessons ?? 0)}
              icon={<CalendarCheck className="h-5 w-5" />}
            />
            <StatCard
              label="Qatnashish darajasi"
              value={`${attendance?.attendance_rate ?? 0}%`}
              tone="success"
              icon={<CalendarCheck className="h-5 w-5" />}
            />
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Guruhlar bo'yicha qatnashuv</CardTitle>
                <CardSub>Keldi va kechikdi hisobga olinadi</CardSub>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="grid">
                {attendance?.by_group.map((item) => (
                  <BreakdownRow
                    key={item.group_id}
                    label={item.group_name}
                    value={`${item.rate}%`}
                    percent={item.rate}
                  />
                ))}
              </ul>
            </CardBody>
          </Card>
        </>
      )}

      {tab === "payroll" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Jami ish haqi"
              value={formatMoney(payroll?.total_payroll_tiyin ?? 0)}
              icon={<Banknote className="h-5 w-5" />}
            />
            <StatCard
              label="Xodimlar"
              value={formatNumber(payroll?.by_teacher.length ?? 0)}
              tone="info"
              icon={<Banknote className="h-5 w-5" />}
            />
          </div>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Xodim bo'yicha</CardTitle>
                <CardSub>Yakuniy summalar</CardSub>
              </div>
            </CardHeader>
            <CardBody>
              <ul className="grid">
                {payroll?.by_teacher.map((item) => {
                  const top = payroll.by_teacher[0]?.amount || 1;
                  return (
                    <BreakdownRow
                      key={item.teacher_id}
                      label={item.teacher_name}
                      value={formatMoney(item.amount)}
                      percent={Math.round((item.amount / top) * 100)}
                    />
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        </>
      )}

      <Card className="p-4">
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <StatusBadge status="active" />
          Hisobotlar real vaqtda demo ma'lumotlardan hisoblanadi.
        </p>
      </Card>
    </div>
  );
}
