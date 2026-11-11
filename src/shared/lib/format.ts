import { format, parseISO, isValid } from "date-fns";
import { uz } from "date-fns/locale";

export const DATE_FORMAT = "dd.MM.yyyy";
export const DATE_TIME_FORMAT = "dd.MM.yyyy HH:mm";
export const TIME_FORMAT = "HH:mm";
export const LONG_DATE_FORMAT = "EEEE, d-MMMM yyyy";

export function formatDate(iso: string | null | undefined, fmt = DATE_FORMAT): string {
  if (!iso) return "-";
  const d = parseISO(iso);
  if (!isValid(d)) return "-";
  return format(d, fmt, { locale: uz });
}

/** "Juma, 16-Oktabr 2026" — sahifa sarlavhalari uchun. */
export function formatLongDate(iso: string | null | undefined): string {
  return formatDate(iso, LONG_DATE_FORMAT);
}

export function formatDateTime(iso: string | null | undefined): string {
  return formatDate(iso, DATE_TIME_FORMAT);
}

export function formatTime(iso: string | null | undefined): string {
  return formatDate(iso, TIME_FORMAT);
}

/** `"2026-10"` → `"Oktabr 2026"` (oy tanlagichlari va hisobotlar uchun). */
export function formatMonth(value: string | null | undefined): string {
  if (!value) return "—";
  const date = parseISO(value.length === 7 ? `${value}-01` : value);
  if (!isValid(date)) return String(value);
  const label = format(date, "LLLL yyyy", { locale: uz });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatMoney(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  // Backend pulni tiyinda yuboradi (1 so'm = 100 tiyin).
  const som = amount / 100;
  return `${formatNumber(Math.abs(som))} so'm`;
}

/** 6500 → "6 500" (bo'sh joy bilan ajratilgan). */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

/** "Aziz Karimov" → "AK" (avatar uchun). */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "182 450 000" → "182.5 mln" (KPI kartalari uchun ixcham variant). */
export function formatCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "-";
  const value = Math.abs(amount);
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} mlrd`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mln`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} ming`;
  return String(Math.round(value));
}

/** Musbat/Manfiy summa: 1200000 → "+1 200 000", -3500000 → "−3 500 000". */
export function formatSigned(value: number): string {
  const sign = value < 0 ? "\u2212" : "+";
  return sign + formatNumber(Math.abs(value));
}
