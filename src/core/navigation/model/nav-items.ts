import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardCheck,
  DoorOpen,
  Filter,
  GraduationCap,
  Home,
  LayoutDashboard,
  MapPin,
  School,
  SlidersHorizontal,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";

import type { UserRole } from "@/core/auth";

type NavIcon = ComponentType<{ className?: string }>;

interface NavBase {
  label: string;
  icon?: NavIcon;
  permission?: string;
  role?: UserRole | UserRole[];
}

/** Oddiy havola — bosilganda sahifaga o'tadi. */
export interface NavLink extends NavBase {
  href: string;
  /** Small badge in the sidebar (e.g. new leads). */
  count?: number;
}

/**
 * Guruh — o'zi havola emas, faqat ichidagi havolalarni ochib/yig'adi.
 * `href` bo'lsa faqat faollikni aniqlash uchun ishlatiladi (navigatsiya qilinmaydi).
 */
export interface NavGroup extends NavBase {
  href?: string;
  items: NavLink[];
}

export type NavItem = NavLink | NavGroup;

export const isNavGroup = (item: NavItem): item is NavGroup => "items" in item;

/** Guruhlar uchun barqaror kalit (ochilgan/yig'ilgan holat shu bilan saqlanadi). */
export const navItemKey = (item: NavItem): string => item.href ?? item.label;

/**
 * Yassi navigatsiya — bo'lim sarlavhalarisiz ("Asosiy" / "Tizim" yo'q).
 */
export const NAV_ITEMS: NavItem[] = [
  /* "Bosh sahifa" — markaz boshqaruv paneli: faqat rahbariyat uchun. */
  { label: "Bosh sahifa", href: "/", icon: Home, role: ["ceo", "admin"] },
  /* Shaxsiy kabinet — o'qituvchi/o'quvchi/ota-ona rollari uchun bosh sahifa. */
  {
    label: "Kabinet",
    href: "/cabinet",
    icon: LayoutDashboard,
    role: ["teacher", "student", "parent"],
  },
  { label: "Lidlar", href: "/leads", icon: Filter, permission: "leads.view", count: 12 },
  /*
   * O'quvchilar / Davomat / Moliya — ichki ish qurollari. O'quvchi va
   * ota-ona ularga kirmaydi (o'z ma'lumotlari kabinetda), shuning uchun rol
   * bo'yicha ham cheklanadi: aks holda ro'yxatda butun markazning
   * ma'lumotlari ochilardi.
   */
  {
    label: "O'quvchilar",
    href: "/students",
    icon: Users,
    permission: "students.view",
    role: ["ceo", "admin", "teacher"],
  },
  { label: "Guruhlar", href: "/groups", icon: CalendarDays, permission: "groups.view" },
  /* Davomat — har bir dars uchun qatnashuv. Sidebar'da ilgari umuman yo'q edi,
     sahifa esa faqat qo'lda URL kiritib ochilardi. */
  {
    label: "Davomat",
    href: "/attendance",
    icon: ClipboardCheck,
    permission: "attendance.view",
    role: ["ceo", "admin", "teacher"],
  },
  {
    label: "Moliya va kassa",
    href: "/finance",
    icon: Wallet,
    permission: "payments.view",
    role: ["ceo", "admin"],
  },
  /* MVP: tashqi SMS/Telegram provayderlari (Eskiz.uz va h.k.) ulanmagan —
     bo'lim ichki xabarnoma ishga tushganda qaytadi. Sahifa va marshrut
     saqlanib turadi, faqat sidebar'dan yashirilgan. */
  { label: "Hisobotlar", href: "/reports", icon: BarChart3, permission: "reports.view" },
  {
    label: "Markaz",
    icon: Building2,
    items: [
      { label: "Xonalar", href: "/rooms", icon: DoorOpen, permission: "rooms.view" },
      { label: "Kurslar", href: "/courses", icon: GraduationCap, permission: "courses.view" },
      { label: "Maktablar", href: "/schools", icon: School, permission: "schools.view" },
      { label: "Ota-onalar", href: "/parents", icon: UsersRound, permission: "parents.view" },
      { label: "Filiallar", href: "/branches", icon: MapPin, permission: "branches.view" },
    ],
  },
  {
    label: "Sozlamalar",
    href: "/settings",
    icon: SlidersHorizontal,
    permission: "roles.view",
  },
];

/**
 * Sahifa nomlari — Chrome uslubidagi tab strip uchun.
 * Sidebar'da ko'rinmaydigan sahifalar ham shu yerda turadi (tab nomi bo'sh
 * qolmasligi uchun).
 */
export const PAGE_LABELS: Record<string, string> = {
  "/": "Bosh sahifa",
  "/cabinet": "Kabinet",
  "/leads": "Lidlar",
  "/students": "O'quvchilar",
  "/parents": "Ota-onalar",
  "/groups": "Guruhlar",
  "/rooms": "Xonalar",
  "/courses": "Kurslar",
  "/schools": "Maktablar",
  "/branches": "Filiallar",
  "/attendance": "Davomat",
  "/finance": "Moliya va kassa",
  "/finance/payments": "To'lovlar",
  "/finance/charges": "Hisob-fakturalar",
  "/finance/debts": "Qarzlar",
  "/finance/expenses": "Xarajatlar",
  "/finance/cash": "Kassa smenasi",
  "/payroll": "Ish haqi",
  "/messaging": "Xabarlar va SMS",
  "/reports": "Hisobotlar",
  "/settings": "Sozlamalar",
  "/settings/center": "Markaz",
  "/settings/appearance": "Ko'rinish",
  "/settings/users": "Xodimlar",
  "/settings/roles": "Rollar",
  "/settings/days-off": "Dam olish kunlari",
  "/settings/lead-stages": "Lid bosqichlari",
  "/settings/lead-sources": "Lid manbalari",
  "/settings/lead-loss-reasons": "Yo'qotish sabablari",
  "/settings/sms-templates": "Xabar shablonlari",
  "/settings/payment-methods": "To'lov turlari",
  "/tenants": "Markazlar",
};

function isAllowed(
  item: NavItem,
  role: UserRole | undefined,
  can: (p: string) => boolean,
): boolean {
  const permissionOk = !item.permission || can(item.permission);
  const roleOk =
    !item.role ||
    (Array.isArray(item.role) ? item.role.includes(role as UserRole) : item.role === role);
  return permissionOk && roleOk;
}

/**
 * Filters by permission/role. Children that are not allowed drop out; a group
 * whose children are all filtered out disappears entirely.
 */
export function filterNavItems(
  items: NavItem[],
  role: UserRole | undefined,
  can: (p: string) => boolean,
): NavItem[] {
  return items
    .filter((item) => isAllowed(item, role, can))
    .map((item) =>
      isNavGroup(item)
        ? { ...item, items: item.items.filter((child) => isAllowed(child, role, can)) }
        : item,
    )
    .filter((item) => !isNavGroup(item) || item.items.length > 0);
}
