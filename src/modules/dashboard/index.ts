/**
 * Dashboard moduli — PUBLIC API.
 */
export { dashboardKeys, useDashboardOverview } from "./api/dashboard-queries";
export { dashboardApi } from "./api/dashboard-api";
export type {
  DashboardKpi,
  DashboardOverview,
  DashboardSchedule,
  DashboardTask,
  DashboardTransaction,
  KpiKind,
  OccupancyRow,
  ScheduleBlock,
} from "./model/types";
