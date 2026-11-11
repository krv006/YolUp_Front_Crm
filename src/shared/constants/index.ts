// YolUp shared constants — single source of truth (no magic strings/literals)

// Roles
export const ROLES: Record<string, { label: string; color: string }> = {
  ceo: { label: "Bosh direktori", color: "bg-purple-100 text-purple-700" },
  admin: { label: "Admin", color: "bg-blue-100 text-blue-700" },
  teacher: { label: "O'qituvchi", color: "bg-green-100 text-green-700" },
  parent: { label: "Ota-ona", color: "bg-orange-100 text-orange-700" },
  student: { label: "O'quvchi", color: "bg-indigo-100 text-indigo-700" },
  cashier: { label: "Kassir", color: "bg-amber-100 text-amber-700" },
  marketer: { label: "Marketolog", color: "bg-rose-100 text-rose-700" },
  watcher: { label: "Kuzatuvchi", color: "bg-slate-100 text-slate-700" },
};

// Attendance statuses (single enum — no "late" boolean separate)
export const ATTENDANCE_STATUS: Record<
  string,
  { label: string; color: string }
> = {
  PRESENT: { label: "Keldi", color: "bg-green-100 text-green-700" },
  LATE: { label: "Kechi", color: "bg-amber-100 text-amber-700" },
  ABSENT: { label: "Kelmadi", color: "bg-red-100 text-red-700" },
  EXCUSED: { label: "Ruxsatli", color: "bg-blue-100 text-blue-700" },
};

// Lead statuses
export const LEAD_STATUS: Record<string, { label: string; color: string }> = {
  new: { label: "Yangi", color: "bg-slate-100 text-slate-700" },
  connected: { label: "Bog'langan", color: "bg-blue-100 text-blue-700" },
  not_connected: { label: "Bog'lanmadi", color: "bg-amber-100 text-amber-700" },
  trial: { label: "Sinov", color: "bg-indigo-100 text-indigo-700" },
  enrolled: { label: "Ro'yxatga olindi", color: "bg-green-100 text-green-700" },
  rejected: { label: "Bekor qilindi", color: "bg-red-100 text-red-700" },
};

// Lead stages (single concept — replaces old branch/column/status split)
export const LEAD_STAGE: Record<string, { label: string }> = {
  open: { label: "Ochiq" },
  trial: { label: "Sinovda" },
  won: { label: "Qozondi (o'quvchi)" },
  lost: { label: "Yutqizdi" },
  waiting: { label: "Kutilmoqda" },
};

// Group statuses
export const GROUP_STATUS: Record<string, { label: string; color: string }> = {
  planned: { label: "Rejalashtirilgan", color: "bg-slate-100 text-slate-700" },
  active: { label: "Aktiv", color: "bg-green-100 text-green-700" },
  completed: { label: "Tugallangan", color: "bg-emerald-100 text-emerald-700" },
  archived: { label: "Arxiv", color: "bg-slate-200 text-slate-600" },
};

// Enrollment statuses
export const ENROLLMENT_STATUS: Record<string, { label: string }> = {
  trial: { label: "Sinov" },
  active: { label: "Aktiv" },
  frozen: { label: "Muzlatilgan" },
  left: { label: "Ketgan" },
  completed: { label: "Bitirgan" },
};

// Payroll states
export const PAYROLL_STATE: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Nhayriy", color: "bg-slate-100 text-slate-700" },
  LOCKED: { label: "Qayd etilgan", color: "bg-amber-100 text-amber-700" },
  PAID: { label: "To'langan", color: "bg-green-100 text-green-700" },
};

// Payment methods
export const PAYMENT_METHOD: Record<string, { label: string }> = {
  cash: { label: "Naqd" },
  card: { label: "Karta" },
  click: { label: "Click" },
  payme: { label: "Payme" },
  uzum: { label: "Uzum" },
  transfer: { label: "O'tkazma" },
};

// Billing modes
export const BILLING_MODE: Record<string, { label: string }> = {
  monthly_calendar: { label: "Oylik (kalendar bo'yicha)" },
  monthly_from_enrollment: { label: "Oylik (ro'yxatdan o'tgan kundan)" },
  per_lesson: { label: "Har bir dars bo'yicha" },
};

// Currency
export const DEFAULT_CURRENCY = "UZS";
export const DEFAULT_TIMEZONE = "Asia/Tashkent";

// Storage keys
export const STORAGE_KEYS = {
  TENANT_ID: "yolup_tenant_id",
  BRANCH_ID: "yolup_branch_id",
  THEME: "yolup_theme",
  LANGUAGE: "yolup_lang",
} as const;

// Limits
export const MAX_FILE_SIZE_MB = 10;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Language options (uz/ru/en/kaa from day 1)
export const LANGUAGES = [
  { code: "uz", label: "O'zbekcha" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "kaa", label: "Қарақалпақша" },
] as const;
