import type { Assessment, AssessmentListParams, Score, ScoreListParams } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListParams } from "@/shared/api";

export interface AssessmentListParamsExtended extends AssessmentListParams, ListParams {}
export interface ScoreListParamsExtended extends ScoreListParams, ListParams {}

export const assessmentApi = {
  list: (params: AssessmentListParamsExtended) =>
    http.list<Assessment>(ENDPOINTS.assessments.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Assessment>(ENDPOINTS.assessments.root, values),

  get: (id: string) => http.get<Assessment>(ENDPOINTS.assessments.byId(id)),
};

export const scoreApi = {
  list: (params: ScoreListParamsExtended) =>
    http.list<Score>(ENDPOINTS.scores.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Score>(ENDPOINTS.scores.root, values),
};
