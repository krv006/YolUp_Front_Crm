import type { GroupTeacherPayRule, GroupTeacherRole } from "./types";

/** Rollar va haq shartlarining o'qiladigan nomlari — UI va jadval uchun umumiy. */
export const TEACHER_ROLE_LABELS: Record<GroupTeacherRole, string> = {
  main: "Asosiy",
  assistant: "Yordamchi",
  co_teacher: "Hammuallif",
};

export const PAY_RULE_LABELS: Record<GroupTeacherPayRule, { label: string; unit: string }> = {
  fixed: { label: "Belgilangan (oylik)", unit: "so'm" },
  percentage: { label: "Guruh tushumidan foiz", unit: "%" },
  per_lesson: { label: "Har bir dars uchun", unit: "so'm" },
  per_student: { label: "Har bir o'quvchi uchun", unit: "so'm" },
};
