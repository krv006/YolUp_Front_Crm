/**
 * JWT saqlash. Backend `POST /auth/login/` javobida access va refresh token beradi.
 * localStorage orqali saqlanadi (baza pattern).
 */
const ACCESS_KEY = "yolup_access_token";
const REFRESH_KEY = "yolup_refresh_token";
const TENANT_ID_KEY = "yolup_tenant_id";
const BRANCH_ID_KEY = "yolup_branch_id";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),

  set: (access: string, refresh?: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  getTenantId: () => localStorage.getItem(TENANT_ID_KEY),
  setTenantId: (id: string) => localStorage.setItem(TENANT_ID_KEY, id),
  removeTenantId: () => localStorage.removeItem(TENANT_ID_KEY),

  getBranchId: () => localStorage.getItem(BRANCH_ID_KEY),
  setBranchId: (id: string) => localStorage.setItem(BRANCH_ID_KEY, id),
  removeBranchId: () => localStorage.removeItem(BRANCH_ID_KEY),
};
