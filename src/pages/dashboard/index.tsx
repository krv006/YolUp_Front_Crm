import { ArrowRight, CalendarDays, CheckCircle2, Circle, Download, Receipt } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/shared/ui/button";
import { Card, CardBody, CardHeader, CardSub, CardTitle } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/page-header";
import { StatusBadge } from "@/core/status";
import { cn } from "@/shared/lib/cn";
import { formatLongDate, formatMoney } from "@/shared/lib";
import { useShellStore } from "@/shared/model";
import KpiCard from "@/widgets/kpi-card/KpiCard";
import { useDashboardOverview, type ScheduleBlock } from "@/modules/dashboard";

const TONE: Record<number, string> = {
  1: "border-action/30 bg-action-soft text-action-soft-text",
  2: "border-info/30 bg-info-soft text-info",
  3: "border-success/30 bg-success-soft text-success-ink",
  4: "border-warning/30 bg-warning-soft text-warning-ink",
  5: "border-danger/30 bg-danger-soft text-danger-ink",
};

function occupancyTone(percent: number) {
  if (percent >= 95) return { bar: "bg-danger", text: "text-danger-ink" };
  if (percent >= 80) return { bar: "bg-warning", text: "text-warning-ink" };
  return { bar: "bg-success", text: "text-success-ink" };
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardOverview();
  const setQuickAction = useShellStore((s) => s.setQuickAction);
  const branchName = useShellStore((s) => s.activeBranchName);
  const navigate = useNavigate();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Bosh sahifa"
        subtitle={
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatLongDate(new Date().toISOString())} ·{" "}
            <span className="font-semibold text-ink-secondary">{branchName}</span>
          </span>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => void navigate({ to: "/reports" as never })}>
              <Download className="h-4 w-4" />
              Hisobot
            </Button>
            <Button onClick={() => setQuickAction("payment")}>
              <Receipt className="h-4 w-4" />
              To'lov qabul qilish
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !data
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[168px] animate-pulse rounded-lg border border-border bg-surface"
              />
            ))
          : data.kpis.map((kpi) => <KpiCard key={kpi.key} kpi={kpi} />)}
      </div>

      {/* Schedule + occupancy */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Bugungi dars jadvali</CardTitle>
              <CardSub>Xonalar kesimida · 5 vaqt oralig'i</CardSub>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            {data ? (
              <div
                className="grid min-w-[620px] gap-1"
                style={{
                  gridTemplateColumns: `64px repeat(${data.schedule.rooms.length}, minmax(120px, 1fr))`,
                }}
              >
                <div />
                {data.schedule.rooms.map((room) => (
                  <div
                    key={room}
                    className="px-2 pb-2 text-center text-xs font-bold uppercase tracking-[0.06em] text-ink-muted"
                  >
                    {room}-xona
                  </div>
                ))}

                {data.schedule.slots.map((slot) => (
                  <ScheduleRow
                    key={slot}
                    slot={slot}
                    rooms={data.schedule.rooms}
                    blocks={data.schedule.blocks}
                  />
                ))}
              </div>
            ) : (
              <div className="h-64 animate-pulse rounded-md bg-surface-2" />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Xonalar bandligi</CardTitle>
              <CardSub>Bugungi o'rtacha</CardSub>
            </div>
          </CardHeader>
          <CardBody className="grid gap-4">
            {(data?.occupancy ?? []).map((row) => {
              const tone = occupancyTone(row.percent);
              return (
                <div key={row.room} className="grid gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{row.room}</span>
                    <span className={cn("money font-bold", tone.text)}>
                      {row.percent}%
                      <span className="ml-2 font-medium text-ink-muted">{row.seats}</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={cn("h-full rounded-full", tone.bar)}
                      style={{ width: `${Math.min(100, row.percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Transactions + tasks */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>So'nggi to'lovlar</CardTitle>
              <CardSub>Bugun qabul qilingan</CardSub>
            </div>
            <Button variant="ghost" size="sm" className="text-action-soft-text">
              Barchasi
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-divider">
              {(data?.transactions ?? []).map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-success-soft text-success-ink">
                    <Receipt className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{tx.student}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {tx.group} · {tx.time}
                    </p>
                  </div>
                  <StatusBadge status={tx.method} dot={false} />
                  <span className="money w-[130px] text-right text-sm font-bold text-ink">
                    {formatMoney(tx.amount_tiyin)}
                  </span>
                </div>
              ))}
              {data?.transactions.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-ink-muted">
                  Bugun hali to'lov qabul qilinmagan.
                </p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Bugungi vazifalar</CardTitle>
              <CardSub>{(data?.tasks ?? []).filter((t) => !t.done).length} ta bajarilmagan</CardSub>
            </div>
          </CardHeader>
          <CardBody className="grid gap-2">
            {(data?.tasks ?? []).map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-md border border-border bg-surface-inset p-3"
              >
                {task.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-success" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 flex-none text-ink-muted" />
                )}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold text-ink",
                      task.done && "text-ink-muted line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-ink-muted">{task.meta}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ScheduleRow({
  slot,
  rooms,
  blocks,
}: {
  slot: string;
  rooms: string[];
  blocks: ScheduleBlock[];
}) {
  return (
    <>
      <div className="py-2 text-right text-xs font-semibold text-ink-muted money">{slot}</div>
      {rooms.map((room) => {
        const block = blocks.find((b) => b.slot === slot && b.room === room);
        return (
          <div key={room} className="min-h-[52px] rounded-sm bg-surface-inset p-1">
            {block && (
              <div
                className={cn(
                  "flex h-full flex-col justify-center gap-0.5 rounded-sm border px-2.5 py-1.5",
                  TONE[block.tone] ?? TONE[1],
                )}
              >
                <span className="truncate text-xs font-bold">{block.group}</span>
                <span className="truncate text-[11px] opacity-80">{block.teacher}</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
