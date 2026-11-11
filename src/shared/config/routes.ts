/**
 * Ilovaning barcha marshrutlari faqat shu yerda yoziladi.
 * Menyu, breadcrumb va <Link> lar shu obyektdan oziqlanadi.
 */
export const ROUTES = {
  // Auth (ochiq)
  login: "/login",

  // Boshqaruv (admin/ceo)
  dashboard: "/",
  tenants: "/tenants",
  tenantDetail: "/tenants/:id",
  branches: "/branches",
  branchDetail: "/branches/:id",
  rooms: "/rooms",
  roomDetail: "/rooms/:id",

  // Foydalanuvchilar va o'quvchilar
  users: "/settings/users",
  students: "/students",
  studentDetail: "/students/:id",
  parents: "/parents",
  parentDetail: "/parents/:id",

  // Guruh va dars
  courses: "/courses",
  courseDetail: "/courses/:id",
  schools: "/schools",
  daysOff: "/settings/days-off",
  groups: "/groups",
  groupDetail: "/groups/:id",
  schedules: "/groups/:id/schedule",
  lessons: "/lessons",
  lessonDetail: "/lessons/:id",
  enrollments: "/enrollments",

  // Davomat va baho
  attendance: "/attendance",
  assessments: "/assessments",
  scores: "/scores",

  // Moliya
  finance: "/finance",
  payments: "/finance/payments",
  paymentDetail: "/finance/payments/:id",
  paymentReceipt: "/finance/payments/:id/receipt",
  charges: "/finance/charges",
  debts: "/finance/debts",
  discounts: "/finance/discounts",
  refunds: "/finance/refunds",
  expenses: "/finance/expenses",
  expenseCategories: "/finance/expense-categories",
  cash: "/finance/cash",
  cashShifts: "/finance/cash-shifts",
  pnl: "/finance/pnl",

  // Ish haqi
  payroll: "/payroll",
  payrollDetail: "/payroll/:id",
  payrollAdjustments: "/payroll/adjustments",

  // Lidlar (CRM)
  leads: "/leads",
  leadDetail: "/leads/:id",
  leadSources: "/lead-sources",
  leadLossReasons: "/lead-loss-reasons",
  leadConvert: "/leads/:id/convert",
  leadForms: "/lead-forms",

  // Xabarlar
  messageTemplates: "/messaging/templates",
  automationRules: "/messaging/automation-rules",
  messageLogs: "/messaging/logs",
  smsSend: "/messaging/sms/send",

  // Hisobotlar
  reportsFinance: "/reports/finance",
  reportsStudents: "/reports/students",
  reportsLeads: "/reports/leads",
  reportsAttendance: "/reports/attendance",
  reportsPayroll: "/reports/payroll",

  // Sozlamalar / xavfsizlik
  roles: "/settings/roles",
  permissions: "/settings/permissions",
  auditLogs: "/audit-logs",
  approvalRequests: "/approval-requests",

  // Boshqa
  notFound: "*",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** `/tenants/7` → `/tenants/7` */
export const to = {
  tenant: (id: string | number) => `/tenants/${id}`,
  branch: (id: string | number) => `/branches/${id}`,
  room: (id: string | number) => `/rooms/${id}`,
  student: (id: string | number) => `/students/${id}`,
  parent: (id: string | number) => `/parents/${id}`,
  user: (id: string | number) => `/settings/users/${id}`,
  course: (id: string | number) => `/courses/${id}`,
  group: (id: string | number) => `/groups/${id}`,
  lesson: (id: string | number) => `/lessons/${id}`,
  lead: (id: string | number) => `/leads/${id}`,
  payment: (id: string | number) => `/finance/payments/${id}`,
  payroll: (id: string | number) => `/payroll/${id}`,
} as const;
