import type { ComponentType } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import {
  Building2,
  CalendarOff,
  CreditCard,
  Filter,
  Plug,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
  Users,
  Wallet,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { PageHeader } from "@/shared/ui/page-header";
import { usePermission, type Permission } from "@/core/permission";

interface SettingsSection {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  permission?: Permission;
  description: string;
  group: string;
  status?: "active" | "coming-soon";
}

/**
 * Sozlamalar guruhlari — hamma sozlamalar bitta `/settings` hub ichida.
 * `coming-soon` bo'limlar uchun sahifa hali yo'q: ular o'chirilgan ko'rinishda
 * turadi (keyingi bosqichlarda ulanadi).
 */
const SECTIONS: SettingsSection[] = [
  {
    id: "center",
    label: "Markaz",
    path: "/settings/center",
    icon: Building2,
    permission: "settings.view",
    description: "Nom, manzil, ish vaqti, valyuta, til",
    group: "Markaz",
  },
  {
    id: "appearance",
    label: "Ko'rinish",
    path: "/settings/appearance",
    icon: SlidersHorizontal,
    description: "Tablar chizig'i va yon menyu — shaxsiy sozlamalar",
    group: "Markaz",
  },
  {
    id: "users",
    label: "Xodimlar",
    path: "/settings/users",
    icon: Users,
    permission: "users.view",
    description: "Jamoa a'zolari va ularning rollari",
    group: "Jamoa",
  },
  {
    id: "roles",
    label: "Rollar",
    path: "/settings/roles",
    icon: Settings2,
    permission: "roles.view",
    description: "5 ta asosiy rol va ruxsatlar matritsasi",
    group: "Jamoa",
  },
  {
    id: "days-off",
    label: "Dam olish kunlari",
    path: "/settings/days-off",
    icon: CalendarOff,
    permission: "days_off.view",
    description: "Markaz va filiallarning dam olish kunlari",
    group: "O'quv",
  },
  {
    id: "lead-stages",
    label: "Lid bosqichlari",
    path: "/settings/lead-stages",
    icon: Filter,
    permission: "lead_stages.view",
    description: "Kanban ustunlari va ularning rangi",
    group: "Lidlar",
  },
  {
    id: "lead-sources",
    label: "Lid manbalari",
    path: "/settings/lead-sources",
    icon: Tags,
    permission: "lead_sources.view",
    description: "Lidlar qaysi kanaldan keladi",
    group: "Lidlar",
  },
  {
    id: "lead-loss-reasons",
    label: "Yo'qotish sabablari",
    path: "/settings/lead-loss-reasons",
    icon: Filter,
    permission: "lead_loss_reasons.view",
    description: "Nega lidlar yo'qotiladi",
    group: "Lidlar",
  },
  /*
   * MVP: SMS/Telegram shablonlari tashqi provayderga bog'liq — bo'lim
   * vaqtincha yashirilgan. Sahifa va marshrut saqlanib turadi
   * (`/settings/sms-templates`), faqat navigatsiyada ko'rinmaydi.
   */
  {
    id: "payment-methods",
    label: "To'lov turlari",
    path: "/settings/payment-methods",
    icon: Wallet,
    permission: "payment_methods.view",
    description: "Kassa va hisobot uchun to'lov turlari",
    group: "Moliya",
  },
  {
    id: "security",
    label: "Xavfsizlik",
    path: "/settings/security",
    icon: ShieldCheck,
    status: "coming-soon",
    description: "Audit log, sessiyalar, kirishlar",
    group: "Keyinroq",
  },
  {
    id: "subscription",
    label: "Obuna",
    path: "/settings/subscription",
    icon: CreditCard,
    status: "coming-soon",
    description: "Tarif, add-on do'kon, hisob-fakturalar",
    group: "Keyinroq",
  },
  {
    id: "integrations",
    label: "Integratsiyalar",
    path: "/settings/integrations",
    icon: Plug,
    status: "coming-soon",
    description: "Click, Payme, SMS provayder, telefoniya",
    group: "Keyinroq",
  },
];

const GROUP_ORDER = ["Markaz", "Jamoa", "O'quv", "Lidlar", "Moliya", "Keyinroq"];

export default function SettingsLayout() {
  const { can } = usePermission();

  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: SECTIONS.filter((section) => section.group === group),
  })).filter((entry) => entry.items.length > 0);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Sozlamalar"
        subtitle="Markaz, jamoa, lidlar va o'quv jarayoni sozlamalari — hammasi bitta joyda"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav
            aria-label="Sozlamalar bo'limlari"
            className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-5"
          >
            {groups.map(({ group, items }) => {
              const comingSoon = group === "Keyinroq";
              return (
                <div key={group} className="contents lg:flex lg:flex-col lg:gap-1">
                  <h2
                    className={cn(
                      "hidden w-full px-2 text-xs font-bold uppercase tracking-wider lg:block",
                      comingSoon ? "text-ink-muted/70" : "text-ink-muted",
                    )}
                  >
                    {comingSoon ? "Keyinroq" : group}
                  </h2>

                  {items.map((section) => {
                    const Icon = section.icon;
                    const allowed = !section.permission || can(section.permission);
                    const disabled = !allowed || section.status === "coming-soon";

                    if (disabled) {
                      return (
                        <span
                          key={section.id}
                          aria-disabled="true"
                          title={
                            section.status === "coming-soon"
                              ? "Bu bo'lim keyingi bosqichda qo'shiladi"
                              : "Bu bo'limga ruxsatingiz yo'q"
                          }
                          className="inline-flex min-h-[40px] cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-ink-muted/50"
                        >
                          <Icon className="h-4 w-4 flex-none" />
                          <span className="truncate">{section.label}</span>
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={section.id}
                        to={section.path}
                        className="inline-flex min-h-[40px] items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-ink transition-colors hover:bg-surface-2"
                        activeProps={{
                          className:
                            "bg-action-soft font-semibold text-action-soft-text hover:bg-action-soft",
                        }}
                        activeOptions={{ exact: true }}
                      >
                        <Icon className="h-4 w-4 flex-none" />
                        <span className="truncate">{section.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 lg:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
