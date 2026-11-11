/**
 * Branch (filial) modeli.
 */
export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchListParams {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}
