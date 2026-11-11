/**
 * Tenant (markaz) modeli — C-Panel bo'yicha umumiy domen.
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logo_url?: string | null;
  currency: string;
  timezone: string;
  subscription_tier: "basic" | "standard" | "professional" | "enterprise";
  subscription_status: "active" | "trial" | "expired" | "blocked";
  subscription_expires_at?: string | null;
  max_students?: number | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantListParams {
  search?: string;
  subscription_status?: string;
  subscription_tier?: string;
  is_blocked?: boolean;
  page?: number;
  page_size?: number;
}
