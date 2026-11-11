import type { SchoolType } from "./types";

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  public: "Davlat maktabi",
  private: "Xususiy maktab",
  lyceum: "Litsey / kollej",
  kindergarten: "Bog'cha",
  university: "OTM",
  other: "Boshqa",
};

/** Filtr va formalar uchun tayyor variantlar ro'yxati. */
export const SCHOOL_TYPE_OPTIONS: Array<{ value: SchoolType; label: string }> = (
  Object.keys(SCHOOL_TYPE_LABELS) as SchoolType[]
).map((value) => ({ value, label: SCHOOL_TYPE_LABELS[value] }));

/** Noma'lum tur kelib qolsa ham interfeys buzilmasin. */
export function schoolTypeLabel(type?: string | null): string {
  if ((type ?? "").length === 0) return "—";
  return SCHOOL_TYPE_LABELS[type as SchoolType] ?? "Boshqa";
}
