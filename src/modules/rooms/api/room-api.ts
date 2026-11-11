import type { Room } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const roomApi = {
  list: (params: ListQueryParams) =>
    http.list<Room>(ENDPOINTS.rooms.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Room>(ENDPOINTS.rooms.root, values),

  get: (id: string) => http.get<Room>(ENDPOINTS.rooms.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Room>(ENDPOINTS.rooms.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.rooms.byId(id)),
};
