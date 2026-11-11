import { z } from "zod";

export const scheduleSlotSchema = z.object({
  group_id: z.string().min(1, "Guruh tanlanishi majburiy"),
  room_id: z.string().min(1, "Xona tanlanishi majburiy"),
  day_of_week: z.number().min(1).max(7, "1 dan 7 gacha bo'lishi kerak"),
  start_time: z.string().min(1, "Boshlanish vaqti majburiy"),
  end_time: z.string().min(1, "Tugash vaqti majburiy"),
});

export type ScheduleSlotValues = z.infer<typeof scheduleSlotSchema>;
