/**
 * Moliya bo'limining ko'rsatish yordamchilari.
 *
 * Hisob-faktura davri `YYYY-MM` ko'rinishida saqlanadi (vaqt mintaqasiga
 * bog'lanmasligi uchun), ekranda esa "Oktabr 2026" ko'rinishida chiqadi.
 */

import { formatDate } from "@/shared/lib";

const MONTH_LABELS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

/** `2026-10` → `Oktabr 2026`. Noto'g'ri qiymat o'zgarishsiz qaytadi. */
export function formatPeriod(period: string | null | undefined): string {
  if (!period) return "—";

  const [year, month] = period.split("-");
  const index = Number(month) - 1;
  const label = MONTH_LABELS[index];

  if (!year || !label) return period;

  return `${label} ${year}`;
}

export interface PeriodOption {
  value: string;
  label: string;
}

/** Oxirgi `count` oy — hisoblash formasidagi davr tanlovi uchun. */
export function recentPeriods(count = 12, from = new Date()): PeriodOption[] {
  return Array.from({ length: count }, (_, index) => {
    const month = new Date(from.getFullYear(), from.getMonth() - index, 1);
    const value = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    return { value, label: formatPeriod(value) };
  });
}

/**
 * Bo'sh yoki yo'q sana — "—". `formatDate` bilan bir xil joyda turadi, shunda
 * jadvallar `x ? ... : "—"` kabi truthiness tekshiruviga muhtoj bo'lmaydi.
 */
export function formatOptionalDate(value: string | null | undefined): string {
  if (value === null || value === undefined || value.length === 0) return "—";
  return formatDate(value);
}
