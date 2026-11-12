import { z } from 'zod';

import { somToTiyin } from '@/shared/lib/payload';

/**
 * Bo'sh maydon `undefined` bo'lishi kerak — `z.coerce.number()` `""` ni 0 ga
 * aylantirib qo'yadi, ya'ni tozalanmagan qiymat saqlanib qolardi.
 */
const optionalInt = (min: number, max: number, minMessage: string) =>
  z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce
      .number({ message: 'Butun son kiriting' })
      .int('Butun son kiriting')
      .min(min, minMessage)
      .max(max, `Ko'pi bilan ${max}`)
      .optional()
  );

/**
 * Narx formada so'mda kiritiladi (foydalanuvchi uchun qulay), API'ga esa
 * tiyinda yuboriladi — konversiyani `coursePayload` bajaradi.
 */
export const courseSchema = z
  .object({
    name: z.string().trim().min(1, 'Nomi majburiy').max(120, 'Nomi juda uzun'),
    code: z
      .string()
      .trim()
      .min(1, 'Kod majburiy')
      .max(30, 'Kod 30 belgidan oshmasin')
      .regex(/^[A-Za-z0-9_.-]+$/, "Kod noto'g'ri"),
    description: z.string().trim().max(500, 'Tavsif 500 belgidan oshmasin').optional(),
    price_som: z.coerce
      .number({ message: 'Narxni kiriting' })
      .min(0, "Narx manfiy bo'lmasin")
      .max(1_000_000_000, 'Narx juda katta'),
    duration_months: optionalInt(1, 60, 'Kamida 1 oy'),
    lessons_count: optionalInt(1, 1000, 'Kamida 1 dars'),
    is_active: z.boolean(),
  })
  .refine(
    (values) =>
      values.duration_months === undefined ||
      values.lessons_count === undefined ||
      values.lessons_count >= values.duration_months,
    {
      message: "Oyiga kamida 1 dars bo'lishi kerak",
      path: ['lessons_count'],
    }
  )
  .superRefine((values, ctx) => {
    if (values.duration_months === undefined)
      ctx.addIssue({ code: 'custom', path: ['duration_months'], message: 'Davomiylik majburiy' });
    if (values.lessons_count === undefined)
      ctx.addIssue({ code: 'custom', path: ['lessons_count'], message: 'Darslar soni majburiy' });
  });

export type CourseValues = z.infer<typeof courseSchema>;

/**
 * Forma qiymatlari → API payload. Tozalangan ixtiyoriy maydonlar `null`
 * yuboriladi (PATCH'da `undefined` eski qiymatni o'chirmaydi).
 */
export function coursePayload(values: CourseValues): Record<string, unknown> {
  const code = values.code?.trim() ?? '';
  const description = values.description?.trim() ?? '';

  return {
    name: values.name.trim(),
    code: code.length > 0 ? code.toUpperCase() : null,
    description: description.length > 0 ? description : null,
    price_tiyin: somToTiyin(values.price_som),
    duration_months: values.duration_months ?? null,
    lessons_count: values.lessons_count ?? null,
    is_active: values.is_active,
  };
}
