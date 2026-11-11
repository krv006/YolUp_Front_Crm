import type { Course } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const courseApi = {
  list: (params: ListQueryParams) =>
    http.list<Course>(ENDPOINTS.courses.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Course>(ENDPOINTS.courses.root, values),

  get: (id: string) => http.get<Course>(ENDPOINTS.courses.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Course>(ENDPOINTS.courses.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.courses.byId(id)),
};
