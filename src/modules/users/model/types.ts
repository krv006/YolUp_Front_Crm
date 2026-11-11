/**
 * User (xodim) modeli — staff boshqaruvi.
 */
export interface User {
  id: string;
  tenant_id: string;
  branch_id?: string | null;
  role: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone: string;
  email?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  permissions: string[];
}

export interface UserListParams {
  role?: string;
  branch_id?: string;
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}
