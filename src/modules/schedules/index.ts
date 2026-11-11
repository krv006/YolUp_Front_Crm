/**
 * Schedules moduli — PUBLIC API.
 */
export {
  scheduleSlotKeys,
  useScheduleSlotList,
  useScheduleSlotDetail,
  useScheduleSlotCreate,
  useScheduleSlotUpdate,
  useScheduleSlotRemove,
} from "./api/schedule-queries";
export type { ScheduleSlot, ScheduleSlotListParams } from "./model/types";
export type { ScheduleSlotValues } from "./model/schemas";
export { scheduleSlotSchema } from "./model/schemas";
export { scheduleSlotApi } from "./api/schedule-api";
