/**
 * Attendance (davomat) modeli.
 */
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export interface Attendance {
  id: string;
  lesson_id: string;
  enrollment_id: string;
  /** O'quvchi — kabinetda va hisobotlarda to'g'ridan-to'g'ri filtrlanadi. */
  student_id?: string | null;
  status: AttendanceStatus;
  marked_by?: string | null;
  note?: string | null;
  /** Read-only values the list serializer inlines for the table. */
  student_name?: string | null;
  group_name?: string | null;
  lesson_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BulkAttendanceItem {
  enrollment_id: string;
  status: AttendanceStatus;
  note?: string | null;
}

export interface BulkAttendanceRequest {
  lesson_id: string;
  items: BulkAttendanceItem[];
}

export interface BulkAttendanceResult {
  lesson_id: string;
  saved: number;
}

/**
 * Bir darsdagi davomat ro'yxati qatori — guruhning o'sha darsdagi a'zolari.
 * Hali belgilanmagan o'quvchi uchun `status` `null` bo'ladi.
 */
export interface LessonRosterRow {
  enrollment_id: string;
  student_id: string;
  student_name: string;
  status: AttendanceStatus | null;
  note: string | null;
}

export interface AttendanceListParams {
  lesson_id?: string;
  enrollment_id?: string;
  student_id?: string;
  date_from?: string;
  date_to?: string;
  status?: AttendanceStatus;
  page?: number;
  page_size?: number;
}
