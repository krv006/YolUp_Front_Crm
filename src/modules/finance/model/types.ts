/**
 * Finance modellar — to'lov, xarajat, kassa, P&L.
 */
export type PaymentMethod = 'cash' | 'card' | 'click' | 'payme' | 'uzum' | 'transfer';
/** Buxgalteriya guruhi — kassa hisobotlari shu bo'yicha yig'iladi. */
export type PaymentMethodKind = 'cash' | 'card' | 'online' | 'transfer';
export type ChargeStatus = 'paid' | 'partial' | 'unpaid';

/** `/finance/payment-methods/` — to'lov turlari katalogi. */
export interface PaymentMethodRecord {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  kind: PaymentMethodKind;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodListParams {
  search?: string;
  is_active?: string;
  kind?: string;
  page?: number;
  page_size?: number;
}

export interface Payment {
  id: string;
  tenant_id: string;
  student_id: string;
  group_id?: string | null;
  amount_tiyin: number;
  /** To'lov turi kodi — `/finance/payment-methods/` katalogidan. */
  method: string;
  receipt_url?: string | null;
  receipt_number?: string | null;
  receipt_no?: string | null;
  paid_at: string;
  created_by?: string | null;
  idempotency_key?: string;
  /** Erkin izoh (masalan, qaysi oy uchun to'lov). */
  note?: string | null;
  /** Read-only values the list serializer inlines for the table. */
  student_name?: string | null;
  group_name?: string | null;
  created_at: string;
}

/**
 * Hisob-faktura (billing) — o'quvchi uchun davr bo'yicha to'lov.
 *
 * `paid_tiyin` serverda real to'lovlardan yig'iladi; `total_tiyin`, `debt_tiyin`,
 * `status` va `is_overdue` — ro'yxat serializerida hisoblanadigan qiymatlar.
 */
export interface Charge {
  id: string;
  tenant_id: string;
  branch_id?: string | null;
  student_id: string;
  group_id?: string | null;
  /** `YYYY-MM` */
  period: string;
  amount_tiyin: number;
  discount_tiyin: number;
  paid_tiyin: number;
  due_date: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string | null;
  group_name?: string | null;
  total_tiyin?: number;
  debt_tiyin?: number;
  status?: ChargeStatus;
  is_overdue?: boolean;
}

export interface ChargeListParams {
  student_id?: string;
  group_id?: string;
  period?: string;
  status?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/** `/finance/debts/` — o'quvchi kesimidagi qarz holati. */
export interface DebtRow {
  student_id: string;
  student_name: string;
  phone?: string | null;
  student_status?: string;
  branch_id?: string | null;
  branch_name?: string | null;
  group_names?: string | null;
  charged_tiyin: number;
  paid_tiyin: number;
  debt_tiyin: number;
  advance_tiyin: number;
  overdue_tiyin: number;
  last_payment_at?: string | null;
  oldest_due_date?: string | null;
}

export interface DebtListParams {
  search?: string;
  branch_id?: string;
  only_debt?: string;
  overdue?: string;
  page?: number;
  page_size?: number;
}

export interface ChargeAccrualValues {
  group_id: string;
  period: string;
  due_day?: number;
}

export interface Discount {
  id: string;
  tenant_id: string;
  student_id: string;
  group_id?: string | null;
  type: 'percent' | 'fixed';
  value_tiyin?: number | null;
  value_percent?: number | null;
  valid_from: string;
  valid_until?: string | null;
  is_active: boolean;
}

export interface ExpenseCategory {
  id: string;
  tenant_id: string;
  name: string;
  is_active: boolean;
}

export interface Expense {
  id: string;
  tenant_id: string;
  branch_id?: string | null;
  category_id: string;
  amount_tiyin: number;
  description?: string | null;
  date: string;
  created_by?: string | null;
  /** Read-only value the list serializer inlines for the table. */
  category_name?: string | null;
  created_at: string;
}

export interface CashShift {
  id: string;
  tenant_id: string;
  branch_id: string;
  cashier_id: string;
  opened_at: string;
  closed_at?: string | null;
  expected_amount_tiyin?: number | null;
  actual_amount_tiyin?: number | null;
  status: 'open' | 'closed';
}

export interface PnL {
  revenue_tiyin: number;
  expenses_tiyin: number;
  net_profit_tiyin: number;
  by_payment_method: Array<{ method: string; amount: number }>;
  by_student: Array<{ student_id: string; student_name: string; amount: number }>;
}

export interface PaymentListParams {
  student_id?: string;
  group_id?: string;
  method?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface ExpenseListParams {
  branch_id?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}
