/**
 * Yagona holat lug'atlari — barcha sahifalarda bir xil ko'rinishi uchun.
 */
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export const ATTENDANCE_STATUS: Record<
  AttendanceStatus,
  { label: string; color: string }
> = {
  PRESENT: { label: "Keldi", color: "bg-green-100 text-green-700" },
  LATE: { label: "Kechikdi", color: "bg-amber-100 text-amber-700" },
  ABSENT: { label: "Kelmadi", color: "bg-red-100 text-red-700" },
  EXCUSED: { label: "Ruxsatli", color: "bg-blue-100 text-blue-700" },
};

export type GroupStatus = "planned" | "active" | "completed" | "archived";
export const GROUP_STATUS: Record<GroupStatus, { label: string; color: string }> = {
  planned: { label: "Rejalashtirilgan", color: "bg-slate-100 text-slate-700" },
  active: { label: "Aktiv", color: "bg-green-100 text-green-700" },
  completed: { label: "Tugallangan", color: "bg-emerald-100 text-emerald-700" },
  archived: { label: "Arxiv", color: "bg-slate-200 text-slate-600" },
};

export type PayrollState = "DRAFT" | "LOCKED" | "PAID";
export const PAYROLL_STATE: Record<PayrollState, { label: string; color: string }> = {
  DRAFT: { label: "Qoralama", color: "bg-slate-100 text-slate-700" },
  LOCKED: { label: "Qayd etilgan", color: "bg-amber-100 text-amber-700" },
  PAID: { label: "To'langan", color: "bg-green-100 text-green-700" },
};

export type LeadStage = "open" | "trial" | "won" | "lost" | "waiting";
export const LEAD_STAGE: Record<LeadStage, { label: string }> = {
  open: { label: "Ochiq" },
  trial: { label: "Sinovda" },
  won: { label: "Qozondi (o'quvchi)" },
  lost: { label: "Yutqizdi" },
  waiting: { label: "Kutilmoqda" },
};

export type LeadStatus =
  | "new"
  | "connected"
  | "not_connected"
  | "trial"
  | "enrolled"
  | "rejected";
export const LEAD_STATUS: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: "Yangi", color: "bg-slate-100 text-slate-700" },
  connected: { label: "Bog'langan", color: "bg-blue-100 text-blue-700" },
  not_connected: { label: "Bog'lanmadi", color: "bg-amber-100 text-amber-700" },
  trial: { label: "Sinov", color: "bg-indigo-100 text-indigo-700" },
  enrolled: { label: "Ro'yxatga olindi", color: "bg-green-100 text-green-700" },
  rejected: { label: "Bekor qilindi", color: "bg-red-100 text-red-700" },
};

export type EnrollmentStatus = "trial" | "active" | "frozen" | "left" | "completed";
export const ENROLLMENT_STATUS: Record<EnrollmentStatus, { label: string }> = {
  trial: { label: "Sinov" },
  active: { label: "Aktiv" },
  frozen: { label: "Muzlatilgan" },
  left: { label: "Ketgan" },
  completed: { label: "Bitirgan" },
};

export type PaymentMethod = "cash" | "card" | "click" | "payme" | "uzum" | "transfer";
export const PAYMENT_METHOD: Record<PaymentMethod, { label: string }> = {
  cash: { label: "Naqd" },
  card: { label: "Karta" },
  click: { label: "Click" },
  payme: { label: "Payme" },
  uzum: { label: "Uzum" },
  transfer: { label: "O'tkazma" },
};

export type SubscriptionTier = "basic" | "standard" | "professional" | "enterprise";
export const SUBSCRIPTION_TIER: Record<SubscriptionTier, { label: string }> = {
  basic: { label: "Basic" },
  standard: { label: "Standard" },
  professional: { label: "Professional" },
  enterprise: { label: "Enterprise" },
};
