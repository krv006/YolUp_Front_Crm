import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { leadApi, leadSourceApi, leadLossReasonApi, leadStageApi } from "./lead-api";

export const leadKeys = {
  all: ["leads"] as const,
  list: (params: ListQueryParams) => [...leadKeys.all, "list", params] as const,
  detail: (id: string) => [...leadKeys.all, "detail", id] as const,
};

/**
 * Maktab statistikasi (lidlar soni, konversiya) lidlardan hisoblanadi —
 * lid o'zgarganda maktab kartalari ham eskiradi.
 */
const SCHOOL_KEYS = ["schools"] as const;

/** Lid yozuviga tegadigan har qanday mutatsiyadan keyin yangilanadigan kalitlar. */
function invalidateLeadDependents(queryClient: QueryClient, id?: string) {
  queryClient.invalidateQueries({ queryKey: leadKeys.all });
  if (id) queryClient.invalidateQueries({ queryKey: leadKeys.detail(id) });
  queryClient.invalidateQueries({ queryKey: SCHOOL_KEYS });
}

export function useLeadList(params: ListQueryParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => leadApi.list(params),
  });
}

export function useLeadDetail(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadApi.get(id),
    enabled: Boolean(id),
  });
}

export function useLeadCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => leadApi.create(values),
    onSuccess: () => {
      invalidateLeadDependents(queryClient);
      toastSuccess("Lid qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLeadUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => leadApi.update(id, values),
    onSuccess: () => {
      invalidateLeadDependents(queryClient, id);
      toastSuccess("Lid yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLeadConvert(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => leadApi.convert(id, values),
    onSuccess: () => {
      invalidateLeadDependents(queryClient, id);
      // Konvertatsiya yangi o'quvchi (va ehtimol a'zolik) yaratadi.
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toastSuccess("O'quvchiga aylantirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLeadDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => leadApi.remove(id),
    onSuccess: () => {
      invalidateLeadDependents(queryClient);
      toastSuccess("Lid o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

/** Kanban kartasini boshqa bosqichga o'tkazish. */
export function useLeadMove() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { id: string; stage: string }>({
    mutationFn: ({ id, stage }) => leadApi.update(id, { stage }),
    onSuccess: () => {
      invalidateLeadDependents(queryClient);
      toastSuccess("Bosqich yangilandi");
    },
    onError: (error) => toastError(error),
  });
}

export const leadSourceKeys = {
  all: ["leadSources"] as const,
  list: (params?: Record<string, unknown>) => [...leadSourceKeys.all, "list", params] as const,
  detail: (_id: string) => [...leadSourceKeys.all, "detail", _id] as const,
};

export function useLeadSources(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: leadSourceKeys.list(params),
    queryFn: () => leadSourceApi.list(params),
  });
}

export const leadLossReasonKeys = {
  all: ["leadLossReasons"] as const,
  list: (params?: Record<string, unknown>) => [...leadLossReasonKeys.all, "list", params] as const,
  detail: (_id: string) => [...leadLossReasonKeys.all, "detail", _id] as const,
};

export function useLeadLossReasons(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: leadLossReasonKeys.list(params),
    queryFn: () => leadLossReasonApi.list(params),
  });
}

/**
 * Lid manbalari — CRUD. O'chirishda lidlar bilan bog'langanligi serverda
 * tekshiriladi (400).
 */
export function useLeadSourceCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => leadSourceApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.all });
      toastSuccess("Manba qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLeadSourceUpdate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { id: string; values: Record<string, unknown> }>({
    mutationFn: ({ id, values }) => leadSourceApi.update(id, values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.all });
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.detail(variables.id) });
      toastSuccess("Manba yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLeadSourceRemove(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => leadSourceApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadSourceKeys.all });
      toastSuccess("Manba o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

/**
 * Yo'qotish sabablari — CRUD. O'chirishda lidlar bilan bog'langanligi serverda
 * tekshiriladi (400).
 */
export function useLeadLossReasonCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => leadLossReasonApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadLossReasonKeys.all });
      toastSuccess("Sabab qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLeadLossReasonUpdate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { id: string; values: Record<string, unknown> }>({
    mutationFn: ({ id, values }) => leadLossReasonApi.update(id, values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: leadLossReasonKeys.all });
      queryClient.invalidateQueries({ queryKey: leadLossReasonKeys.detail(variables.id) });
      toastSuccess("Sabab yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLeadLossReasonRemove(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => leadLossReasonApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadLossReasonKeys.all });
      toastSuccess("Sabab o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export const leadStageKeys = {
  all: ["leadStages"] as const,
  list: (params?: Record<string, unknown>) => [...leadStageKeys.all, "list", params] as const,
  detail: (_id: string) => [...leadStageKeys.all, "detail", _id] as const,
};

/** Kanban ustunlari — tizim bosqichlaridan tashqari foydalanuvchi qo'shganlari. */
export function useLeadStages(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: leadStageKeys.list(params),
    queryFn: () => leadStageApi.list(params),
  });
}

export function useLeadStageCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => leadStageApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadStageKeys.all });
      toastSuccess("Ustun qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLeadStageUpdate(_id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => leadStageApi.update(_id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadStageKeys.all });
      queryClient.invalidateQueries({ queryKey: leadStageKeys.detail(_id) });
      toastSuccess("Ustun yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useLeadStageDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => leadStageApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadStageKeys.all });
      toastSuccess("Ustun o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
