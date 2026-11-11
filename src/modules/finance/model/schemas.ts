import { z } from "zod";

import { somToTiyin, stripEmpty } from "@/shared/lib/payload";

/**
 * Summalar formada so'mda kiritiladi, API'ga tiyinda yuboriladi.
 */
export const paymentSchema = z.object({
  student_id: z.string().min(1, "O'quvchi tanlanishi majburiy"),
  group_id: z.string().optional().nullable(),
  amount_som: z.coerce.number({ message: "Summani kiriting" }).min(1, "Summa 0 dan katta bo'lsin"),
  // To'lov turi katalogdan keladi (`/finance/payment-methods/`) — qat'iy enum emas.
  method: z.string().min(1, "To'lov turini tanlang"),
  note: z.string().optional().nullable(),
});

export type PaymentValues = z.infer<typeof paymentSchema>;

export function paymentPayload(values: PaymentValues): Record<string, unknown> {
  const { amount_som, ...rest } = values;
  return {
    ...stripEmpty(rest as Record<string, unknown>),
    amount_tiyin: somToTiyin(amount_som),
    // Ikki marta yuborilishdan himoya — har bir to'lov uchun yangi kalit.
    idempotency_key: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };
}

export const expenseSchema = z.object({
  branch_id: z.string().optional().nullable(),
  category_id: z.string().min(1, "Kategoriya tanlanishi majburiy"),
  amount_som: z.coerce.number({ message: "Summani kiriting" }).min(1, "Summa 0 dan katta bo'lsin"),
  description: z.string().optional(),
  date: z.string().min(1, "Sana majburiy"),
});

export type ExpenseValues = z.infer<typeof expenseSchema>;

export function expensePayload(values: ExpenseValues): Record<string, unknown> {
  const { amount_som, ...rest } = values;
  return { ...stripEmpty(rest as Record<string, unknown>), amount_tiyin: somToTiyin(amount_som) };
}

/**
 * Oylik hisoblash — tanlangan guruh va davr uchun hisob-faktura yaratish.
 * `due_day` — to'lov muddati (oyning kuni); 28 dan oshmasligi kerak, aks holda
 * fevral kabi oylarda sana mavjud bo'lmaydi.
 */
export const chargeAccrualSchema = z.object({
  group_id: z.string().min(1, "Guruh tanlanishi majburiy"),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Davrni tanlang"),
  due_day: z.coerce
    .number()
    .int()
    .min(1, "1 dan 28 gacha bo'lsin")
    .max(28, "1 dan 28 gacha bo'lsin"),
});

export type ChargeAccrualFormValues = z.infer<typeof chargeAccrualSchema>;

/**
 * Hisob-fakturani tahrirlash. Summa va chegirma so'mda kiritiladi
 * (`somToTiyin` orqali API'ga tiyinda yuboriladi).
 */
export const chargeSchema = z.object({
  amount_som: z.coerce.number({ message: "Summani kiriting" }).min(1, "Summa 0 dan katta bo'lsin"),
  discount_som: z.coerce.number().min(0, "Chegirma manfiy bo'lmasin"),
  due_date: z.string().min(1, "To'lov muddati majburiy"),
});

export type ChargeFormValues = z.infer<typeof chargeSchema>;

export function chargePayload(values: ChargeFormValues): Record<string, unknown> {
  return {
    amount_tiyin: somToTiyin(values.amount_som),
    discount_tiyin: somToTiyin(values.discount_som ?? 0),
    due_date: values.due_date,
  };
}

/** To'lov turi katalogi — `/finance/payment-methods/`. */
export const paymentMethodSchema = z.object({
  name: z.string().min(2, "Nom kamida 2 belgidan iborat bo'lsin").max(40, "Juda uzun nom"),
  code: z
    .string()
    .min(2, "Kod majburiy")
    .regex(/^[a-z][a-z0-9_]*$/, "Faqat kichik lotin harflari, raqam va pastki chiziq"),
  kind: z.enum(["cash", "card", "online", "transfer"]),
  is_active: z.boolean().default(true),
});

export type PaymentMethodValues = z.infer<typeof paymentMethodSchema>;

/** Buxgalteriya guruhi — kassa hisobotida shu bo'yicha guruhlanadi. */
export const PAYMENT_METHOD_KIND_OPTIONS = [
  { value: "cash", label: "Naqd" },
  { value: "card", label: "Plastik karta" },
  { value: "online", label: "Onlayn to'lov" },
  { value: "transfer", label: "Bank o'tkazmasi" },
] as const;

export const cashShiftOpenSchema = z.object({
  branch_id: z.string().min(1, "Filial tanlanishi majburiy"),
});

export const cashShiftCloseSchema = z.object({
  actual_amount_tiyin: z.number().min(0),
});
