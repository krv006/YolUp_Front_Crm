import type { ScheduleSlot, ScheduleSlotListParams } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListParams } from "@/shared/api";

export interface ScheduleSlotListParamsExtended extends ScheduleSlotListParams, ListParams {}

export const scheduleSlotApi = {
  list: (params: ScheduleSlotListParamsExtended) =>
    http.list<ScheduleSlot>(ENDPOINTS.scheduleSlots.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<ScheduleSlot>(ENDPOINTS.scheduleSlots.root, values),

  get: (id: string) =>
    http.get<ScheduleSlot>(ENDPOINTS.scheduleSlots.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<ScheduleSlot>(ENDPOINTS.scheduleSlots.byId(id), values),

  remove: (id: string) =>
    http.delete(ENDPOINTS.scheduleSlots.byId(id)),
};
