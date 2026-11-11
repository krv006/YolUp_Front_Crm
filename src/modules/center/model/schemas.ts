import { z } from "zod";

/**
 * Markaz profili formasi. Barcha maydonlar satr sifatida saqlanadi —
 * bo'sh satr "qiymat yo'q" ma'nosini beradi (backend `null` bilan teng).
 */
export const centerSchema = z.object({
  name: z.string().trim().min(1, "Markaz nomi majburiy"),
  legal_name: z.string().trim(),
  phone: z.string().trim(),
  email: z.string().trim().email("Email manzil noto'g'ri").or(z.literal("")),
  address: z.string().trim(),
  work_hours_from: z.string().trim(),
  work_hours_to: z.string().trim(),
  language: z.string().min(1, "Til tanlanishi majburiy"),
  currency: z.string().min(1, "Valyuta tanlanishi majburiy"),
});

export type CenterFormValues = z.infer<typeof centerSchema>;
