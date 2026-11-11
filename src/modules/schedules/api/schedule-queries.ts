import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { scheduleSlotApi, type ScheduleSlotListParamsExtended } from "./schedule-api";

export const scheduleSlotKeys = {
  all: ["scheduleSlots"] as const,
  list: (params: ScheduleSlotListParamsExtended) => [
    ...scheduleSlotKeys.all,
    "list",
    params,
  ] as const,
  detail: (_id: string) => [...scheduleSlotKeys.all, "detail", _id] as const,
};

export function useScheduleSlotList(params: ScheduleSlotListParamsExtended) {
  return useQuery({
    queryKey: scheduleSlotKeys.list(params),
    queryFn: () => scheduleSlotApi.list(params),
  });
}

export function useScheduleSlotDetail(_id: string) {
  return useQuery({
    queryKey: scheduleSlotKeys.detail(_id),
    queryFn: () => scheduleSlotApi.get(_id),
    enabled: Boolean(_id),
  });
}

export function useScheduleSlotCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => scheduleSlotApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleSlotKeys.all });
      toastSuccess("Saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useScheduleSlotUpdate(_id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => scheduleSlotApi.update(_id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleSlotKeys.all });
      queryClient.invalidateQueries({ queryKey: scheduleSlotKeys.detail(_id) });
      toastSuccess("Saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useScheduleSlotRemove() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id: string) => scheduleSlotApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleSlotKeys.all });
      toastSuccess("O'chirildi");
    },
    onError: (error) => toastError(error),
  });
}
