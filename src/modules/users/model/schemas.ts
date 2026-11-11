import { z } from "zod";

export const userSchema = z.object({
  branch_id: z.string().optional().nullable(),
  role: z.string().min(1, "Rol tanlanishi majburiy"),
  first_name: z.string().min(1, "Ism majburiy"),
  last_name: z.string().min(1, "Familiya majburiy"),
  middle_name: z.string().optional().nullable(),
  phone: z.string().min(1, "Telefon majburiy"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(8, "Parol kamida 8 belgi bo'lishi kerak").optional().or(z.literal("")),
});

export type UserValues = z.infer<typeof userSchema>;
