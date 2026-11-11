import type { Branch } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const branchApi = {
  list: (params: ListQueryParams) =>
    http.list<Branch>(ENDPOINTS.branches.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Branch>(ENDPOINTS.branches.root, values),

  get: (id: string) => http.get<Branch>(ENDPOINTS.branches.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Branch>(ENDPOINTS.branches.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.branches.byId(id)),
};
