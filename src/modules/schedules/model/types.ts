/**
 * ScheduleSlot (jadval sloti) modeli.
 */
export interface ScheduleSlot {
  id: string;
  group_id: string;
  room_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface ScheduleSlotListParams {
  group_id?: string;
  room_id?: string;
  day_of_week?: number;
  page?: number;
  page_size?: number;
}
