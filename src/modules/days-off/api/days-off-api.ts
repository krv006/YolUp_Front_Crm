import type { DayOff } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const dayOffApi = {
  list: (params: ListQueryParams) =>
    http.list<DayOff>(ENDPOINTS.daysOff.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) => http.post<DayOff>(ENDPOINTS.daysOff.root, values),

  get: (id: string) => http.get<DayOff>(ENDPOINTS.daysOff.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<DayOff>(ENDPOINTS.daysOff.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.daysOff.byId(id)),
};
