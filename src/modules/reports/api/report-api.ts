import type { FinanceReport, StudentsReport, LeadsReport, AttendanceReport, PayrollReport } from "./report-types";
import { ENDPOINTS, http } from "@/shared/api";

export const reportApi = {
  finance: (params?: Record<string, unknown>) =>
    http.get<FinanceReport>(ENDPOINTS.reports.finance, { params }),

  students: (params?: Record<string, unknown>) =>
    http.get<StudentsReport>(ENDPOINTS.reports.students, { params }),

  leads: (params?: Record<string, unknown>) =>
    http.get<LeadsReport>(ENDPOINTS.reports.leads, { params }),

  attendance: (params?: Record<string, unknown>) =>
    http.get<AttendanceReport>(ENDPOINTS.reports.attendance, { params }),

  payroll: (params?: Record<string, unknown>) =>
    http.get<PayrollReport>(ENDPOINTS.reports.payroll, { params }),
};
