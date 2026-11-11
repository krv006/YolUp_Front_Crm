import type { Tenant } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const tenantApi = {
  list: (params: ListQueryParams) =>
    http.list<Tenant>(ENDPOINTS.tenants.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Tenant>(ENDPOINTS.tenants.root, values),

  get: (id: string) => http.get<Tenant>(ENDPOINTS.tenants.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Tenant>(ENDPOINTS.tenants.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.tenants.byId(id)),

  block: (id: string) => http.post<Tenant>(ENDPOINTS.tenants.block(id), {}),

  unblock: (id: string) => http.post<Tenant>(ENDPOINTS.tenants.unblock(id), {}),

  subscription: (id: string, values: Record<string, unknown>) =>
    http.post<Tenant>(ENDPOINTS.tenants.subscription(id), values),
};
