import type { ComponentType } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import {
  Banknote,
  HandCoins,
  LayoutDashboard,
  Percent,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/shared/ui/page-header";
import { usePermission, type Permission } from "@/core/permission";

interface FinanceSection {
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
 * Moliya hub'i — barcha kassa va hisob-kitob bo'limlari bitta `/finance`
 * navigatsiyasi ostida. `coming-soon` bo'limlar uchun sahifa hali yo'q:
 * ular o'chirilgan ko'rinishda turadi.
 */
const SECTIONS: FinanceSection[] = [
  {
    id: "overview",
    label: "Umumiy",
    path: "/finance",
    icon: LayoutDashboard,
    permission: "payments.view",
    description: "Tushum, xarajat va qarzlar bir ekranda",
    group: "Umumiy",
  },
  {
    id: "payments",
    label: "To'lovlar",
    path: "/finance/payments",
    icon: TrendingUp,
    permission: "payments.view",
    description: "Qabul qilingan to'lovlar va kvitansiyalar",
    group: "Kassa",
  },
  {
    id: "expenses",
    label: "Xarajatlar",
    path: "/finance/expenses",
    icon: TrendingDown,
    permission: "expenses.view",
    description: "Kassa chiqimlari va kategoriyalar",
    group: "Kassa",
  },
  {
    id: "cash",
    label: "Kassa smenasi",
    path: "/finance/cash",
    icon: Banknote,
    status: "coming-soon",
    description: "Smena ochish/yopish, kassa qoldig'i",
    group: "Kassa",
  },
  {
    id: "charges",
    label: "Hisob-fakturalar",
    path: "/finance/charges",
    icon: ReceiptText,
    permission: "charges.view",
    description: "Oylik hisob-kitob (billing) yozuvlari",
    group: "Hisob-kitob",
  },
  {
    id: "debts",
    label: "Qarzlar",
    path: "/finance/debts",
    icon: HandCoins,
    permission: "debts.view",
    description: "Qarzdor o'quvchilar va muddati o'tgan summalar",
    group: "Hisob-kitob",
  },
  {
    id: "discounts",
    label: "Chegirmalar",
    path: "/finance/discounts",
    icon: Percent,
    status: "coming-soon",
    description: "O'quvchi va guruh bo'yicha chegirmalar",
    group: "Hisob-kitob",
  },
];

const GROUP_ORDER = ["Umumiy", "Kassa", "Hisob-kitob"];

export default function FinanceLayout() {
  const { can } = usePermission();

  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: SECTIONS.filter((section) => section.group === group),
  })).filter((entry) => entry.items.length > 0);

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Moliya va kassa"
        subtitle="To'lovlar, hisob-fakturalar (billing) va qarzlar — bitta joyda"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav
            aria-label="Moliya bo'limlari"
            className="flex flex-wrap gap-1.5 lg:flex-col lg:gap-5"
          >
            {groups.map(({ group, items }) => (
              <div key={group} className="contents lg:flex lg:flex-col lg:gap-1">
                <h2 className="hidden w-full px-2 text-xs font-bold uppercase tracking-wider text-ink-muted lg:block">
                  {group}
                </h2>

                {items.map((section) => {
                  const Icon = section.icon;
                  const allowed = section.permission === undefined || can(section.permission);
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
            ))}
          </nav>
        </aside>

        <main className="min-w-0 lg:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
