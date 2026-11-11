import { z } from "zod";

import { stripEmpty } from "@/shared/lib/payload";

export const branchSchema = z.object({
  name: z.string().min(1, "Nomi majburiy"),
  code: z.string().min(1, "Kod majburiy"),
  address: z.string().optional(),
  phone: z.string().optional(),
  is_active: z.boolean(),
});

export type BranchValues = z.infer<typeof branchSchema>;

export function branchPayload(values: BranchValues): Record<string, unknown> {
  return stripEmpty(values as Record<string, unknown>);
}
