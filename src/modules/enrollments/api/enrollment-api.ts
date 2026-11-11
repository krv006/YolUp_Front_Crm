import type { Enrollment, EnrollmentListParams } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListParams } from "@/shared/api";

export interface EnrollmentListParamsExtended extends EnrollmentListParams, ListParams {}

export const enrollmentApi = {
  list: (params: EnrollmentListParamsExtended) =>
    http.list<Enrollment>(ENDPOINTS.enrollments.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Enrollment>(ENDPOINTS.enrollments.root, values),

  get: (id: string) => http.get<Enrollment>(ENDPOINTS.enrollments.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Enrollment>(ENDPOINTS.enrollments.byId(id), values),
};
