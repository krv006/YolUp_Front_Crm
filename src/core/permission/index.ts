/**
 * Permission bo'lakning PUBLIC API'si.
 */
export { can, hasRole } from "./lib/can";
export { usePermission } from "./lib/use-permission";
export { ROLE_PERMISSIONS } from "./model/permissions";
export type { Permission } from "./model/types";
export { PermissionGate } from "./ui/permission-gate";
