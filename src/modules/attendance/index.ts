/**
 * Attendance moduli — PUBLIC API.
 */
export {
  attendanceKeys,
  useAttendanceList,
  useAttendanceDetail,
  useLessonRoster,
  useAttendanceBulk,
  useAttendanceUpdate,
  useAttendanceSetStatus,
} from "./api/attendance-queries";
export type {
  Attendance,
  AttendanceListParams,
  BulkAttendanceItem,
  BulkAttendanceRequest,
  BulkAttendanceResult,
  LessonRosterRow,
  AttendanceStatus,
} from "./model/types";
export type { AttendanceValues, BulkAttendanceValues } from "./model/schemas";
export { attendanceSchema, bulkAttendanceSchema } from "./model/schemas";
export { attendanceApi } from "./api/attendance-api";
