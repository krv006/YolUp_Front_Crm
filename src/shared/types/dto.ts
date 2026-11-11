// Request/Response DTOs — mirrored from OpenAPI contract (handwritten until codegen)
// Naming: <Entity><Action>Request / <Entity><Action>Response

import { PaginatedResponse, Tenant } from "@/shared/types";

export type TenantListResponse = PaginatedResponse<Tenant>;
export interface TenantCreateRequest {
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  address?: string;
  currency?: string;
  subscription_tier?: "basic" | "standard" | "professional" | "enterprise";
  max_students?: number;
}

export interface BranchCreateRequest {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  is_active?: boolean;
}

export interface RoomCreateRequest {
  branch_id: string;
  name: string;
  capacity: number;
  is_active?: boolean;
}

export interface UserCreateRequest {
  branch_id?: string | null;
  role: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone: string;
  email?: string | null;
  password: string;
}

export interface StudentCreateRequest {
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone?: string | null;
  email?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
}

export interface ParentCreateRequest {
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone: string;
  email?: string | null;
  relation?: string | null;
}

export interface ParentStudentLinkRequest {
  parent_id: string;
  student_id: string;
  is_primary?: boolean;
}

export interface CourseCreateRequest {
  name: string;
  code?: string | null;
  description?: string | null;
  price_tiyin: number;
  duration_months?: number | null;
  lessons_count?: number | null;
  is_active?: boolean;
}

export interface GroupCreateRequest {
  branch_id: string;
  course_id: string;
  name: string;
  color?: string | null;
  price_tiyin: number;
  start_date: string;
  end_date?: string | null;
  billing_mode: "monthly_calendar" | "monthly_from_enrollment" | "per_lesson";
}

export interface ScheduleSlotCreateRequest {
  group_id: string;
  room_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface LessonCreateRequest {
  group_id: string;
  room_id?: string | null;
  title?: string | null;
  starts_at: string;
  ends_at: string;
  topic?: string | null;
}

export interface EnrollmentCreateRequest {
  student_id: string;
  group_id: string;
  status?: "trial" | "active" | "frozen" | "left" | "completed";
}

export interface LeadCreateRequest {
  branch_id?: string | null;
  source_id?: string | null;
  first_name: string;
  last_name?: string | null;
  phone: string;
  extra_phones?: string[] | null;
  birth_date?: string | null;
  age?: number | null;
  teacher_id?: string | null;
  lesson_time?: string | null;
  lesson_day_type?: string | null;
  status?: string;
  stage?: string;
  temperature?: string | null;
  body?: string | null;
  loss_reason_id?: string | null;
}

export interface PaymentCreateRequest {
  student_id: string;
  group_id?: string | null;
  amount_tiyin: number;
  method: string;
  idempotency_key: string;
}

export interface ExpenseCreateRequest {
  branch_id?: string | null;
  category_id: string;
  amount_tiyin: number;
  description?: string | null;
  date: string;
}

export interface PayrollAdjustmentCreateRequest {
  payroll_id: string;
  type: "bonus" | "fine" | "advance";
  amount_tiyin: number;
  reason?: string | null;
}

export interface MessageTemplateCreateRequest {
  name: string;
  channel: "sms" | "telegram" | "push";
  subject?: string | null;
  body: string;
}

export interface AutomationRuleCreateRequest {
  trigger: string;
  template_id: string;
  channel: "sms" | "telegram" | "push";
}

export interface SMSSendRequest {
  to: string;
  template_id?: string | null;
  body?: string | null;
  placeholders?: Record<string, string> | null;
}
