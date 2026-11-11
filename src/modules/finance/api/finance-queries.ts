import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import type { ChargeAccrualValues, ChargeListParams, DebtListParams } from "../model/types";
import {
  debtApi,
  paymentApi,
  paymentMethodApi,
  chargeApi,
  discountApi,
  expenseCategoryApi,
  expenseApi,
  cashShiftApi,
  pnlApi,
} from "./finance-api";

export const paymentKeys = {
  all: ["payments"] as const,
  list: (params: ListQueryParams) => [...paymentKeys.all, "list", params] as const,
  detail: (id: string) => [...paymentKeys.all, "detail", id] as const,
};

export function usePaymentList(params: ListQueryParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentApi.list(params),
  });
}

export function usePaymentDetail(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentApi.get(id),
    enabled: Boolean(id),
  });
}

export function usePaymentCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => paymentApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      // To'lov hisob-faktura qoldig'i va qarzdorlar ro'yxatini o'zgartiradi.
      queryClient.invalidateQueries({ queryKey: chargeKeys.all });
      queryClient.invalidateQueries({ queryKey: debtKeys.all });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toastSuccess("To'lov qabul qilindi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function usePaymentReceipt(id: string) {
  return useQuery({
    queryKey: [...paymentKeys.detail(id), "receipt"] as const,
    queryFn: () => paymentApi.receipt(id),
    enabled: Boolean(id),
  });
}

export const chargeKeys = {
  all: ["charges"] as const,
  list: (params: ChargeListParams) => [...chargeKeys.all, "list", params] as const,
};

export function useChargeList(params: ChargeListParams) {
  return useQuery({
    queryKey: chargeKeys.list(params),
    queryFn: () => chargeApi.list(params),
  });
}

/**
 * Hisob-faktura o'zgarganda qarzlar va o'quvchi balansi ham yangilanadi —
 * ular shu yozuvlardan hosil qilinadi.
 */
function useBillingInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: chargeKeys.all });
    queryClient.invalidateQueries({ queryKey: ["debts"] });
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };
}

export function useChargeAccrue(onDone?: (created: number) => void) {
  const invalidate = useBillingInvalidate();
  return useMutation<
    { created: number; skipped: number; period: string; group_id: string },
    ApiError,
    ChargeAccrualValues
  >({
    mutationFn: (values) => chargeApi.accrue(values),
    onSuccess: (result) => {
      invalidate();
      toastSuccess(`${result.created} ta hisob-faktura yaratildi`);
      onDone?.(result.created);
    },
    onError: (error) => toastError(error),
  });
}

export function useChargeUpdate(id: string, onDone?: () => void) {
  const invalidate = useBillingInvalidate();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => chargeApi.update(id, values),
    onSuccess: () => {
      invalidate();
      toastSuccess("Hisob-faktura yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useChargeRemove(onDone?: () => void) {
  const invalidate = useBillingInvalidate();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => chargeApi.remove(id),
    onSuccess: () => {
      invalidate();
      toastSuccess("Hisob-faktura o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const debtKeys = {
  all: ["debts"] as const,
  list: (params: DebtListParams) => [...debtKeys.all, "list", params] as const,
};

export function useDebtList(params: DebtListParams) {
  return useQuery({
    queryKey: debtKeys.list(params),
    queryFn: () => debtApi.list(params),
  });
}

export const paymentMethodKeys = {
  all: ["paymentMethods"] as const,
  list: (params?: Record<string, unknown>) =>
    [...paymentMethodKeys.all, "list", params] as const,
};

export function usePaymentMethodList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: paymentMethodKeys.list(params),
    queryFn: () => paymentMethodApi.list(params),
  });
}

export function usePaymentMethodCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => paymentMethodApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
      toastSuccess("To'lov turi qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function usePaymentMethodUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => paymentMethodApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
      toastSuccess("To'lov turi yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function usePaymentMethodRemove(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => paymentMethodApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
      toastSuccess("To'lov turi o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const discountKeys = {
  all: ["discounts"] as const,
  list: (params?: Record<string, unknown>) => [...discountKeys.all, "list", params] as const,
};

export function useDiscountList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: discountKeys.list(params),
    queryFn: () => discountApi.list(params),
  });
}

export function useDiscountCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => discountApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discountKeys.all });
      toastSuccess("Chegirma saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const expenseCategoryKeys = {
  all: ["expenseCategories"] as const,
  list: (params?: Record<string, unknown>) => [...expenseCategoryKeys.all, "list", params] as const,
};

export function useExpenseCategoryList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: expenseCategoryKeys.list(params),
    queryFn: () => expenseCategoryApi.list(params),
  });
}

export const expenseKeys = {
  all: ["expenses"] as const,
  list: (params: ListQueryParams) => [...expenseKeys.all, "list", params] as const,
};

export function useExpenseList(params: ListQueryParams) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expenseApi.list(params),
  });
}

export function useExpenseCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => expenseApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toastSuccess("Xarajat saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const cashShiftKeys = {
  all: ["cashShifts"] as const,
  list: (params?: Record<string, unknown>) => [...cashShiftKeys.all, "list", params] as const,
};

export function useCashShiftList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: cashShiftKeys.list(params),
    queryFn: () => cashShiftApi.list(params),
  });
}

export function useCashShiftOpen(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => cashShiftApi.open(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashShiftKeys.all });
      toastSuccess("Kassa ochildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useCashShiftClose(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => cashShiftApi.close(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashShiftKeys.all });
      toastSuccess("Kassa yopildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const pnlKeys = {
  all: ["pnl"] as const,
};

export function usePnL(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: pnlKeys.all,
    queryFn: () => pnlApi.get(params),
  });
}
