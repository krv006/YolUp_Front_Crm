import type { Lead, LeadSource, LeadStageRecord, LeadLossReason } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const leadApi = {
  list: (params: ListQueryParams) =>
    http.list<Lead>(ENDPOINTS.leads.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Lead>(ENDPOINTS.leads.root, values),

  get: (id: string) => http.get<Lead>(ENDPOINTS.leads.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Lead>(ENDPOINTS.leads.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.leads.byId(id)),

  convert: (id: string, values: Record<string, unknown>) =>
    http.post(ENDPOINTS.leads.convert(id), values),
};

export const leadSourceApi = {
  list: (params?: Record<string, unknown>) =>
    http.list<LeadSource>(ENDPOINTS.leadSources.root, params),

  create: (values: Record<string, unknown>) =>
    http.post<LeadSource>(ENDPOINTS.leadSources.root, values),

  get: (id: string) => http.get<LeadSource>(ENDPOINTS.leadSources.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<LeadSource>(ENDPOINTS.leadSources.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.leadSources.byId(id)),
};

export const leadStageApi = {
  list: (params?: Record<string, unknown>) =>
    http.list<LeadStageRecord>(ENDPOINTS.leadStages.root, params),

  create: (values: Record<string, unknown>) =>
    http.post<LeadStageRecord>(ENDPOINTS.leadStages.root, values),

  get: (id: string) => http.get<LeadStageRecord>(ENDPOINTS.leadStages.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<LeadStageRecord>(ENDPOINTS.leadStages.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.leadStages.byId(id)),
};

export const leadLossReasonApi = {
  list: (params?: Record<string, unknown>) =>
    http.list<LeadLossReason>(ENDPOINTS.leadLossReasons.root, params),

  create: (values: Record<string, unknown>) =>
    http.post<LeadLossReason>(ENDPOINTS.leadLossReasons.root, values),

  get: (id: string) => http.get<LeadLossReason>(ENDPOINTS.leadLossReasons.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<LeadLossReason>(ENDPOINTS.leadLossReasons.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.leadLossReasons.byId(id)),
};
