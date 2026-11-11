import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { centerApi } from "./center-api";

export const centerKeys = {
  all: ["center"] as const,
  me: ["center", "me"] as const,
};

/** Markaz profili — yagona yozuv. */
export function useCenterSettings() {
  return useQuery({
    queryKey: centerKeys.me,
    queryFn: () => centerApi.get(),
  });
}

export function useCenterUpdate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => centerApi.update(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: centerKeys.all });
      toastSuccess("Markaz profili yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
