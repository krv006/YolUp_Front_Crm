import type { MessageTemplate, AutomationRule, MessageLog } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const messageTemplateApi = {
  list: (params: ListQueryParams) =>
    http.list<MessageTemplate>(ENDPOINTS.messageTemplates.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<MessageTemplate>(ENDPOINTS.messageTemplates.root, values),

  get: (id: string) => http.get<MessageTemplate>(ENDPOINTS.messageTemplates.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<MessageTemplate>(ENDPOINTS.messageTemplates.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.messageTemplates.byId(id)),
};

export const automationRuleApi = {
  list: (params: ListQueryParams) =>
    http.list<AutomationRule>(ENDPOINTS.automationRules.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<AutomationRule>(ENDPOINTS.automationRules.root, values),

  get: (id: string) => http.get<AutomationRule>(ENDPOINTS.automationRules.byId(id)),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<AutomationRule>(ENDPOINTS.automationRules.byId(id), values),
};

export const messageLogApi = {
  list: (params: ListQueryParams) =>
    http.list<MessageLog>(ENDPOINTS.messageLogs.root, cleanParams({ ...params })),
};

export const smsSendApi = {
  send: (values: Record<string, unknown>) =>
    http.post(ENDPOINTS.smsSend.root, values),
};
