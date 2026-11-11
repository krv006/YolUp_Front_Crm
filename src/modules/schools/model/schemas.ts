import { z } from "zod";

/**
 * Bo'sh maydon `undefined` bo'lishi kerak — `z.coerce.number()` `""` ni 0 ga
 * aylantirib qo'yadi, ya'ni tozalanmagan qiymat saqlanib qolardi.
 */
const optionalInt = (max: number, message: string) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number({ message: "Butun son kiriting" })
      .int("Butun son kiriting")
      .min(0, message)
      .max(max, `Ko'pi bilan ${max}`)
      .optional(),
  );

/** Ixtiyoriy matn — faqat uzunlik tekshiriladi, majburiylik yo'q. */
const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} juda uzun`).optional();

export const schoolSchema = z.object({
  name: z.string().trim().min(1, "Nomi majburiy").max(120, "Nomi juda uzun"),
  type: z.enum(["public", "private", "lyceum", "kindergarten", "university", "other"]),
  district: optionalText(80, "Tuman nomi"),
  address: optionalText(160, "Manzil"),
  contact_person: optionalText(80, "Mas'ul shaxs ismi"),
  phone: optionalText(40, "Telefon raqami"),
  student_capacity: optionalInt(100000, "O'quvchilar soni manfiy bo'lmasin"),
  partner_since: z.string().optional().nullable(),
  is_active: z.boolean(),
  notes: optionalText(500, "Izoh"),
});

export type SchoolValues = z.infer<typeof schoolSchema>;

function text(value?: string | null): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Forma qiymatlari → API payload. Bo'sh maydon `null` bo'lib ketadi —
 * PATCH'da `undefined` eski qiymatni o'chirmaydi, ya'ni foydalanuvchi
 * maydonni tozalay olmay qolardi.
 */
export function schoolPayload(values: SchoolValues): Record<string, unknown> {
  return {
    name: values.name.trim(),
    type: values.type,
    district: text(values.district),
    address: text(values.address),
    contact_person: text(values.contact_person),
    phone: text(values.phone),
    student_capacity: values.student_capacity ?? null,
    partner_since: text(values.partner_since),
    is_active: values.is_active,
    notes: text(values.notes),
  };
}
