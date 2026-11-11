import { z } from "zod";

export const enrollmentSchema = z.object({
  student_id: z.string().min(1, "O'quvchi tanlanishi majburiy"),
  group_id: z.string().min(1, "Guruh tanlanishi majburiy"),
  status: z.enum(["trial", "active", "frozen", "left", "completed"]).default("trial"),
});

export type EnrollmentValues = z.infer<typeof enrollmentSchema>;
