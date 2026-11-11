import type { ReactNode } from "react";

import { usePermission } from "../lib/use-permission";
import type { Permission } from "../model/types";

interface PermissionGateProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

/** Ruxsat bo'lmasa amalni (tugma, ustun, blok) umuman chizmaydi. */
export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const { can } = usePermission();
  return <>{can(permission) ? children : fallback}</>;
}
