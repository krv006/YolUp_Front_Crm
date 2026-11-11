import { createRoute, createRouter, createRootRoute, redirect } from "@tanstack/react-router";

import App from "@/app/index";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import TenantsPage from "@/pages/tenants";
import BranchesPage from "@/pages/branches";
import RoomsPage from "@/pages/rooms";
import StudentsPage from "@/pages/students";
import GroupsPage from "@/pages/groups";
import GroupDetailPage from "@/pages/groups/detail";
import FinanceLayout from "@/pages/finance/layout";
import FinanceOverviewPage from "@/pages/finance";
import FinancePaymentsPage from "@/pages/finance/payments";
import FinanceChargesPage from "@/pages/finance/charges";
import FinanceDebtsPage from "@/pages/finance/debts";
import FinanceExpensesPage from "@/pages/finance/expenses";
import PayrollPage from "@/pages/payroll";
import LeadsPage from "@/pages/leads";
import SettingsLayout from "@/pages/settings/layout";
import SettingsCenterPage from "@/pages/settings/center";
import SettingsAppearancePage from "@/pages/settings/appearance";
import SettingsUsersPage from "@/pages/settings/users";
import SettingsRolesPage from "@/pages/settings/roles";
import SettingsDaysOffPage from "@/pages/settings/days-off";
import SettingsLeadStagesPage from "@/pages/settings/lead-stages";
import SettingsLeadSourcesPage from "@/pages/settings/lead-sources";
import SettingsLeadLossReasonsPage from "@/pages/settings/lead-loss-reasons";
import SettingsSmsTemplatesPage from "@/pages/settings/sms-templates";
import SettingsPaymentMethodsPage from "@/pages/settings/payment-methods";
import ParentsPage from "@/pages/parents";
import CoursesPage from "@/pages/courses";
import SchoolsPage from "@/pages/schools";
import AttendancePage from "@/pages/attendance";
import CabinetPage from "@/pages/cabinet";
import MessagingPage from "@/pages/messaging";
import ReportsPage from "@/pages/reports";
import NotFoundPage from "@/pages/not-found";

/* -------------------------------------------------------------------------- */
/*  Root route — hamma sahifani App (auth + layout) bilan o'raydi              */
/* -------------------------------------------------------------------------- */

export const rootRoute = createRootRoute({
  component: App,
  notFoundComponent: NotFoundPage,
});

/* -------------------------------------------------------------------------- */
/*  Public                                                                     */
/* -------------------------------------------------------------------------- */

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

/* -------------------------------------------------------------------------- */
/*  Private                                                                    */
/* -------------------------------------------------------------------------- */

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

export const tenantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tenants",
  component: TenantsPage,
});

export const branchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/branches",
  component: BranchesPage,
});

export const roomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rooms",
  component: RoomsPage,
});

export const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/students",
  component: StudentsPage,
});

/**
 * Shaxsiy kabinet — o'qituvchi/o'quvchi/ota-ona uchun bosh sahifa.
 * Bir marshrut, rol bo'yicha turli mazmun (`pages/cabinet/index.tsx`).
 */
export const cabinetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cabinet",
  component: CabinetPage,
});

export const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/groups",
  component: GroupsPage,
});

/** Guruh sahifasi — ro'yxatdagi har bir guruh shu manzilga ochiladi. */
export const groupDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/groups/$groupId",
  component: GroupDetailPage,
});

/**
 * Moliya hub'i — chap navigatsiyali bitta bo'lim (`/finance`). Bolalar
 * sahifalari hub ichida almashadi, `index` esa umumiy ko'rinishni beradi.
 */
export const financeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/finance",
  component: FinanceLayout,
});

export const financeIndexRoute = createRoute({
  getParentRoute: () => financeRoute,
  path: "/",
  component: FinanceOverviewPage,
});

export const financePaymentsRoute = createRoute({
  getParentRoute: () => financeRoute,
  path: "payments",
  component: FinancePaymentsPage,
});

export const financeChargesRoute = createRoute({
  getParentRoute: () => financeRoute,
  path: "charges",
  component: FinanceChargesPage,
});

export const financeDebtsRoute = createRoute({
  getParentRoute: () => financeRoute,
  path: "debts",
  component: FinanceDebtsPage,
});

export const financeExpensesRoute = createRoute({
  getParentRoute: () => financeRoute,
  path: "expenses",
  component: FinanceExpensesPage,
});

export const payrollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payroll",
  component: PayrollPage,
});

export const leadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leads",
  /**
   * Lidlar ro'yxatini havola orqali filtrlash — maktab kartasidagi
   * "Lidlarini ko'rish" tugmasi `/leads?school=school-0003` ga olib keladi.
   */
  validateSearch: (search: Record<string, unknown>): { school?: string } => ({
    school:
      typeof search.school === "string" && search.school.length > 0 ? search.school : undefined,
  }),
  component: LeadsPage,
});

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsLayout,
});

export const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/settings/center" });
  },
});

export const settingsCenterRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "center",
  component: SettingsCenterPage,
});

export const settingsAppearanceRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "appearance",
  component: SettingsAppearancePage,
});

export const settingsUsersRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "users",
  component: SettingsUsersPage,
});

export const settingsRolesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "roles",
  component: SettingsRolesPage,
});

export const settingsDaysOffRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "days-off",
  component: SettingsDaysOffPage,
});

export const settingsLeadStagesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "lead-stages",
  component: SettingsLeadStagesPage,
});

export const settingsLeadSourcesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "lead-sources",
  component: SettingsLeadSourcesPage,
});

export const settingsLeadLossReasonsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "lead-loss-reasons",
  component: SettingsLeadLossReasonsPage,
});

export const settingsSmsTemplatesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "sms-templates",
  component: SettingsSmsTemplatesPage,
});

export const settingsPaymentMethodsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "payment-methods",
  component: SettingsPaymentMethodsPage,
});

/* --- Navigatsiyada bor, lekin sahifasi hali yozilmagan bo'limlar ---------- */

export const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses",
  component: CoursesPage,
});

export const schoolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/schools",
  component: SchoolsPage,
});

export const parentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/parents",
  component: ParentsPage,
});

export const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendance",
  component: AttendancePage,
});

export const messagingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messaging",
  component: MessagingPage,
});

export const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage,
});

/* -------------------------------------------------------------------------- */
/*  Route tree                                                                 */
/* -------------------------------------------------------------------------- */

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  loginRoute,
  tenantsRoute,
  branchesRoute,
  roomsRoute,
  studentsRoute,
  cabinetRoute,
  groupsRoute,
  groupDetailRoute,
  financeRoute.addChildren([
    financeIndexRoute,
    financePaymentsRoute,
    financeChargesRoute,
    financeDebtsRoute,
    financeExpensesRoute,
  ]),
  payrollRoute,
  leadsRoute,
  settingsRoute.addChildren([
    settingsIndexRoute,
    settingsCenterRoute,
    settingsAppearanceRoute,
    settingsUsersRoute,
    settingsRolesRoute,
    settingsDaysOffRoute,
    settingsLeadStagesRoute,
    settingsLeadSourcesRoute,
    settingsLeadLossReasonsRoute,
    settingsSmsTemplatesRoute,
    settingsPaymentMethodsRoute,
  ]),
  coursesRoute,
  schoolsRoute,
  parentsRoute,
  attendanceRoute,
  messagingRoute,
  reportsRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
