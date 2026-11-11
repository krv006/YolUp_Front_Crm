import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { studentApi } from "./student-api";

export const studentKeys = {
  all: ["students"] as const,
  list: (params: ListQueryParams) => [...studentKeys.all, "list", params] as const,
  detail: (id: string) => [...studentKeys.all, "detail", id] as const,
};

export function useStudentList(params: ListQueryParams) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentApi.list(params),
  });
}

export function useStudentDetail(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentApi.get(id),
    enabled: Boolean(id),
  });
}

export function useStudentCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => studentApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toastSuccess("O'quvchi qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useStudentUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => studentApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
      toastSuccess("O'quvchi yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useStudentDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => studentApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
      toastSuccess("O'quvchi o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
