/**
 * Room (xona) modeli.
 */
export interface Room {
  id: string;
  tenant_id: string;
  branch_id: string;
  name: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomListParams {
  branch_id?: string;
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}
