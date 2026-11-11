/**
 * Course (kurs) modeli — markazning o'quv mahsuloti.
 *
 * Munosabat: `Course 1 ── N Group`. Guruh o'z `course_id` si bilan kursga
 * bog'lanadi, shuning uchun kursni o'chirishdan oldin unga bog'langan
 * guruhlar bo'lmasligi kerak.
 */
export interface Course {
  id: string;
  tenant_id: string;
  name: string;
  /** Qisqa kod (ENG, MATH…) — hisobot va hujjatlarda ishlatiladi. */
  code?: string | null;
  description?: string | null;
  /**
   * Standart OYLIK narx, tiyinda. Guruh shu narxdan boshlanadi, keyin
   * guruhning o'z narxi (chegirma, aksiya) qo'llaniladi.
   */
  price_tiyin: number;
  /** Kurs davomiyligi (oy). */
  duration_months?: number | null;
  /** Kursdagi darslar soni. */
  lessons_count?: number | null;
  /** Kurs mavzulari (syllabus) — hozircha erkin JSON, keyingi bosqichda alohida resurs. */
  syllabus?: unknown;
  /** Nofaol kurs yangi guruhga tanlanmaydi, lekin tarixi saqlanadi. */
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
