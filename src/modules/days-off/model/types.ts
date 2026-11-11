/**
 * Dam olish kunlari — markaz/filial bayram va dam olish taqvimi.
 * `GET/POST/PATCH/DELETE /days-off/`. Filial bo'yicha yoki butun markaz uchun
 * (`branch_id === null`) qoidalar qo'yiladi.
 */
export interface DayOff {
  id: string;
  tenant_id: string;
  name: string;
  date_from: string;
  date_to: string;
  branch_id?: string | null;
  branch_name?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
}
