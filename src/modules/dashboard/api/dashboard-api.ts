import { ENDPOINTS, http } from "@/shared/api";

import type { DashboardOverview } from "../model/types";

export const dashboardApi = {
  /** `GET /dashboard/overview/` */
  overview: () => http.get<DashboardOverview>(ENDPOINTS.dashboard.overview),
};
