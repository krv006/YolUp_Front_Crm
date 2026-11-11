import { z } from "zod";

import { stripEmpty } from "@/shared/lib/payload";

/**
 * `<select>` gives us `""` for "not chosen", which is neither `null` nor
 * `undefined` — so the enum has to accept it or the form can never be saved.
 * Empty strings are stripped from the payload before the request goes out.
 */
const genderSchema = z
  .union([z.enum(["male", "female", "other"]), z.literal("")])
  .optional()
  .nullable();

export const studentSchema = z.object({
  first_name: z.string().min(1, "Ism majburiy"),
  last_name: z.string().min(1, "Familiya majburiy"),
  middle_name: z.string().optional().nullable(),
  phone: z.string().optional(),
  email: z.union([z.string().email("Email formati noto'g'ri"), z.literal("")]).optional(),
  birth_date: z.string().optional().nullable(),
  gender: genderSchema,
  address: z.string().optional(),
});

export type StudentValues = z.infer<typeof studentSchema>;

/** Drop blank strings so optional fields are omitted rather than sent as "". */
export function studentPayload(values: StudentValues): Record<string, unknown> {
  return stripEmpty(values as Record<string, unknown>);
}
