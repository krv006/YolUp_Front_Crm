// Client-side token storage (httpOnly cookie preferred by backend; this is fallback)
// No secrets in localStorage per architecture decision.
import { STORAGE_KEYS } from "@/shared/constants";

export const storage = {
  get: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore quota errors
    }
  },
  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
  getTenantId: (): string | null => storage.get(STORAGE_KEYS.TENANT_ID),
  setTenantId: (id: string): void => storage.set(STORAGE_KEYS.TENANT_ID, id),
  removeTenantId: (): void => storage.remove(STORAGE_KEYS.TENANT_ID),
  getBranchId: (): string | null => storage.get(STORAGE_KEYS.BRANCH_ID),
  setBranchId: (id: string): void => storage.set(STORAGE_KEYS.BRANCH_ID, id),
  removeBranchId: (): void => storage.remove(STORAGE_KEYS.BRANCH_ID),
};
