import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { schoolApi } from "./school-api";

export const schoolKeys = {
  all: ["schools"] as const,
  list: (params: ListQueryParams) => [...schoolKeys.all, "list", params] as const,
  detail: (id: string) => [...schoolKeys.all, "detail", id] as const,
};

/**
 * Lid yozuvida maktab nomi inline keladi, lidlar esa o'z navbatida maktab
 * statistikasini belgilaydi — shuning uchun ikki tomon birga yangilanadi.
 */
const LEAD_KEYS = ["leads"] as const;

export function useSchoolList(params: ListQueryParams) {
  return useQuery({
    queryKey: schoolKeys.list(params),
    queryFn: () => schoolApi.list(params),
  });
}

export function useSchoolDetail(id: string) {
  return useQuery({
    queryKey: schoolKeys.detail(id),
    queryFn: () => schoolApi.get(id),
    enabled: Boolean(id),
  });
}

/** Lid formasi va filtri uchun yengil ro'yxat (nofaol maktablar ham kiradi). */
export function useSchoolOptions() {
  return useQuery({
    queryKey: [...schoolKeys.all, "options"] as const,
    queryFn: () => schoolApi.options(),
  });
}

export function useSchoolCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => schoolApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all });
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS });
      toastSuccess("Maktab qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useSchoolUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => schoolApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all });
      queryClient.invalidateQueries({ queryKey: schoolKeys.detail(id) });
      // Maktab nomi lidlarda inline ko'rinadi — ular ham yangilanishi kerak.
      queryClient.invalidateQueries({ queryKey: LEAD_KEYS });
      toastSuccess("Maktab yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useSchoolDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => schoolApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all });
      toastSuccess("Maktab o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
