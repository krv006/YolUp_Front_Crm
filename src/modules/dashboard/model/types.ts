/**
 * Bosh sahifa (CEO overview) modellari.
 * Backend hali tayyor emas — mock adapter `/dashboard/overview/` shu shaklni qaytaradi.
 */

export type KpiKind = "number" | "money" | "percent";

export interface DashboardKpi {
  key: string;
  title: string;
  kind: KpiKind;
  /** `money` bo'lsa — tiyin; `percent` bo'lsa — foiz; `number` bo'lsa — dona. */
  value: number;
  delta: number;
  trend: "up" | "down" | "neutral";
  spark: number[];
}

export interface ScheduleBlock {
  slot: string;
  room: string;
  group: string;
  teacher: string;
  tone: number;
}

export interface DashboardSchedule {
  rooms: string[];
  slots: string[];
  blocks: ScheduleBlock[];
}

export interface OccupancyRow {
  room: string;
  percent: number;
  seats: string;
}

export interface DashboardTransaction {
  id: string;
  student: string;
  group: string;
  amount_tiyin: number;
  method: string;
  time: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  meta: string;
  done: boolean;
}

export interface DashboardOverview {
  kpis: DashboardKpi[];
  schedule: DashboardSchedule;
  occupancy: OccupancyRow[];
  transactions: DashboardTransaction[];
  tasks: DashboardTask[];
}
