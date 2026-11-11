import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Telefon yoki email kiriting"),
  password: z.string().min(1, "Parolni kiriting"),
});

export type LoginValues = z.infer<typeof loginSchema>;
