import type { User, UserListParams } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListParams } from "@/shared/api";

export interface UserListParamsExtended extends UserListParams, ListParams {}

export const userApi = {
  list: (params: UserListParamsExtended) =>
    http.list<User>(ENDPOINTS.users.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<User>(ENDPOINTS.users.root, values),

  get: (id: string) => http.get<User>(ENDPOINTS.users.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<User>(ENDPOINTS.users.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.users.byId(id)),
};
