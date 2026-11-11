/**
 * School (maktab) modeli — lidlar qaysi maktabdan kelgani.
 *
 * Munosabat: `School 1 ── N Lead`. Maktab katalogi marketing uchun: qaysi
 * maktabdan qancha lid kelgani, ulardan qanchasi o'quvchiga aylangani.
 * Lidlari bog'langan maktabni o'chirish mumkin emas — server 400 qaytaradi.
 */
export type SchoolType = "public" | "private" | "lyceum" | "kindergarten" | "university" | "other";

export interface School {
  id: string;
  tenant_id: string;
  name: string;
  type: SchoolType;
  /** Tuman/shahar — maktablarni hudud bo'yicha guruhlash uchun. */
  district?: string | null;
  address?: string | null;
  /** Maktab tomonidagi mas'ul shaxs (o'quv bo'limi, psixolog…). */
  contact_person?: string | null;
  phone?: string | null;
  /** Maktabdagi o'quvchilar soni — potensial auditoriya hajmi. */
  student_capacity?: number | null;
  is_active: boolean;
  /** Hamkorlik boshlangan sana (`YYYY-MM-DD`); hali hamkor bo'lmasa `null`. */
  partner_since?: string | null;
  notes?: string | null;
  /**
   * Read-only: server lidlar bo'yicha hisoblab qo'shadi — jami lidlar,
   * ularning "won" bosqichga o'tganlari va konversiya foizi.
   */
  leads_count?: number;
  enrolled_count?: number;
  conversion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface SchoolListParams {
  type?: SchoolType;
  district?: string;
  is_active?: string | boolean;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}
