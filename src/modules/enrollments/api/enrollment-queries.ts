import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { enrollmentApi, type EnrollmentListParamsExtended } from "./enrollment-api";

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  list: (params: EnrollmentListParamsExtended) => [
    ...enrollmentKeys.all,
    "list",
    params,
  ] as const,
  detail: (id: string) => [...enrollmentKeys.all, "detail", id] as const,
};

export function useEnrollmentList(params: EnrollmentListParamsExtended) {
  return useQuery({
    queryKey: enrollmentKeys.list(params),
    queryFn: () => enrollmentApi.list(params),
  });
}

export function useEnrollmentDetail(id: string) {
  return useQuery({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => enrollmentApi.get(id),
    enabled: Boolean(id),
  });
}

export function useEnrollmentCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => enrollmentApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      toastSuccess("Saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useEnrollmentUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => enrollmentApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(id) });
      toastSuccess("Saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
