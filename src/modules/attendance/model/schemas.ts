import { z } from "zod";

export const attendanceSchema = z.object({
  lesson_id: z.string().min(1, "Dars tanlanishi majburiy"),
  enrollment_id: z.string().min(1, "O'quvchi tanlanishi majburiy"),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "EXCUSED"]),
  note: z.string().optional(),
});

export type AttendanceValues = z.infer<typeof attendanceSchema>;

export const bulkAttendanceSchema = z.object({
  lesson_id: z.string().min(1),
  items: z.array(
    z.object({
      enrollment_id: z.string(),
      status: z.enum(["PRESENT", "LATE", "ABSENT", "EXCUSED"]),
      note: z.string().optional(),
    })
  ),
});

export type BulkAttendanceValues = z.infer<typeof bulkAttendanceSchema>;
