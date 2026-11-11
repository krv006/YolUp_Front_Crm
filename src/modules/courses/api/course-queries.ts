import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { courseApi } from "./course-api";

export const courseKeys = {
  all: ["courses"] as const,
  list: (params: ListQueryParams) => [...courseKeys.all, "list", params] as const,
  detail: (id: string) => [...courseKeys.all, "detail", id] as const,
};

export function useCourseList(params: ListQueryParams) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => courseApi.list(params),
  });
}

export function useCourseDetail(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCourseCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => courseApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      toastSuccess("Kurs qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useCourseUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => courseApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      toastSuccess("Kurs yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useCourseDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => courseApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      toastSuccess("Kurs o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
