import { z } from "zod";

import { stripEmpty } from "@/shared/lib/payload";

export const leadSchema = z.object({
  branch_id: z.string().optional().nullable(),
  source_id: z.string().optional().nullable(),
  school_id: z.string().optional().nullable(),
  first_name: z.string().min(1, "Ism majburiy"),
  last_name: z.string().min(1, "Familiya majburiy"),
  phone: z.string().min(1, "Telefon majburiy"),
  extra_phones: z.array(z.string()).optional(),
  birth_date: z.string().optional().nullable(),
  age: z.number().optional().nullable(),
  teacher_id: z.string().optional().nullable(),
  lesson_time: z.string().optional().nullable(),
  lesson_day_type: z.enum(["odd", "even", "any"]).optional().nullable(),
  status: z.enum(["new", "contacted", "enrolled", "lost"]).optional(),
  /* Kanban bosqichi — tizim kalitlari yoki foydalanuvchi qo'shgan ustun id'si. */
  stage: z.string().optional(),
  temperature: z.enum(["cold", "warm", "hot"]).optional().nullable(),
  body: z.string().optional(),
  loss_reason_id: z.string().optional().nullable(),
});

export type LeadValues = z.infer<typeof leadSchema>;

export function leadPayload(values: LeadValues): Record<string, unknown> {
  const { status: _status, ...editable } = values;
  return stripEmpty(editable as Record<string, unknown>);
}
