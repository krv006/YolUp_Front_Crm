import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import type { ListQueryParams } from "@/shared/api";
import { payrollApi, payrollAdjustmentApi } from "./payroll-api";

export const payrollKeys = {
  all: ["payrolls"] as const,
  list: (params: ListQueryParams) => [...payrollKeys.all, "list", params] as const,
  detail: (id: string) => [...payrollKeys.all, "detail", id] as const,
};

export function usePayrollList(params: ListQueryParams) {
  return useQuery({
    queryKey: payrollKeys.list(params),
    queryFn: () => payrollApi.list(params),
  });
}

export function usePayrollDetail(id: string) {
  return useQuery({
    queryKey: payrollKeys.detail(id),
    queryFn: () => payrollApi.get(id),
    enabled: Boolean(id),
  });
}

export function usePayrollLock(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, void>({
    mutationFn: () => payrollApi.lock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      queryClient.invalidateQueries({ queryKey: payrollKeys.detail(id) });
      toastSuccess("Qayd etildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function usePayrollPay(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, void>({
    mutationFn: () => payrollApi.pay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      queryClient.invalidateQueries({ queryKey: payrollKeys.detail(id) });
      toastSuccess("To'landi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const payrollAdjustmentKeys = {
  all: ["payrollAdjustments"] as const,
  list: (params?: Record<string, unknown>) => [...payrollAdjustmentKeys.all, "list", params] as const,
};

export function usePayrollAdjustmentList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: payrollAdjustmentKeys.list(params),
    queryFn: () => payrollAdjustmentApi.list(params),
  });
}

export function usePayrollAdjustmentCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => payrollAdjustmentApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollAdjustmentKeys.all });
      /* Yakuniy summa o'zgardi — oylik ro'yxati va yig'malar yangilanadi. */
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toastSuccess("Tuzatish saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

/** Qoralama → qayd etilgan → to'langan o'tishlarini bitta hook orqali boshqaradi. */
export function usePayrollAction(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { id: string; action: "lock" | "pay" }>({
    mutationFn: ({ id, action }) =>
      action === "lock" ? payrollApi.lock(id) : payrollApi.pay(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
      toastSuccess(variables.action === "lock" ? "Qayd etildi" : "To'landi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
