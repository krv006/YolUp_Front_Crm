import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { branchApi } from "./branch-api";

export const branchKeys = {
  all: ["branches"] as const,
  list: (params: ListQueryParams) => [...branchKeys.all, "list", params] as const,
  detail: (id: string) => [...branchKeys.all, "detail", id] as const,
};

export function useBranchList(params: ListQueryParams) {
  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: () => branchApi.list(params),
  });
}

export function useBranchDetail(id: string) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => branchApi.get(id),
    enabled: Boolean(id),
  });
}

export function useBranchCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => branchApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
      toastSuccess("Filial qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useBranchUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => branchApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) });
      toastSuccess("Filial yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useBranchDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => branchApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
      toastSuccess("Filial o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
