import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { dayOffApi } from "./days-off-api";

export const dayOffKeys = {
  all: ["daysOff"] as const,
  list: (params: ListQueryParams) => [...dayOffKeys.all, "list", params] as const,
  detail: (id: string) => [...dayOffKeys.all, "detail", id] as const,
};

export function useDayOffList(params: ListQueryParams) {
  return useQuery({
    queryKey: dayOffKeys.list(params),
    queryFn: () => dayOffApi.list(params),
  });
}

export function useDayOffDetail(id: string) {
  return useQuery({
    queryKey: dayOffKeys.detail(id),
    queryFn: () => dayOffApi.get(id),
    enabled: Boolean(id),
  });
}

export function useDayOffCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => dayOffApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dayOffKeys.all });
      toastSuccess("Dam olish kuni qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useDayOffUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => dayOffApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dayOffKeys.all });
      queryClient.invalidateQueries({ queryKey: dayOffKeys.detail(id) });
      toastSuccess("Dam olish kuni yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useDayOffRemove(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => dayOffApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dayOffKeys.all });
      toastSuccess("Dam olish kuni o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
