/**
 * Payroll (ish haqi) modellar.
 */
export type PayrollState = "DRAFT" | "LOCKED" | "PAID";

export interface Payroll {
  id: string;
  tenant_id: string;
  user_id: string;
  month: string;
  base_amount_tiyin: number;
  adjustments_tiyin: number;
  final_amount_tiyin: number;
  state: PayrollState;
  /** Read-only values the list serializer inlines for the table. */
  user_name?: string | null;
  role?: string | null;
  created_at: string;
  locked_at?: string | null;
  paid_at?: string | null;
}

export interface PayrollAdjustment {
  id: string;
  payroll_id: string;
  type: "bonus" | "fine" | "advance";
  amount_tiyin: number;
  reason?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface PayrollListParams {
  user_id?: string;
  month?: string;
  state?: PayrollState;
  page?: number;
  page_size?: number;
}

export interface PayrollAdjustmentCreateValues {
  payroll_id: string;
  type: "bonus" | "fine" | "advance";
  amount_tiyin: number;
  reason?: string;
}
