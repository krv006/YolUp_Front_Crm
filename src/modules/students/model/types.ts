/**
 * Student (o'quvchi) modeli.
 */
export interface Student {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone?: string | null;
  email?: string | null;
  birth_date?: string | null;
  gender?: "male" | "female" | "other" | null;
  address?: string | null;
  photo_url?: string | null;
  enrollment_date: string;
  status: "trial" | "active" | "frozen" | "left" | "graduated";
  balance_tiyin: number;
  /** Serializer may inline the current group / paying parent (read-only). */
  group_name?: string | null;
  parent_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentListParams {
  search?: string;
  status?: string;
  group_id?: string;
  branch_id?: string;
  has_debt?: boolean;
  page?: number;
  page_size?: number;
}
