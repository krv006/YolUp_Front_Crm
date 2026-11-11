import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { lessonApi, type LessonListParamsExtended } from "./lesson-api";

export const lessonKeys = {
  all: ["lessons"] as const,
  list: (params: LessonListParamsExtended) => [...lessonKeys.all, "list", params] as const,
  detail: (id: string) => [...lessonKeys.all, "detail", id] as const,
};

export function useLessonList(params: LessonListParamsExtended) {
  return useQuery({
    queryKey: lessonKeys.list(params),
    queryFn: () => lessonApi.list(params),
  });
}

export function useLessonDetail(id: string) {
  return useQuery({
    queryKey: lessonKeys.detail(id),
    queryFn: () => lessonApi.get(id),
    enabled: Boolean(id),
  });
}

export function useLessonCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => lessonApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      toastSuccess("Saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLessonUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => lessonApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(id) });
      toastSuccess("Saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
