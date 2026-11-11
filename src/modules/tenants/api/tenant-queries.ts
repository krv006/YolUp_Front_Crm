import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { tenantApi } from "./tenant-api";

export const tenantKeys = {
  all: ["tenants"] as const,
  list: (params: ListQueryParams) => [...tenantKeys.all, "list", params] as const,
  detail: (id: string) => [...tenantKeys.all, "detail", id] as const,
};

export function useTenantList(params: ListQueryParams) {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantApi.list(params),
  });
}

export function useTenantDetail(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantApi.get(id),
    enabled: Boolean(id),
  });
}

export function useTenantCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => tenantApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      toastSuccess("Markaz qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useTenantUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => tenantApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(id) });
      toastSuccess("Markaz yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useTenantDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => tenantApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      toastSuccess("Markaz o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useTenantBlock(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => tenantApi.block(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      toastSuccess("Markaz bloklandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useTenantUnblock(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => tenantApi.unblock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      toastSuccess("Blokdan chiqarildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useTenantSubscription(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => tenantApi.subscription(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(id) });
      toastSuccess("Obuna yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
