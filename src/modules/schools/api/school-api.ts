import type { School } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const schoolApi = {
  list: (params: ListQueryParams) =>
    http.list<School>(ENDPOINTS.schools.root, cleanParams({ ...params })),

  /**
   * Lid formasi va filtri uchun yengil ro'yxat. Nofaol maktablar ham
   * qaytariladi: eski lidlar ularga bog'langan bo'lishi mumkin — filtrda
   * ko'rinmasa, o'sha lidlarni topib bo'lmay qolardi.
   */
  options: () =>
    http.list<School>(
      ENDPOINTS.schools.root,
      cleanParams({ page: 1, page_size: 200, ordering: "name" }),
    ),

  create: (values: Record<string, unknown>) =>
    http.post<School>(ENDPOINTS.schools.root, values),

  get: (id: string) => http.get<School>(ENDPOINTS.schools.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<School>(ENDPOINTS.schools.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.schools.byId(id)),
};
