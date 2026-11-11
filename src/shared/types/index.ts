// YolUp shared domain types
// Single source of truth for domain enums, statuses, and shared DTO shapes.
// Keep these framework-independent (no React imports here).

export type UUID = string;
export type Money = number; // stored in tiyin (smallest currency unit) on backend
export type Phone = string;
export type Email = string;
export type Slug = string;

// ---------- Roles & RBAC ----------
export type Role =
  | "ceo"
  | "admin"
  | "teacher"
  | "parent"
  | "student"
  | "cashier"
  | "marketer"
  | "watcher";

export type Permission = `${string}.${string}`; // e.g. "payments.create"

export interface RolePermission {
  role: Role;
  permissions: Permission[];
}

// ---------- Tenant / Branch ----------
export interface Tenant {
  id: UUID;
  name: string;
  slug: Slug;
  phone?: Phone | null;
  email?: Email | null;
  address?: string | null;
  logo_url?: string | null;
  currency: string; // "UZS"
  timezone: string; // "Asia/Tashkent"
  subscription_tier: "basic" | "standard" | "professional" | "enterprise";
  subscription_status: "active" | "trial" | "expired" | "blocked";
  subscription_expires_at?: string | null;
  max_students?: number | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: UUID;
  tenant_id: UUID;
  name: string;
  code: string;
  address?: string | null;
  phone?: Phone | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---------- User ----------
export interface User {
  id: UUID;
  tenant_id: UUID;
  branch_id?: UUID | null;
  role: Role;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone: Phone;
  email?: Email | null;
  password?: string; // only in admin override responses
  avatar_url?: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends User {
  permissions: Permission[];
}

// ---------- Student ----------
export interface Student {
  id: UUID;
  tenant_id: UUID;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone?: Phone | null;
  email?: Email | null;
  birth_date?: string | null;
  gender?: "male" | "female" | "other" | null;
  address?: string | null;
  photo_url?: string | null;
  enrollment_date: string;
  status: "trial" | "active" | "frozen" | "left" | "graduated";
  balance_tiyin: Money; // negative = debt
  created_at: string;
  updated_at: string;
}

// ---------- Parent ----------
export interface Parent {
  id: UUID;
  tenant_id: UUID;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone: Phone;
  email?: Email | null;
  relation?: string | null; // e.g. "mother", "father", "guardian"
  created_at: string;
  updated_at: string;
}

export interface ParentStudentLink {
  id: UUID;
  parent_id: UUID;
  student_id: UUID;
  is_primary: boolean;
  created_at: string;
}

// ---------- Course ----------
export interface Course {
  id: UUID;
  tenant_id: UUID;
  name: string;
  code?: string | null;
  description?: string | null;
  price_tiyin: Money;
  duration_months?: number | null;
  lessons_count?: number | null;
  syllabus?: any | null; // JSON
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---------- Room ----------
export interface Room {
  id: UUID;
  tenant_id: UUID;
  branch_id: UUID;
  name: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---------- Group ----------
export interface Group {
  id: UUID;
  tenant_id: UUID;
  branch_id: UUID;
  course_id: UUID;
  name: string;
  color?: string | null;
  price_tiyin: Money;
  start_date: string;
  end_date?: string | null;
  status: "planned" | "active" | "completed" | "archived";
  billing_mode: "monthly_calendar" | "monthly_from_enrollment" | "per_lesson";
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
}

export interface GroupTeacher {
  id: UUID;
  group_id: UUID;
  user_id: UUID;
  role: "main" | "assistant" | "co_teacher";
  pay_rule: "fixed" | "percentage" | "per_lesson" | "per_student";
  pay_value_tiyin?: Money | null;
  created_at: string;
}

// ---------- Schedule ----------
export interface ScheduleSlot {
  id: UUID;
  group_id: UUID;
  room_id: UUID;
  day_of_week: number; // 1=Mon ... 7=Sun
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_active: boolean;
  created_at: string;
}

// ---------- Lesson ----------
export interface Lesson {
  id: UUID;
  group_id: UUID;
  room_id?: UUID | null;
  title?: string | null;
  starts_at: string;
  ends_at: string;
  topic?: string | null;
  status: "scheduled" | "held" | "cancelled" | "rescheduled";
  created_at: string;
  updated_at: string;
}

// ---------- Enrollment ----------
export interface Enrollment {
  id: UUID;
  student_id: UUID;
  group_id: UUID;
  status: "trial" | "active" | "frozen" | "left" | "completed";
  joined_at: string;
  left_at?: string | null;
  freeze_reason?: string | null;
  left_reason?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Attendance ----------
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export interface Attendance {
  id: UUID;
  lesson_id: UUID;
  enrollment_id: UUID;
  status: AttendanceStatus;
  marked_by?: UUID | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BulkAttendanceItem {
  enrollment_id: UUID;
  status: AttendanceStatus;
  note?: string | null;
}

export interface BulkAttendanceRequest {
  lesson_id: UUID;
  items: BulkAttendanceItem[];
}

// ---------- Assessment / Grading ----------
export interface Assessment {
  id: UUID;
  group_id: UUID;
  title: string;
  type: "daily" | "exam" | "quiz" | "homework";
  max_score: number;
  date: string;
  schema?: string | null; // e.g. "CEFR", "1-5", "ABCF", "100"
  created_at: string;
}

export interface Score {
  id: UUID;
  assessment_id: UUID;
  enrollment_id: UUID;
  score: number;
  comment?: string | null;
  created_at: string;
}

// ---------- Lead ----------
export type LeadStatus = "new" | "connected" | "not_connected" | "trial" | "enrolled" | "rejected";
export type LeadStage = "open" | "trial" | "won" | "lost" | "waiting"; // single system stage concept

export interface Lead {
  id: UUID;
  tenant_id: UUID;
  branch_id?: UUID | null;
  source_id?: UUID | null;
  first_name: string;
  last_name?: string | null;
  phone: Phone;
  extra_phones?: Phone[] | null;
  birth_date?: string | null;
  age?: number | null;
  teacher_id?: UUID | null;
  lesson_time?: string | null;
  lesson_day_type?: "odd" | "even" | "custom" | null;
  status: LeadStatus;
  stage: LeadStage;
  temperature?: "cold" | "warm" | "hot" | null;
  body?: string | null;
  loss_reason_id?: UUID | null;
  converted_to_student_id?: UUID | null;
  converted_to_group_id?: UUID | null;
  created_by?: UUID | null;
  created_at: string;
  updated_at: string;
}

export interface LeadSource {
  id: UUID;
  tenant_id: UUID;
  name: string;
  is_active: boolean;
}

export interface LeadLossReason {
  id: UUID;
  tenant_id: UUID;
  name: string;
  is_active: boolean;
}

// ---------- Finance ----------
export type PaymentMethod = "cash" | "card" | "click" | "payme" | "uzum" | "transfer";
export type ChargeType = "tuition" | "extra" | "discount" | "refund" | "adjustment";

export interface LedgerEntry {
  id: UUID;
  tenant_id: UUID;
  student_id?: UUID | null;
  group_id?: UUID | null;
  type: ChargeType;
  amount_tiyin: Money;
  description?: string | null;
  reference_id?: UUID | null; // payment, charge, etc.
  created_at: string;
}

export interface Payment {
  id: UUID;
  tenant_id: UUID;
  student_id: UUID;
  group_id?: UUID | null;
  amount_tiyin: Money;
  method: PaymentMethod;
  receipt_url?: string | null;
  receipt_number?: string | null;
  paid_at: string;
  created_by?: UUID | null;
  idempotency_key?: string;
  created_at: string;
}

export interface Discount {
  id: UUID;
  tenant_id: UUID;
  student_id: UUID;
  group_id?: UUID | null;
  type: "percent" | "fixed";
  value_tiyin?: Money | null; // for fixed
  value_percent?: number | null; // for percent
  valid_from: string;
  valid_until?: string | null;
  is_active: boolean;
}

export interface ExpenseCategory {
  id: UUID;
  tenant_id: UUID;
  name: string;
  is_active: boolean;
}

export interface Expense {
  id: UUID;
  tenant_id: UUID;
  branch_id?: UUID | null;
  category_id: UUID;
  amount_tiyin: Money;
  description?: string | null;
  date: string;
  created_by?: UUID | null;
  created_at: string;
}

export interface CashShift {
  id: UUID;
  tenant_id: UUID;
  branch_id: UUID;
  cashier_id: UUID;
  opened_at: string;
  closed_at?: string | null;
  expected_amount_tiyin?: Money | null;
  actual_amount_tiyin?: Money | null;
  status: "open" | "closed";
}

// ---------- Payroll ----------
export type PayrollState = "DRAFT" | "LOCKED" | "PAID";

export interface Payroll {
  id: UUID;
  tenant_id: UUID;
  user_id: UUID;
  month: string; // YYYY-MM
  base_amount_tiyin: Money;
  adjustments_tiyin: Money;
  final_amount_tiyin: Money;
  state: PayrollState;
  created_at: string;
  locked_at?: string | null;
  paid_at?: string | null;
}

export interface PayrollAdjustment {
  id: UUID;
  payroll_id: UUID;
  type: "bonus" | "fine" | "advance";
  amount_tiyin: Money;
  reason?: string | null;
  created_by?: UUID | null;
  created_at: string;
}

// ---------- Messaging ----------
export interface MessageTemplate {
  id: UUID;
  tenant_id: UUID;
  name: string;
  channel: "sms" | "telegram" | "push";
  subject?: string | null;
  body: string; // with placeholders {{student_name}}, etc.
  is_active: boolean;
  created_at: string;
}

export interface AutomationRule {
  id: UUID;
  tenant_id: UUID;
  trigger: "debt" | "missed_class" | "payment_received" | "group_start" | "trial_end";
  template_id: UUID;
  channel: "sms" | "telegram" | "push";
  is_active: boolean;
}

export interface MessageLog {
  id: UUID;
  tenant_id: UUID;
  recipient_phone?: Phone | null;
  channel: "sms" | "telegram" | "push";
  body: string;
  status: "queued" | "sent" | "delivered" | "failed";
  sent_at?: string | null;
  created_at: string;
}

// ---------- Audit & Approval ----------
export interface AuditLog {
  id: UUID;
  tenant_id: UUID;
  user_id?: UUID | null;
  action: string;
  entity_type: string;
  entity_id?: UUID | null;
  metadata?: any | null;
  ip?: string | null;
  created_at: string;
}

export interface ApprovalRequest {
  id: UUID;
  tenant_id: UUID;
  user_id: UUID;
  action_type: "refund" | "discount_override" | "backdated_payment" | "salary_override";
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  decided_at?: string | null;
  decided_by?: UUID | null;
}

// ---------- API envelopes ----------
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  request_id?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------- Auth ----------
export interface LoginRequest {
  identifier: string; // phone or email
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: UserWithRole;
  tenant: Tenant;
  branch?: Branch | null;
}

export interface RefreshRequest {
  refresh: string;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

export interface PasswordResetRequest {
  identifier: string;
}

export interface PasswordOverrideRequest {
  target_user_id: UUID;
  new_password: string;
}

// ---------- UI ----------
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string | number;
}

export interface KpiCard {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}
