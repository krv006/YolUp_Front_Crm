import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import {
  messageTemplateApi,
  automationRuleApi,
  messageLogApi,
  smsSendApi,
} from "./messaging-api";

export const messageTemplateKeys = {
  all: ["messageTemplates"] as const,
  list: (params: ListQueryParams) => [
    ...messageTemplateKeys.all,
    "list",
    params,
  ] as const,
  detail: (id: string) => [...messageTemplateKeys.all, "detail", id] as const,
};

export function useMessageTemplateList(params: ListQueryParams) {
  return useQuery({
    queryKey: messageTemplateKeys.list(params),
    queryFn: () => messageTemplateApi.list(params),
  });
}

export function useMessageTemplateDetail(id: string) {
  return useQuery({
    queryKey: messageTemplateKeys.detail(id),
    queryFn: () => messageTemplateApi.get(id),
    enabled: Boolean(id),
  });
}

export function useMessageTemplateCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => messageTemplateApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all });
      toastSuccess("Shablon saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useMessageTemplateUpdate(_id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => messageTemplateApi.update(_id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all });
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.detail(_id) });
      toastSuccess("Shablon yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useMessageTemplateRemove(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => messageTemplateApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all });
      toastSuccess("Shablon o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const automationRuleKeys = {
  all: ["automationRules"] as const,
  list: (params: ListQueryParams) => [
    ...automationRuleKeys.all,
    "list",
    params,
  ] as const,
  detail: (id: string) => [...automationRuleKeys.all, "detail", id] as const,
};

export function useAutomationRuleList(params: ListQueryParams) {
  return useQuery({
    queryKey: automationRuleKeys.list(params),
    queryFn: () => automationRuleApi.list(params),
  });
}

export function useAutomationRuleCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => automationRuleApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: automationRuleKeys.all });
      toastSuccess("Avtomatik qoida saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const messageLogKeys = {
  all: ["messageLogs"] as const,
  list: (params: ListQueryParams) => [...messageLogKeys.all, "list", params] as const,
};

export function useMessageLogList(params: ListQueryParams) {
  return useQuery({
    queryKey: messageLogKeys.list(params),
    queryFn: () => messageLogApi.list(params),
  });
}

export function useSmsSend(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => smsSendApi.send(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageLogKeys.all });
      toastSuccess("SMS yuborildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
