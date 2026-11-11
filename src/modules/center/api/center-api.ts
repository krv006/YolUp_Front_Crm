import type { CenterSettings } from "../model/types";
import { cleanParams, ENDPOINTS, http } from "@/shared/api";

export const centerApi = {
  get: () => http.get<CenterSettings>(ENDPOINTS.settings.center),

  update: (values: Record<string, unknown>) =>
    http.patch<CenterSettings>(ENDPOINTS.settings.center, cleanParams(values)),
};
