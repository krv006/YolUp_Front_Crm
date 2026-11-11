import { z } from "zod";

import { stripEmpty } from "@/shared/lib/payload";

export const parentSchema = z.object({
  first_name: z.string().min(1, "Ism majburiy"),
  last_name: z.string().min(1, "Familiya majburiy"),
  middle_name: z.string().optional().nullable(),
  phone: z.string().min(1, "Telefon majburiy"),
  email: z.union([z.string().email("Email formati noto'g'ri"), z.literal("")]).optional(),
  relation: z.string().optional(),
});

export type ParentValues = z.infer<typeof parentSchema>;

export function parentPayload(values: ParentValues): Record<string, unknown> {
  return stripEmpty(values as Record<string, unknown>);
}

export const parentStudentLinkSchema = z.object({
  parent_id: z.string().min(1, "Ota-ona tanlanishi majburiy"),
  student_id: z.string().min(1, "O'quvchi tanlanishi majburiy"),
  is_primary: z.boolean().default(false),
});

export type ParentStudentLinkValues = z.infer<typeof parentStudentLinkSchema>;
