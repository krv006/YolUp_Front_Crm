import { z } from "zod";

export const payrollAdjustmentSchema = z.object({
  payroll_id: z.string().min(1, "Ish haqi tanlanishi majburiy"),
  type: z.enum(["bonus", "fine", "advance"]),
  amount_tiyin: z.number().min(1, "Summa manfiy bo'lmasligi kerak"),
  reason: z.string().optional(),
});

export type PayrollAdjustmentValues = z.infer<typeof payrollAdjustmentSchema>;
