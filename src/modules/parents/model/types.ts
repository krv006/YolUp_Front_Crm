/**
 * Parent (ota-ona) modeli.
 */
export interface Parent {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone: string;
  email?: string | null;
  relation?: string | null;
  /** Read-only values the list serializer inlines for the table. */
  student_name?: string | null;
  students_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ParentListParams {
  search?: string;
  page?: number;
  page_size?: number;
}

export interface ParentStudentLink {
  id: string;
  parent_id: string;
  student_id: string;
  is_primary: boolean;
  created_at: string;
}
