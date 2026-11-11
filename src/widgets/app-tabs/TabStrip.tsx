import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";

import { NAV_ITEMS, filterNavItems, isNavGroup } from "@/core/navigation";
import { usePermission } from "@/core/permission";
import { cn } from "@/shared/lib/cn";
import { useShellStore } from "@/shared/model";

interface TabStripProps {
  pathname: string;
}

/** Chrome-style tab strip: nav clicks open tabs, tabs switch with state preserved. */
export default function TabStrip({ pathname }: TabStripProps) {
  const navigate = useNavigate();
  const tabs = useShellStore((s) => s.tabs);
  const closeTab = useShellStore((s) => s.closeTab);
  const setPaletteOpen = useShellStore((s) => s.setPaletteOpen);
  const { role, can } = usePermission();

  /*
   * Ochilgan tablar ham rolga qarab filtrlanadi.
   *
   * Tablar `localStorage` da saqlanadi, shuning uchun boshqa rol bilan
   * kirilganda (yoki rol o'zgarganda) faqat o'sha rolga ochiq sahifalar
   * qoladi — aks holda o'qituvchida "Bosh sahifa", o'quvchida "Moliya"
   * tab'i ochiq turardi va bosilganda bo'sh/ruxsatsiz sahifa ochilardi.
   */
  const allowedPrefixes = useMemo(() => {
    const prefixes: string[] = [];
    for (const item of filterNavItems(NAV_ITEMS, role, (p) => can(p as never))) {
      if (isNavGroup(item)) {
        for (const child of item.items) prefixes.push(child.href);
      } else {
        prefixes.push(item.href);
      }
    }
    return prefixes;
  }, [role, can]);

  const visibleTabs = useMemo(
    () =>
      tabs.filter((tab) =>
        // Joriy sahifa har doim ko'rinadi (masalan, rahbariyat URL orqali
        // `/cabinet` ga kirsa) — aks holda faol tab yo'qolib, chalkashlik
        // bo'lardi.
        tab.href === pathname ||
        allowedPrefixes.some(
          (href) => tab.href === href || tab.href.startsWith(`${href}/`),
        ),
      ),
    [tabs, allowedPrefixes, pathname],
  );

  const go = (href: string) => navigate({ to: href as never });

  const handleClose = (href: string, index: number) => {
    const wasActive = href === pathname;
    closeTab(href);
    if (wasActive) {
      const remaining = visibleTabs.filter((t) => t.href !== href);
      const neighbour = remaining[index] ?? remaining[index - 1] ?? remaining[0];
      if (neighbour) go(neighbour.href);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next =
      e.key === "ArrowRight"
        ? visibleTabs[(index + 1) % visibleTabs.length]
        : visibleTabs[(index - 1 + visibleTabs.length) % visibleTabs.length];
    if (next) go(next.href);
  };

  if (visibleTabs.length === 0) return null;

  return (
    <div
      className="no-scrollbar sticky top-[60px] z-[29] flex h-[42px] flex-none items-end gap-0.5 overflow-x-auto bg-brand-800 px-2"
      role="tablist"
      aria-label="Ochiq sahifalar"
    >
      {visibleTabs.map((tab, index) => {
        const active = tab.href === pathname;
        return (
          <div
            key={tab.href}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "group relative flex h-[34px] min-w-[120px] max-w-[220px] items-center gap-2 rounded-t-md pl-3 pr-2 text-sm transition-colors",
              active
                ? "bg-background font-semibold text-ink"
                : "text-ink-on-dark-2 hover:bg-white/[0.06] hover:text-[#e6ecff]",
            )}
          >
            <button
              type="button"
              onClick={() => go(tab.href)}
              className="min-w-0 flex-1 truncate text-left"
            >
              {tab.label}
            </button>
            <button
              type="button"
              onClick={() => handleClose(tab.href, index)}
              aria-label={`${tab.label} sahifasini yopish`}
              className={cn(
                "inline-flex h-[22px] w-[22px] flex-none items-center justify-center rounded-xs opacity-65 transition-colors",
                active
                  ? "hover:bg-surface-3 hover:opacity-100 hover:text-ink"
                  : "hover:bg-white/[0.14] hover:text-white hover:opacity-100",
              )}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Yangi sahifa ochish"
        className="mb-1 ml-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-sm text-ink-on-dark-2 transition-colors hover:bg-white/[0.08] hover:text-white"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
