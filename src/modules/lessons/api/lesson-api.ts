import type { Lesson, LessonListParams } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export interface LessonListParamsExtended extends LessonListParams, ListQueryParams {}

export const lessonApi = {
  list: (params: LessonListParamsExtended) =>
    http.list<Lesson>(ENDPOINTS.lessons.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Lesson>(ENDPOINTS.lessons.root, values),

  get: (id: string) => http.get<Lesson>(ENDPOINTS.lessons.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Lesson>(ENDPOINTS.lessons.byId(id), values),
};
