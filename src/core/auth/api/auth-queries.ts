import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ENDPOINTS, http } from "@/shared/api";
import { tokenStorage } from "@/shared/lib/token-storage";
import { useAuthStore } from "@/core/auth/model/auth-store";
import type { LoginValues } from "@/core/auth/model/schemas";
import type { TokenPair, User } from "@/core/auth/model/types";

export const authKeys = {
  all: ["auth"] as const,
  me: ["auth", "me"] as const,
};

/** `POST /auth/login/` */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<TokenPair, Error, LoginValues>({
    mutationFn: (values) => http.post<TokenPair>(ENDPOINTS.auth.login, values),
    onSuccess: (tokens) => {
      tokenStorage.set(tokens.access, tokens.refresh);
      void queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}

/** `POST /auth/logout/` */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await http.post(ENDPOINTS.auth.logout, {});
    },
    onSettled: () => {
      tokenStorage.clear();
      queryClient.clear();
      useAuthStore.getState().signOut();
    },
  });
}

/**
 * `GET /auth/me/` — sahifa yangilanganda sessiyani tiklaydi.
 * Token bo'lmasa so'rov yuborilmaydi (`enabled`).
 */
export function useSession(enabled = true) {
  return useQuery<User, Error>({
    queryKey: authKeys.me,
    enabled,
    retry: false,
    queryFn: () => http.get<User>(ENDPOINTS.auth.me),
  });
}
