/**
 * Backend rollari — `docs/BACKEND_API_SPEC.md` dagi 5 ta qatiy rol.
 */
export const USER_ROLES = [
  "ceo",
  "admin",
  "teacher",
  "parent",
  "student",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  ceo: "Bosh direktori",
  admin: "Admin",
  teacher: "O'qituvchi",
  parent: "Ota-ona",
  student: "O'quvchi",
};

export type Language = "uz" | "ru" | "en" | "kaa";

export interface User {
  id: string;
  tenant_id: string;
  branch_id?: string | null;
  role: UserRole;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  phone: string;
  email?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  permissions: string[];
  /**
   * O'quvchi kabineti uchun — foydalanuvchi qaysi o'quvchi yozuviga bog'langan.
   * `student` rolida to'ldiriladi.
   */
  student_id?: string | null;
  /** Ota-ona kabineti uchun — farzandlar ro'yxati. */
  linked_student_ids?: string[];
}

/** `POST /auth/login/` va `POST /auth/refresh/` javobi. */
export interface TokenPair {
  access: string;
  refresh: string;
}
