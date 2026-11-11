import type {
  CashShift,
  Charge,
  ChargeAccrualValues,
  ChargeListParams,
  DebtListParams,
  DebtRow,
  Expense,
  ExpenseCategory,
  Payment,
  PaymentMethodRecord,
  PnL,
} from "../model/types";
import { cleanParams, ENDPOINTS, http, type ListQueryParams } from "@/shared/api";

export const paymentApi = {
  list: (params: ListQueryParams) =>
    http.list<Payment>(ENDPOINTS.payments.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Payment>(ENDPOINTS.payments.root, values),

  get: (id: string) => http.get<Payment>(ENDPOINTS.payments.byId(id)),

  receipt: (id: string) => http.get<{ receipt_url: string; receipt_number: string }>(ENDPOINTS.payments.receipt(id)),
};

/**
 * Hisob-fakturalar (billing). Oylik hisoblash — `POST /finance/charges/` ga
 * guruh va davr yuboriladi, backend guruhdagi har bir o'quvchi uchun yozuv
 * yaratadi.
 */
export const chargeApi = {
  list: (params: ChargeListParams) =>
    http.list<Charge>(ENDPOINTS.charges.root, cleanParams({ ...params })),

  accrue: (values: ChargeAccrualValues) =>
    http.post<{ created: number; skipped: number; period: string; group_id: string }>(
      ENDPOINTS.charges.root,
      values,
    ),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<Charge>(ENDPOINTS.charges.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.charges.byId(id)),
};

export const debtApi = {
  list: (params: DebtListParams) =>
    http.list<DebtRow>(ENDPOINTS.debts.root, cleanParams({ ...params })),
};

export const paymentMethodApi = {
  list: (params?: Record<string, unknown>) =>
    http.list<PaymentMethodRecord>(ENDPOINTS.paymentMethods.root, params),

  create: (values: Record<string, unknown>) =>
    http.post<PaymentMethodRecord>(ENDPOINTS.paymentMethods.root, values),

  update: (id: string, values: Record<string, unknown>) =>
    http.patch<PaymentMethodRecord>(ENDPOINTS.paymentMethods.byId(id), values),

  remove: (id: string) => http.delete(ENDPOINTS.paymentMethods.byId(id)),
};

export const discountApi = {
  list: (params?: Record<string, unknown>) =>
    http.list(ENDPOINTS.discounts.root, params),

  create: (values: Record<string, unknown>) =>
    http.post(ENDPOINTS.discounts.root, values),
};

export const expenseCategoryApi = {
  list: (params?: Record<string, unknown>) =>
    http.list<ExpenseCategory>(ENDPOINTS.expenseCategories.root, params),

  create: (values: Record<string, unknown>) =>
    http.post<ExpenseCategory>(ENDPOINTS.expenseCategories.root, values),
};

export const expenseApi = {
  list: (params: ListQueryParams) =>
    http.list<Expense>(ENDPOINTS.expenses.root, cleanParams({ ...params })),

  create: (values: Record<string, unknown>) =>
    http.post<Expense>(ENDPOINTS.expenses.root, values),
};

export const cashShiftApi = {
  list: (params?: Record<string, unknown>) =>
    http.list<CashShift>(ENDPOINTS.cashShifts.root, params),

  open: (values: Record<string, unknown>) =>
    http.post<CashShift>(ENDPOINTS.cashShifts.root, values),

  close: (id: string, values: Record<string, unknown>) =>
    http.post(ENDPOINTS.cashShifts.close(id), values),
};

export const pnlApi = {
  get: (params?: Record<string, unknown>) =>
    http.get<PnL>(ENDPOINTS.pnl.root, { params }),
};
