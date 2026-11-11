import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CornerDownLeft,
  Moon,
  Receipt,
  Search,
  Sun,
  UserPlus,
} from "lucide-react";
import type { ComponentType } from "react";

import { cn } from "@/shared/lib/cn";
import { Kbd } from "@/shared/ui/kbd";
import { NAV_ITEMS, filterNavItems, isNavGroup } from "@/core/navigation";
import { useShellStore, useThemeStore } from "@/shared/model";

interface CommandPaletteProps {
  role: string | undefined;
  hasPermission: (p: string) => boolean;
  onAddStudent: () => void;
  onAddPayment: () => void;
  onLogout: () => void;
}

interface Item {
  group: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  run: () => void;
}

export default function CommandPalette({
  role,
  hasPermission,
  onAddStudent,
  onAddPayment,
  onLogout,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const open = useShellStore((s) => s.paletteOpen);
  const setOpen = useShellStore((s) => s.setPaletteOpen);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const nav = filterNavItems(NAV_ITEMS, role as never, (p) => hasPermission(p));
    const navItems: Item[] = nav.flatMap((item) => {
      // Guruh o'zi havola emas — paletga faqat haqiqiy sahifalar tushadi.
      const href = item.href;
      const self: Item[] = href
        ? [
            {
              group: "Sahifalar",
              label: item.label,
              icon: item.icon,
              run: () => navigate({ to: href as never }),
            },
          ]
        : [];
      const children: Item[] = isNavGroup(item)
        ? item.items.map((child) => ({
            group: "Sahifalar",
            label: `${item.label} · ${child.label}`,
            icon: child.icon,
            run: () => navigate({ to: child.href as never }),
          }))
        : [];
      return [...self, ...children];
    });

    const actions: Item[] = [
      { group: "Amallar", label: "O'quvchi qo'shish", icon: UserPlus, run: onAddStudent },
      { group: "Amallar", label: "To'lov qabul qilish", icon: Receipt, run: onAddPayment },
      {
        group: "Amallar",
        label: theme === "dark" ? "Yorug' mavzuga o'tish" : "Qorong'i mavzuga o'tish",
        icon: theme === "dark" ? Sun : Moon,
        run: toggleTheme,
      },
      { group: "Amallar", label: "Chiqish", run: onLogout },
    ];

    return [...navItems, ...actions];
  }, [role, hasPermission, navigate, onAddStudent, onAddPayment, theme, toggleTheme, onLogout]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Global Ctrl/Cmd+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  if (!open) return null;

  const runItem = (item: Item | undefined) => {
    if (!item) return;
    setOpen(false);
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      runItem(filtered[active]);
    }
  };

  // Group the flat, filtered list while keeping the active index global.
  const groups: { label: string; items: { item: Item; index: number }[] }[] = [];
  filtered.forEach((item, index) => {
    const last = groups[groups.length - 1];
    if (last && last.label === item.group) last.items.push({ item, index });
    else groups.push({ label: item.group, items: [{ item, index }] });
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[rgba(10,15,45,0.5)] px-4 pb-4 backdrop-blur-[2px]"
      style={{ paddingTop: "max(10vh, 64px)" }}
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        className="flex max-h-[min(70vh,560px)] w-full max-w-[620px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Buyruq paneli"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-divider px-5 py-4">
          <Search className="h-4 w-4 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Sahifa, o'quvchi yoki amal qidirish…"
            aria-label="Buyruq qidirish"
            autoComplete="off"
            className="flex-1 border-0 bg-transparent text-lg text-ink outline-none placeholder:text-ink-muted"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div className="grid gap-0.5 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-muted">Hech narsa topilmadi</p>
          )}
          {groups.map((group) => (
            <div key={group.label} className="grid gap-0.5">
              <span className="px-3 pb-1 pt-3 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                {group.label}
              </span>
              {group.items.map(({ item, index }) => {
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.group}-${item.label}`}
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => runItem(item)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-[15px] transition-colors",
                      index === active
                        ? "bg-action-soft text-action-soft-text"
                        : "text-ink hover:bg-surface-2",
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 flex-none" />}
                    <span className="flex-1 truncate">{item.label}</span>
                    {index === active && <CornerDownLeft className="h-4 w-4 flex-none" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex gap-4 border-t border-divider px-5 py-2 text-xs text-ink-muted">
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> navigatsiya
          </span>
          <span>
            <Kbd>Enter</Kbd> tanlash
          </span>
          <span>
            <Kbd>Esc</Kbd> yopish
          </span>
        </div>
      </div>
    </div>
  );
}
