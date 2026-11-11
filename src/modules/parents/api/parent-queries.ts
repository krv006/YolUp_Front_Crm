import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import type { ListQueryParams } from "@/shared/api";
import { parentApi, parentStudentLinkApi } from "./parent-api";

export const parentKeys = {
  all: ["parents"] as const,
  list: (params: ListQueryParams) => [...parentKeys.all, "list", params] as const,
  detail: (id: string) => [...parentKeys.all, "detail", id] as const,
};

export function useParentList(params: ListQueryParams) {
  return useQuery({
    queryKey: parentKeys.list(params),
    queryFn: () => parentApi.list(params),
  });
}

export function useParentDetail(id: string) {
  return useQuery({
    queryKey: parentKeys.detail(id),
    queryFn: () => parentApi.get(id),
    enabled: Boolean(id),
  });
}

export function useParentCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => parentApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentKeys.all });
      toastSuccess("Ota-ona qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useParentUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => parentApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentKeys.all });
      queryClient.invalidateQueries({ queryKey: parentKeys.detail(id) });
      toastSuccess("Ota-ona yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useParentDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => parentApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentKeys.all });
      toastSuccess("Ota-ona o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const parentStudentLinkKeys = {
  all: ["parentStudentLinks"] as const,
  list: (params?: Record<string, unknown>) =>
    [...parentStudentLinkKeys.all, "list", params] as const,
};

export function useParentStudentLinks(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: parentStudentLinkKeys.list(params),
    queryFn: () => parentStudentLinkApi.list(params),
  });
}

export function useParentStudentLinkCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => parentStudentLinkApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentStudentLinkKeys.all });
      toastSuccess("Bog'landi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useParentStudentLinkRemove() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => parentStudentLinkApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parentStudentLinkKeys.all });
      toastSuccess("Bog'liq o'chirildi");
    },
    onError: (error) => toastError(error),
  });
}
