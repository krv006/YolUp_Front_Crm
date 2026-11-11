import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { roomApi } from "./room-api";

export const roomKeys = {
  all: ["rooms"] as const,
  list: (params: ListQueryParams) => [...roomKeys.all, "list", params] as const,
  detail: (id: string) => [...roomKeys.all, "detail", id] as const,
};

export function useRoomList(params: ListQueryParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => roomApi.list(params),
  });
}

export function useRoomDetail(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomApi.get(id),
    enabled: Boolean(id),
  });
}

export function useRoomCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => roomApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
      toastSuccess("Xona qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useRoomUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => roomApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) });
      toastSuccess("Xona yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useRoomDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => roomApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
      toastSuccess("Xona o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
