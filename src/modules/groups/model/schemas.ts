import { z } from "zod";

import { formatMoney, tiyinToSom } from "@/shared/lib";
import { somToTiyin, stripEmpty } from "@/shared/lib/payload";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const groupScheduleSlotSchema = z.object({
  day_of_week: z.coerce
    .number({ message: "Kun noto'g'ri" })
    .int()
    .min(0, "Kun noto'g'ri")
    .max(6, "Kun noto'g'ri"),
  start_time: z.string().regex(TIME_PATTERN, "Boshlanish vaqti HH:MM ko'rinishida"),
  end_time: z.string().regex(TIME_PATTERN, "Tugash vaqti HH:MM ko'rinishida"),
});

export type GroupScheduleSlotValues = z.infer<typeof groupScheduleSlotSchema>;

/**
 * Narx formada so'mda kiritiladi (foydalanuvchi uchun qulay), API'ga esa
 * tiyinda yuboriladi — `groupPayload` konversiya qiladi.
 */
export const groupSchema = z
  .object({
    branch_id: z.string().min(1, "Filial tanlanishi majburiy"),
    course_id: z.string().min(1, "Kurs tanlanishi majburiy"),
    name: z.string().min(1, "Nomi majburiy"),
    color: z.string().optional(),
    room_id: z.string().optional().nullable(),
    capacity: z.coerce
      .number({ message: "Sig'imni kiriting" })
      .int("Sig'im butun son bo'lsin")
      .min(0, "Sig'im manfiy bo'lmasin")
      .max(1000, "Sig'im 1000 dan oshmasin")
      .optional(),
    price_som: z.coerce.number({ message: "Narxni kiriting" }).min(0, "Narx manfiy bo'lmasin"),
    start_date: z.string().min(1, "Boshlanish sanasi majburiy"),
    end_date: z.string().optional().nullable(),
    billing_mode: z.enum(["monthly_calendar", "monthly_from_enrollment", "per_lesson"]),
    status: z.enum(["planned", "active", "completed", "archived"]),
    /** Haftalik jadval — darslar shu slotlardan generatsiya qilinadi. */
    schedule: z.array(groupScheduleSlotSchema).default([]),
  })
  .superRefine((values, ctx) => {
    if (values.end_date && values.end_date < values.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "Tugash sanasi boshlanish sanasidan oldin bo'lmasin",
      });
    }

    if (values.status === "active" && values.schedule.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["schedule"],
        message: "Faol guruh uchun kamida bitta dars kuni tanlanishi kerak",
      });
    }

    values.schedule.forEach((slot, index) => {
      if (slot.end_time <= slot.start_time) {
        ctx.addIssue({
          code: "custom",
          path: ["schedule", index, "end_time"],
          message: "Tugash vaqti boshlanishdan keyin bo'lsin",
        });
      }
    });
  });

export type GroupValues = z.infer<typeof groupSchema>;

export function groupPayload(values: GroupValues): Record<string, unknown> {
  const { price_som, room_id, end_date, ...rest } = values;
  return {
    ...stripEmpty(rest as Record<string, unknown>),
    price_tiyin: somToTiyin(price_som),
    /* Bo'sh qiymatlar `null` bo'lib ketadi — xona/sana tozalanishi uchun. */
    room_id: room_id || null,
    end_date: end_date || null,
  };
}

/* -------------------------------------------------------------------------- */
/*  Guruh o'qituvchisi                                                         */
/* -------------------------------------------------------------------------- */

/**
 * `pay_value` formada foydalanuvchi tilida kiritiladi: `percentage` uchun foiz
 * (0–100), qolgan turlarda so'm. `groupTeacherPayload` uni API formatiga
 * o'giradi.
 */
export const groupTeacherSchema = z
  .object({
    user_id: z.string().min(1, "O'qituvchi tanlanishi majburiy"),
    role: z.enum(["main", "assistant", "co_teacher"]),
    pay_rule: z.enum(["fixed", "percentage", "per_lesson", "per_student"]),
    pay_value: z.coerce.number({ message: "Qiymatni kiriting" }).min(0, "Manfiy bo'lmasin"),
  })
  .refine((values) => values.pay_rule !== "percentage" || values.pay_value <= 100, {
    path: ["pay_value"],
    message: "Foiz 100 dan oshmasin",
  });

export type GroupTeacherValues = z.infer<typeof groupTeacherSchema>;

/** `percentage` → foiz × 100 (bazis punkt); qolgan turlar → so'm → tiyin. */
export function groupTeacherPayload(values: GroupTeacherValues): Record<string, unknown> {
  const { pay_value, ...rest } = values;
  return {
    ...rest,
    pay_value_tiyin:
      values.pay_rule === "percentage" ? Math.round(pay_value * 100) : somToTiyin(pay_value),
  };
}

/** `pay_value_tiyin` ni foydalanuvchi kiritadigan qiymatga qaytaradi (formani to'ldirish uchun). */
export function payValueToInput(rule: string, value?: number | null): number {
  const raw = Number(value ?? 0);
  return rule === "percentage" ? raw / 100 : tiyinToSom(raw);
}

/** `pay_value_tiyin` ni o'qiladigan matnga aylantiradi. */
export function teacherPayLabel(rule: string, value?: number | null): string {
  const raw = Number(value ?? 0);
  if (rule === "percentage") return `${raw / 100}%`;
  return rule === "fixed" ? formatMoney(raw) : `${formatMoney(raw)} / ${rule === "per_lesson" ? "dars" : "o'quvchi"}`;
}
