import { useQuery } from "@tanstack/react-query";

import { reportApi } from "./report-api";

export const reportKeys = {
  all: ["reports"] as const,
  finance: (params: Record<string, unknown>) => [...reportKeys.all, "finance", params] as const,
  students: (params: Record<string, unknown>) => [...reportKeys.all, "students", params] as const,
  leads: (params: Record<string, unknown>) => [...reportKeys.all, "leads", params] as const,
  attendance: (params: Record<string, unknown>) => [...reportKeys.all, "attendance", params] as const,
  payroll: (params: Record<string, unknown>) => [...reportKeys.all, "payroll", params] as const,
};

export function useFinanceReport(params: Record<string, unknown>) {
  return useQuery({
    queryKey: reportKeys.finance(params),
    queryFn: () => reportApi.finance(params),
  });
}

export function useStudentsReport(params: Record<string, unknown>) {
  return useQuery({
    queryKey: reportKeys.students(params),
    queryFn: () => reportApi.students(params),
  });
}

export function useLeadsReport(params: Record<string, unknown>) {
  return useQuery({
    queryKey: reportKeys.leads(params),
    queryFn: () => reportApi.leads(params),
  });
}

export function useAttendanceReport(params: Record<string, unknown>) {
  return useQuery({
    queryKey: reportKeys.attendance(params),
    queryFn: () => reportApi.attendance(params),
  });
}

export function usePayrollReport(params: Record<string, unknown>) {
  return useQuery({
    queryKey: reportKeys.payroll(params),
    queryFn: () => reportApi.payroll(params),
  });
}
