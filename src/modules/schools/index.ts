/**
 * Schools moduli — PUBLIC API.
 *
 * Maktab — lidlar manbasi: `School 1 ── N Lead`. Katalog marketing uchun:
 * qaysi maktabdan qancha lid kelgani va konversiyasi shu yerda ko'rinadi.
 */
export {
  schoolKeys,
  useSchoolList,
  useSchoolDetail,
  useSchoolOptions,
  useSchoolCreate,
  useSchoolUpdate,
  useSchoolDelete,
} from "./api/school-queries";
export type { School, SchoolListParams, SchoolType } from "./model/types";
export type { SchoolValues } from "./model/schemas";
export { schoolSchema, schoolPayload } from "./model/schemas";
export { SCHOOL_TYPE_LABELS, SCHOOL_TYPE_OPTIONS, schoolTypeLabel } from "./model/labels";
export { schoolApi } from "./api/school-api";
export { SchoolForm } from "./ui/school-form";
export { SchoolTable } from "./ui/school-table";
