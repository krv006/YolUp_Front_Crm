export interface FinanceReport {
  revenue_tiyin: number;
  expenses_tiyin: number;
  net_profit_tiyin: number;
  by_payment_method: Array<{ method: string; amount: number }>;
  by_student: Array<{ student_id: string; student_name: string; amount: number }>;
}

export interface StudentsReport {
  total_students: number;
  active_students: number;
  frozen_students: number;
  left_students: number;
  graduates: number;
  total_debt_tiyin: number;
}

export interface LeadsReport {
  total_leads: number;
  by_stage: Array<{ stage: string; count: number }>;
  by_source: Array<{ source: string; count: number }>;
  conversion_rate: number;
}

export interface AttendanceReport {
  total_lessons: number;
  attendance_rate: number;
  by_group: Array<{ group_id: string; group_name: string; rate: number }>;
}

export interface PayrollReport {
  total_payroll_tiyin: number;
  by_teacher: Array<{ teacher_id: string; teacher_name: string; amount: number }>;
}

export interface ReportParams {
  date_from?: string;
  date_to?: string;
  branch_id?: string;
  page?: number;
  page_size?: number;
}
