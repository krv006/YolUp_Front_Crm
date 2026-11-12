/**
 * Lead (mijoz/ariza) modeli — CRM pipeline.
 */
export type LeadStatus = "new" | "contacted" | "enrolled" | "lost";

/** Tizim bosqichlari — har birida doimiy kalit va rang bo'ladi. */
export type SystemLeadStage = "open" | "waiting" | "trial" | "won" | "lost";

/**
 * Kanban bosqichi. Tizim bosqichlaridan tashqari foydalanuvchi qo'shgan
 * ustunlar ham bo'lishi mumkin, shuning uchun qiymat `string`ga ochiq.
 */
export type LeadStage = SystemLeadStage | (string & {});

/** Ustun rangi — /lead-stages/ yozuvida saqlanadi. */
export type LeadStageColor = "action" | "info" | "success" | "warning" | "danger" | "neutral";

export interface LeadStageRecord {
  id: string;
  tenant_id: string;
  name: string;
  color: LeadStageColor;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  tenant_id: string;
  branch_id?: string | null;
  source_id?: string | null;
  /** Lid qaysi maktabdan kelgani (ixtiyoriy) — `schools` katalogiga bog'lanadi. */
  school_id?: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  extra_phones?: string[] | null;
  birth_date?: string | null;
  age?: number | null;
  teacher_id?: string | null;
  lesson_time?: string | null;
  lesson_day_type?: "odd" | "even" | "any" | null;
  status: LeadStatus;
  stage: LeadStage;
  temperature?: "cold" | "warm" | "hot" | null;
  body?: string | null;
  loss_reason_id?: string | null;
  converted_to_student_id?: string | null;
  converted_to_group_id?: string | null;
  /** Konvertatsiya vaqti (`null` — hali aylantirilmagan). */
  converted_at?: string | null;
  created_by?: string | null;
  /** Read-only values the list serializer inlines for the board cards. */
  source_name?: string | null;
  school_name?: string | null;
  teacher_name?: string | null;
  /** Aylantirilgandan keyin inline keladigan nomlar. */
  converted_student_name?: string | null;
  converted_group_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadSource {
  id: string;
  tenant_id: string;
  name: string;
  is_active: boolean;
}

export interface LeadLossReason {
  id: string;
  tenant_id: string;
  name: string;
  is_active: boolean;
}

export interface LeadListParams {
  stage?: LeadStage;
  status?: LeadStatus;
  source_id?: string;
  /** Maktab bo'yicha filtr — maktab kartasidan "Lidlarini ko'rish" uchun. */
  school_id?: string;
  teacher_id?: string;
  branch_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}
