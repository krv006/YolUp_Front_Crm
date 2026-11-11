import { z } from "zod";

export const lessonSchema = z.object({
  group_id: z.string().min(1, "Guruh tanlanishi majburiy"),
  room_id: z.string().optional().nullable(),
  title: z.string().optional(),
  starts_at: z.string().min(1, "Boshlanish vaqti majburiy"),
  ends_at: z.string().min(1, "Tugash vaqti majburiy"),
  topic: z.string().optional(),
});

export type LessonValues = z.infer<typeof lessonSchema>;
