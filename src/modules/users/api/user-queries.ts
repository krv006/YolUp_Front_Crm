import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { userApi, type UserListParamsExtended } from "./user-api";

export const userKeys = {
  all: ["users"] as const,
  list: (params: UserListParamsExtended) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export function useUserList(params: UserListParamsExtended) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.list(params),
  });
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.get(id),
    enabled: Boolean(id),
  });
}

export function useUserCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => userApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toastSuccess("Xodim qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useUserUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => userApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toastSuccess("Xodim yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useUserRemove(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => userApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toastSuccess("Xodim o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
