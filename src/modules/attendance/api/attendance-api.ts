import type {
  Attendance,
  BulkAttendanceRequest,
  BulkAttendanceResult,
  LessonRosterRow,
} from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export type AttendanceListParamsExtended = ListQueryParams;

export const attendanceApi = {
  list: (params: AttendanceListParamsExtended) =>
    http.list<Attendance>(ENDPOINTS.attendance.root, cleanParams(params)),

  /** Bir darsdagi to'liq ro'yxat (belgilanmaganlar ham). */
  roster: (lessonId: string) =>
    http.get<LessonRosterRow[]>(ENDPOINTS.lessons.attendance(lessonId)),

  bulk: (body: BulkAttendanceRequest) =>
    http.post<BulkAttendanceResult>(ENDPOINTS.attendance.bulk, body),

  get: (id: string) => http.get<Attendance>(ENDPOINTS.attendance.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Attendance>(ENDPOINTS.attendance.byId(id), values),
};
