import { z } from "zod";

export const assessmentSchema = z.object({
  group_id: z.string().min(1, "Guruh tanlanishi majburiy"),
  title: z.string().min(1, "Sarlavha majburiy"),
  type: z.enum(["daily", "exam", "quiz", "homework"]),
  max_score: z.number().min(1),
  date: z.string().min(1, "Sana majburiy"),
  schema: z.string().optional(),
});

export type AssessmentValues = z.infer<typeof assessmentSchema>;

export const scoreSchema = z.object({
  assessment_id: z.string().min(1, "Baholash tanlanishi majburiy"),
  enrollment_id: z.string().min(1, "O'quvchi tanlanishi majburiy"),
  score: z.number().min(0),
  comment: z.string().optional(),
});

export type ScoreValues = z.infer<typeof scoreSchema>;
