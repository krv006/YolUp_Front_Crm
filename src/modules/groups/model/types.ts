/**
 * Haftalik jadval sloti.
 *
 * `day_of_week` — JS `Date.getDay()` qiymati: 0 = Yakshanba, 1 = Dushanba …
 * 6 = Shanba. Vaqtlar `HH:MM` ko'rinishida (mahsuliy tizimda `HH:MM:SS`
 * ham qabul qilinadi).
 */
export interface GroupScheduleSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

/**
 * Group (guruh) modeli.
 */
export interface Group {
  id: string;
  tenant_id: string;
  branch_id: string;
  course_id: string;
  name: string;
  color?: string | null;
  price_tiyin: number;
  start_date: string;
  end_date?: string | null;
  status: "planned" | "active" | "completed" | "archived";
  billing_mode: "monthly_calendar" | "monthly_from_enrollment" | "per_lesson";
  created_by?: string | null;
  /** Asosiy o'qituvchi — ro'yxatda filtrlash uchun ham ishlatiladi. */
  teacher_id?: string | null;
  /** Xona — jadval va davomatda ko'rsatiladi. */
  room_id?: string | null;
  /**
   * Haftalik jadval. Yozishda ham, o'qishda ham ishlatiladi; darslar shu
   * asosda generatsiya qilinadi.
   */
  schedule?: GroupScheduleSlot[] | null;
  /** Read-only values the list serializer inlines for the group cards. */
  course_name?: string | null;
  branch_name?: string | null;
  teacher_name?: string | null;
  room_name?: string | null;
  schedule_label?: string | null;
  students_count?: number;
  capacity?: number;
  created_at: string;
  updated_at: string;
}

export interface GroupListParams {
  branch_id?: string;
  course_id?: string;
  teacher_id?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface GroupTeacher {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupTeacherRole;
  /**
   * Haq turi. `percentage` bo'lganda `pay_value_tiyin` — foiz × 100 (bazis
   * punkt), qolgan turlarda tiyin (`per_lesson` — bir dars uchun,
   * `per_student` — bir o'quvchi uchun).
   */
  pay_rule: GroupTeacherPayRule;
  pay_value_tiyin?: number | null;
  /** Read-only — `/groups/{id}/teachers/` javobida keladi. */
  user_name?: string | null;
  user_phone?: string | null;
  created_at: string;
  updated_at?: string;
}

export type GroupTeacherRole = "main" | "assistant" | "co_teacher";
export type GroupTeacherPayRule = "fixed" | "percentage" | "per_lesson" | "per_student";

/**
 * Guruh a'zosi — `/groups/{id}/students/` javobi: a'zolik (`Enrollment`) va
 * o'quvchi ma'lumoti birlashtirilgan holda keladi.
 */
export interface GroupStudent {
  id: string;
  group_id: string;
  student_id: string;
  status: "trial" | "active" | "frozen" | "left" | "completed";
  joined_at: string;
  left_at?: string | null;
  freeze_reason?: string | null;
  left_reason?: string | null;
  student_name?: string | null;
  student_phone?: string | null;
  student_balance_tiyin?: number;
  student_status?: string | null;
  created_at: string;
  updated_at?: string;
}
