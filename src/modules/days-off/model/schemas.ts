import { z } from "zod";

export const dayOffSchema = z
  .object({
    name: z.string().trim().min(1, "Sana / tadbir nomi majburiy"),
    date_from: z.string().min(1, "Boshlanish sanasi majburiy"),
    date_to: z.string().min(1, "Tugash sanasi majburiy"),
    /** Bo'sh satr — butun markaz uchun amal qiladi. */
    branch_id: z.string(),
    note: z.string().trim(),
  })
  .refine((values) => values.date_to >= values.date_from, {
    path: ["date_to"],
    message: "Tugash sanasi boshlanishdan oldin bo'lishi mumkin emas",
  });

export type DayOffFormValues = z.infer<typeof dayOffSchema>;
