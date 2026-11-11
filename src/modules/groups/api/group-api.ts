import type { Group, GroupStudent, GroupTeacher } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const groupApi = {
  list: (params: ListQueryParams) =>
    http.list<Group>(ENDPOINTS.groups.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Group>(ENDPOINTS.groups.root, values),

  get: (id: string) => http.get<Group>(ENDPOINTS.groups.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Group>(ENDPOINTS.groups.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.groups.byId(id)),

  /** Guruh a'zolari — a'zolik + o'quvchi ma'lumoti birga keladi. */
  students: (id: string, params: ListQueryParams = {}) =>
    http.list<GroupStudent>(
      ENDPOINTS.groups.students(id),
      cleanParams({ page_size: 100, ...params }),
    ),

  enroll: (id: string, values: Record<string, unknown>) =>
    http.post<GroupStudent>(ENDPOINTS.groups.enroll(id), values),

  /** A'zolik holatini o'zgartirish (`trial` → `active`, `left`, ...). */
  updateStudent: (enrollmentId: string, values: Record<string, unknown>) =>
    http.patch<unknown>(ENDPOINTS.enrollments.byId(enrollmentId), values),

  /** A'zolikni butunlay o'chirish — tarix yo'qoladi, shuning uchun holat afzal. */
  removeStudent: (enrollmentId: string) => http.delete(ENDPOINTS.enrollments.byId(enrollmentId)),
};

export const groupTeacherApi = {
  list: (groupId: string, params: ListQueryParams = {}) =>
    http.list<GroupTeacher>(
      ENDPOINTS.groups.teachers(groupId),
      cleanParams({ page_size: 100, ...params }),
    ),

  create: (groupId: string, values: Record<string, unknown>) =>
    http.post<GroupTeacher>(ENDPOINTS.groups.teachers(groupId), values),

  update: (groupId: string, teacherId: string, values: Record<string, unknown>) =>
    http.patch<GroupTeacher>(ENDPOINTS.groups.teacherById(groupId, teacherId), values),

  remove: (groupId: string, teacherId: string) =>
    http.delete(ENDPOINTS.groups.teacherById(groupId, teacherId)),
};
