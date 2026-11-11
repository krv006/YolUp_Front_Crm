import { z } from "zod";

import { stripEmpty } from "@/shared/lib/payload";

export const roomSchema = z.object({
  branch_id: z.string().min(1, "Filial tanlanishi majburiy"),
  name: z.string().min(1, "Nomi majburiy"),
  capacity: z.coerce.number({ message: "Sig'imni kiriting" }).min(1, "Kemida 1 bo'lishi kerak"),
  is_active: z.boolean(),
});

export type RoomValues = z.infer<typeof roomSchema>;

export function roomPayload(values: RoomValues): Record<string, unknown> {
  return stripEmpty(values as Record<string, unknown>);
}
