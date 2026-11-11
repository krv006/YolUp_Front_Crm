import type { UserRole } from "@/core/auth";
import { ROLE_PERMISSIONS } from "../model/permissions";
import type { Permission } from "../model/types";

/** Rolda berilgan huquq bormi. */
export function can(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Rol berilgan ro'yxatga kiradimi. */
export function hasRole(role: UserRole | undefined, allowed: readonly UserRole[]): boolean {
  return Boolean(role && allowed.includes(role));
}
