import type { Student } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const studentApi = {
  list: (params: ListQueryParams) =>
    http.list<Student>(ENDPOINTS.students.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Student>(ENDPOINTS.students.root, values),

  get: (id: string) => http.get<Student>(ENDPOINTS.students.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Student>(ENDPOINTS.students.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.students.byId(id)),
};
