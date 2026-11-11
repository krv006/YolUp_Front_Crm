import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { assessmentApi, scoreApi, type AssessmentListParamsExtended } from "./assessment-api";

export const assessmentKeys = {
  all: ["assessments"] as const,
  list: (params: AssessmentListParamsExtended) => [
    ...assessmentKeys.all,
    "list",
    params,
  ] as const,
  detail: (id: string) => [...assessmentKeys.all, "detail", id] as const,
};

export function useAssessmentList(params: AssessmentListParamsExtended) {
  return useQuery({
    queryKey: assessmentKeys.list(params),
    queryFn: () => assessmentApi.list(params),
  });
}

export function useAssessmentDetail(id: string) {
  return useQuery({
    queryKey: assessmentKeys.detail(id),
    queryFn: () => assessmentApi.get(id),
    enabled: Boolean(id),
  });
}

export function useAssessmentCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => assessmentApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all });
      toastSuccess("Saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const scoreKeys = {
  all: ["scores"] as const,
  list: (params: Record<string, unknown>) => [...scoreKeys.all, "list", params] as const,
};

export function useScoreList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: scoreKeys.list(params),
    queryFn: () => scoreApi.list(params),
  });
}

export function useScoreCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => scoreApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scoreKeys.all });
      toastSuccess("Saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
