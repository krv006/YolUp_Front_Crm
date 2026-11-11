import { z } from "zod";

import { stripEmpty } from "@/shared/lib/payload";

export const tenantSchema = z.object({
  name: z.string().min(1, "Nomi majburiy"),
  slug: z
    .string()
    .min(1, "Slug majburiy")
    .regex(/^[a-z0-9-]+$/, "Faqat kichik harf, raqam va tire"),
  phone: z.string().optional(),
  email: z.union([z.string().email("Email formati noto'g'ri"), z.literal("")]).optional(),
  address: z.string().optional(),
  currency: z.string().min(1),
  subscription_tier: z.enum(["basic", "standard", "professional", "enterprise"]),
  max_students: z.coerce.number().min(0).optional().nullable(),
});

export type TenantValues = z.infer<typeof tenantSchema>;

export function tenantPayload(values: TenantValues): Record<string, unknown> {
  return stripEmpty(values as Record<string, unknown>);
}
