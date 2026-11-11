import type { Payroll, PayrollAdjustment } from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const payrollApi = {
  list: (params: ListQueryParams) =>
    http.list<Payroll>(ENDPOINTS.payrolls.root, cleanParams({ ...params })),

  get: (id: string) => http.get<Payroll>(ENDPOINTS.payrolls.byId(id)),

  lock: (id: string) => http.post(ENDPOINTS.payrolls.byId(id) + "lock/", {}),

  pay: (id: string) => http.post(ENDPOINTS.payrolls.byId(id) + "pay/", {}),
};

export const payrollAdjustmentApi = {
  list: (params?: Record<string, unknown>) =>
    http.list<PayrollAdjustment>(ENDPOINTS.payrollAdjustments.root, params),

  create: (values: Record<string, unknown>) =>
    http.post<PayrollAdjustment>(ENDPOINTS.payrollAdjustments.root, values),
};
