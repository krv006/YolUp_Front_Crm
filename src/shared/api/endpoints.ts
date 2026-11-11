/**
 * Backend manzillari — Django `docs/BACKEND_API_SPEC.md` dagi ro'yxat bilan bir xil.
 * MUHIM: har bir manzil oxirida `/` bilan tugaydi (APPEND_SLASH).
 * Hujjatda yo'q narsa qo'shilmaydi.
 */
export const ENDPOINTS = {
  // Auth
  auth: {
    login: "/auth/login/",
    refresh: "/auth/refresh/",
    logout: "/auth/logout/",
    me: "/auth/me/",
    passwordResetRequest: "/auth/password-reset/request/",
    passwordResetConfirm: "/auth/password-reset/confirm/",
    passwordOverride: "/auth/password/override/",
  },

  // C-Panel: Tenants
  tenants: {
    root: "/tenants/",
    byId: (id: string) => `/tenants/${id}/`,
    block: (id: string) => `/tenants/${id}/block/`,
    unblock: (id: string) => `/tenants/${id}/unblock/`,
    subscription: (id: string) => `/tenants/${id}/subscription/`,
  },

  // Branches
  branches: {
    root: "/branches/",
    byId: (id: string) => `/branches/${id}/`,
  },

  // Rooms
  rooms: {
    root: "/rooms/",
    byId: (id: string) => `/rooms/${id}/`,
  },

  // Users (staff)
  users: {
    root: "/users/",
    byId: (id: string) => `/users/${id}/`,
  },

  // Students
  students: {
    root: "/students/",
    byId: (id: string) => `/students/${id}/`,
  },

  // Parents
  parents: {
    root: "/parents/",
    byId: (id: string) => `/parents/${id}/`,
  },
  parentStudentLinks: {
    root: "/parent-student-links/",
    byId: (id: string) => `/parent-student-links/${id}/`,
  },

  // Courses
  courses: {
    root: "/courses/",
    byId: (id: string) => `/courses/${id}/`,
  },

  // Groups
  groups: {
    root: "/groups/",
    byId: (id: string) => `/groups/${id}/`,
    teachers: (id: string) => `/groups/${id}/teachers/`,
    teacherById: (id: string, teacherId: string) => `/groups/${id}/teachers/${teacherId}/`,
    schedule: (id: string) => `/groups/${id}/schedule/`,
    students: (id: string) => `/groups/${id}/students/`,
    enroll: (id: string) => `/groups/${id}/enroll/`,
  },

  // Schedule slots
  scheduleSlots: {
    root: "/schedule-slots/",
    byId: (id: string) => `/schedule-slots/${id}/`,
  },

  // Dam olish kunlari — markaz/filial taqvimi
  daysOff: {
    root: "/days-off/",
    byId: (id: string) => `/days-off/${id}/`,
  },

  // Lessons
  lessons: {
    root: "/lessons/",
    byId: (id: string) => `/lessons/${id}/`,
    attendance: (id: string) => `/lessons/${id}/attendance/`,
  },

  // Enrollments
  enrollments: {
    root: "/enrollments/",
    byId: (id: string) => `/enrollments/${id}/`,
  },

  // Attendance
  attendance: {
    root: "/attendance/",
    bulk: "/attendance/bulk/",
    byId: (id: string) => `/attendance/${id}/`,
  },

  // Assessments / Scores
  assessments: {
    root: "/assessments/",
    byId: (id: string) => `/assessments/${id}/`,
  },
  scores: {
    root: "/scores/",
    byId: (id: string) => `/scores/${id}/`,
  },

  // Leads
  leads: {
    root: "/leads/",
    byId: (id: string) => `/leads/${id}/`,
    convert: (id: string) => `/leads/${id}/convert/`,
  },
  leadSources: {
    root: "/lead-sources/",
    byId: (id: string) => `/lead-sources/${id}/`,
  },
  leadStages: {
    root: "/lead-stages/",
    byId: (id: string) => `/lead-stages/${id}/`,
  },
  // Maktablar katalogi — lid manbalarini guruhlash uchun
  schools: {
    root: "/schools/",
    byId: (id: string) => `/schools/${id}/`,
  },
  leadLossReasons: {
    root: "/lead-loss-reasons/",
    byId: (id: string) => `/lead-loss-reasons/${id}/`,
  },
  leadForms: {
    root: "/lead-forms/",
    byId: (id: string) => `/lead-forms/${id}/`,
  },

  // Finance
  ledger: {
    root: "/finance/ledger/",
    byId: (id: string) => `/finance/ledger/${id}/`,
  },
  payments: {
    root: "/finance/payments/",
    byId: (id: string) => `/finance/payments/${id}/`,
    receipt: (id: string) => `/finance/payments/${id}/receipt/`,
  },
  charges: {
    root: "/finance/charges/",
    byId: (id: string) => `/finance/charges/${id}/`,
  },
  debts: {
    root: "/finance/debts/",
  },
  paymentMethods: {
    root: "/finance/payment-methods/",
    byId: (id: string) => `/finance/payment-methods/${id}/`,
  },
  discounts: {
    root: "/finance/discounts/",
    byId: (id: string) => `/finance/discounts/${id}/`,
  },
  refunds: {
    root: "/finance/refunds/",
    byId: (id: string) => `/finance/refunds/${id}/`,
  },
  expenses: {
    root: "/finance/expenses/",
    byId: (id: string) => `/finance/expenses/${id}/`,
  },
  expenseCategories: {
    root: "/finance/expense-categories/",
    byId: (id: string) => `/finance/expense-categories/${id}/`,
  },
  cashShifts: {
    root: "/finance/cash-shifts/",
    byId: (id: string) => `/finance/cash-shifts/${id}/`,
    close: (id: string) => `/finance/cash-shifts/${id}/close/`,
  },
  pnl: {
    root: "/finance/pnl/",
  },

  // Payroll
  payrolls: {
    root: "/payroll/",
    byId: (id: string) => `/payroll/${id}/`,
  },
  payrollAdjustments: {
    root: "/payroll/adjustments/",
    byId: (id: string) => `/payroll/adjustments/${id}/`,
  },

  // Messaging
  messageTemplates: {
    root: "/messaging/templates/",
    byId: (id: string) => `/messaging/templates/${id}/`,
  },
  automationRules: {
    root: "/messaging/automation-rules/",
    byId: (id: string) => `/messaging/automation-rules/${id}/`,
  },
  messageLogs: {
    root: "/messaging/logs/",
    byId: (id: string) => `/messaging/logs/${id}/`,
  },
  smsSend: {
    root: "/messaging/sms/send/",
  },

  // Reports
  reports: {
    finance: "/reports/finance/",
    students: "/reports/students/",
    leads: "/reports/leads/",
    attendance: "/reports/attendance/",
    payroll: "/reports/payroll/",
  },

  // Settings / RBAC
  settings: {
    /** Markaz (tenant) o'z profili — bitta yozuv, `PATCH` bilan yangilanadi. */
    center: "/settings/center/",
  },
  roles: {
    root: "/settings/roles/",
    byId: (id: string) => `/settings/roles/${id}/`,
  },
  permissions: {
    root: "/settings/permissions/",
    byId: (id: string) => `/settings/permissions/${id}/`,
  },
  auditLogs: {
    root: "/audit-logs/",
    byId: (id: string) => `/audit-logs/${id}/`,
  },
  approvalRequests: {
    root: "/approval-requests/",
    byId: (id: string) => `/approval-requests/${id}/`,
    decide: (id: string) => `/approval-requests/${id}/decide/`,
  },

  // Health
  health: {
    root: "/health/",
  },

  // Dashboard (CEO overview)
  dashboard: {
    overview: "/dashboard/overview/",
  },
} as const;
