/**
 * Haftalik jadval (kun + vaqt) uchun sof yordamchilar.
 *
 * `day_of_week` — JS `Date.getDay()` qiymati (0 = Yakshanba … 6 = Shanba).
 * Mock, demo ma'lumotlar va UI bir xil formatdan foydalanadi.
 */

export interface ScheduleSlotLike {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

/** Dushanbadan yakshanbagacha — foydalanuvchi ko'radigan tartib. */
export const WEEKDAY_OPTIONS: Array<{ value: number; short: string; label: string }> = [
  { value: 1, short: "Du", label: "Dushanba" },
  { value: 2, short: "Se", label: "Seshanba" },
  { value: 3, short: "Chor", label: "Chorshanba" },
  { value: 4, short: "Pay", label: "Payshanba" },
  { value: 5, short: "Jum", label: "Juma" },
  { value: 6, short: "Shan", label: "Shanba" },
  { value: 0, short: "Yak", label: "Yakshanba" },
];

export const WEEKDAY_SHORT: Record<number, string> = Object.fromEntries(
  WEEKDAY_OPTIONS.map((day) => [day.value, day.short]),
);

export const WEEKDAY_LABEL: Record<number, string> = Object.fromEntries(
  WEEKDAY_OPTIONS.map((day) => [day.value, day.label]),
);

/** Dushanba birinchi, yakshanba oxirgi. */
const WEEK_ORDER: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

/** `"11:00:00"` yoki `"11:00"` → `"11:00"`. */
export function normalizeTime(value: unknown, fallback = "09:00"): string {
  const match = String(value ?? "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return fallback;
  const hours = Math.min(23, Math.max(0, Number(match[1])));
  const minutes = Math.min(59, Math.max(0, Number(match[2])));
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Ikki vaqt orasidagi daqiqa (manfiy bo'lsa 0). */
export function durationMinutes(start: string, end: string): number {
  const [startH, startM] = normalizeTime(start).split(":").map(Number);
  const [endH, endM] = normalizeTime(end).split(":").map(Number);
  return Math.max(0, endH * 60 + endM - (startH * 60 + startM));
}

/** `"Du · Chor · Jum · 11:00–12:30"` ko'rinishidagi yorliq. */
export function scheduleLabel(slots: ScheduleSlotLike[] | null | undefined): string {
  if (!slots || slots.length === 0) return "";

  const days = [...new Set(slots.map((slot) => Number(slot.day_of_week)))]
    .filter((day) => day >= 0 && day <= 6)
    .sort((a, b) => (WEEK_ORDER[a] ?? 9) - (WEEK_ORDER[b] ?? 9));
  if (days.length === 0) return "";

  const first = slots[0];
  const uniform = slots.every(
    (slot) =>
      normalizeTime(slot.start_time) === normalizeTime(first.start_time) &&
      normalizeTime(slot.end_time) === normalizeTime(first.end_time),
  );
  const time = uniform
    ? `${normalizeTime(first.start_time)}–${normalizeTime(first.end_time)}`
    : "turli vaqtlarda";

  return `${days.map((day) => WEEKDAY_SHORT[day]).join(" · ")} · ${time}`;
}

/**
 * Eski (faqat boshlanish vaqti yozilgan) yorliqni slotlarga aylantiradi —
 * tahrirlash formasini to'ldirish va mock migratsiyasi uchun.
 */
export function parseScheduleLabel(label: string | null | undefined): ScheduleSlotLike[] {
  if (!label) return [];

  const parts = String(label)
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);

  const days: number[] = [];
  const byShort = new Map(WEEKDAY_OPTIONS.map((day) => [day.short, day.value]));
  for (const part of parts) {
    const day = byShort.get(part);
    if (day !== undefined && !days.includes(day)) days.push(day);
  }
  if (days.length === 0) return [];

  const timePart = parts.find((part) => /\d{1,2}:\d{2}/.test(part)) ?? parts[parts.length - 1];
  const times = String(timePart ?? "").match(/(\d{1,2}:\d{2})/g) ?? [];
  const start = normalizeTime(times[0], "09:00");
  const end = times[1] ? normalizeTime(times[1], "10:30") : addMinutes(start, 90);

  return days.map((day) => ({ day_of_week: day, start_time: start, end_time: end }));
}

/** `"11:00"` + 90 → `"12:30"`. */
export function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = normalizeTime(time).split(":").map(Number);
  const total = Math.min(23 * 60 + 59, hours * 60 + mins + minutes);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** `"Haftada 3 ta dars · 11:00–12:30 (90 daqiqa)"`. */
export function scheduleSummary(slots: ScheduleSlotLike[] | null | undefined): string {
  if (!slots || slots.length === 0) return "Jadval kiritilmagan";

  const days = new Set(slots.map((slot) => slot.day_of_week)).size;
  const first = slots[0];
  const minutes = durationMinutes(first.start_time, first.end_time);
  const time = `${normalizeTime(first.start_time)}–${normalizeTime(first.end_time)}`;
  return `Haftada ${days} ta dars · ${time}${minutes > 0 ? ` (${minutes} daqiqa)` : ""}`;
}
