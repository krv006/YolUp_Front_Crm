import { useCallback } from "react";

import { useCurrentRole, type UserRole } from "@/core/auth";
import type { Permission } from "../model/types";
import { can, hasRole } from "./can";

/**
 * Komponentlarda rolni to'g'ridan-to'g'ri taqqoslash taqiqlanadi
 * (`role === 'admin'` yozilmaydi) — hamma tekshiruv shu hook orqali o'tadi.
 */
export function usePermission() {
  const role = useCurrentRole();

  return {
    role,
    can: useCallback((permission: Permission) => can(role, permission), [role]),
    hasRole: useCallback((allowed: readonly UserRole[]) => hasRole(role, allowed), [role]),
  };
}
