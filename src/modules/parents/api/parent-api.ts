import type { Parent } from "../model/types";
import type { ParentStudentLink } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const parentApi = {
  list: (params: ListQueryParams) =>
    http.list<Parent>(ENDPOINTS.parents.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Parent>(ENDPOINTS.parents.root, values),

  get: (id: string) => http.get<Parent>(ENDPOINTS.parents.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Parent>(ENDPOINTS.parents.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.parents.byId(id)),
};

export const parentStudentLinkApi = {
  list: (params?: Record<string, unknown>) =>
    http.list<ParentStudentLink>(ENDPOINTS.parentStudentLinks.root, params),

  create: (values: Record<string, unknown>) =>
    http.post<ParentStudentLink>(ENDPOINTS.parentStudentLinks.root, values),

  remove: (id: string) =>
    http.delete(ENDPOINTS.parentStudentLinks.byId(id)),
};
