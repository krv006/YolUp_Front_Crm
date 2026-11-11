/**
 * Enrollment (o'quvchi x Grove a'zoligi) modeli.
 */
export interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
  status: "trial" | "active" | "frozen" | "left" | "completed";
  joined_at: string;
  left_at?: string | null;
  freeze_reason?: string | null;
  left_reason?: string | null;
  /** Ro'yxat serializeri inline qo'shadigan nomlar. */
  group_name?: string | null;
  teacher_name?: string | null;
  schedule_label?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentListParams {
  student_id?: string;
  group_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}
