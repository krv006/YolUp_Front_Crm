/**
 * Markaz (tenant) o'z profili — bitta yozuv, `GET/PATCH /settings/center/`.
 * Kataloglar (filial, xona, kurs, guruh…) alohida bo'limlarda turadi.
 */
export interface CenterSettings {
  id: string;
  tenant_id: string;
  name: string;
  legal_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  work_hours_from?: string | null;
  work_hours_to?: string | null;
  language?: string | null;
  currency?: string | null;
  updated_at: string;
}

export const LANGUAGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "uz", label: "O'zbekcha" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

export const CURRENCY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "UZS", label: "UZS (so'm)" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];
