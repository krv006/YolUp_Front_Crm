/**
 * Lesson (dars) modeli.
 */
export interface Lesson {
  id: string;
  group_id: string;
  room_id?: string | null;
  title?: string | null;
  starts_at: string;
  ends_at: string;
  topic?: string | null;
  status: "scheduled" | "held" | "cancelled" | "rescheduled";
  created_at: string;
  updated_at: string;
  /** Ro'yxat serializeri ichida qo'shib beradigan maydonlar. */
  lesson_date?: string | null;
  group_name?: string | null;
  room_name?: string | null;
  teacher_name?: string | null;
  students_count?: number;
  marked_count?: number;
  present_count?: number;
  is_marked?: boolean;
  attendance_rate?: number;
}

export interface LessonListParams {
  group_id?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  page?: number;
  page_size?: number;
}
