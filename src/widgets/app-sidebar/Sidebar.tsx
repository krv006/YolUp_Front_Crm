import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut, Menu, Moon, Search, Settings2, Sun, X } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Avatar } from "@/shared/ui/avatar";
import { Kbd } from "@/shared/ui/kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  NAV_ITEMS,
  filterNavItems,
  isNavGroup,
  navItemKey,
  type NavItem,
} from "@/core/navigation";
import { useShellStore, useThemeStore } from "@/shared/model";

interface SidebarProps {
  pathname: string;
  userName: string;
  userRoleLabel: string;
  role: string | undefined;
  hasPermission: (p: string) => boolean;
  onLogout: () => void;
}

/** Labels are only shown on the wide (lg) sidebar and never in the icon rail. */
const LABEL_VISIBLE = "md:hidden lg:inline";

/** Havola joriy sahifagami ("/" faqat aniq mos kelganda faol). */
function matches(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({
  pathname,
  userName,
  userRoleLabel,
  role,
  hasPermission,
  onLogout,
}: SidebarProps) {
  const sidebarPos = useShellStore((s) => s.sidebarPos);
  const collapsed = useShellStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useShellStore((s) => s.toggleSidebarCollapsed);
  const drawerOpen = useShellStore((s) => s.drawerOpen);
  const setDrawerOpen = useShellStore((s) => s.setDrawerOpen);
  const setPaletteOpen = useShellStore((s) => s.setPaletteOpen);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const isRight = sidebarPos === "right";
  const can = useCallback((p: string) => hasPermission(p), [hasPermission]);
  const items = useMemo(() => filterNavItems(NAV_ITEMS, role as never, can), [role, can]);

  const [expanded, setExpanded] = useState<string[]>([]);

  // Faol sahifaning guruhini avtomatik ochamiz.
  useEffect(() => {
    const open = items
      .filter(isNavGroup)
      .filter(
        (group) =>
          (group.href ? matches(pathname, group.href) : false) ||
          group.items.some((child) => matches(pathname, child.href)),
      )
      .map(navItemKey);
    if (!open.length) return;
    setExpanded((prev) => {
      const next = Array.from(new Set([...prev, ...open]));
      // Hech narsa qo'shilmagan bo'lsa, eski massivni qaytaramiz —
      // aks holda har renderda yangi state yaratilib, cheksiz sikl bo'ladi.
      return next.length === prev.length ? prev : next;
    });
  }, [pathname, items]);

  const isActive = (href: string) => matches(pathname, href);

  const go = () => setDrawerOpen(false);

  const toggleItem = (key: string) =>
    setExpanded((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <>
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[70] bg-[rgba(10,15,45,0.45)] md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "z-[80] flex h-screen flex-col bg-brand-900 text-ink-on-dark-2 transition-transform duration-300 ease-out",
          "fixed inset-y-0 w-[min(300px,86vw)] md:sticky md:top-0 md:z-40 md:w-full md:translate-x-0 md:transition-none",
          isRight
            ? "right-0 translate-x-[105%] md:order-2 md:border-l md:border-white/[0.06]"
            : "left-0 -translate-x-[105%] md:order-1 md:border-r md:border-white/[0.06]",
          drawerOpen && "!translate-x-0",
        )}
      >
        {/* Head */}
        <div
          className={cn(
            "flex flex-none items-center gap-3 pb-4 pt-5",
            collapsed ? "px-4" : "px-3 lg:px-5",
          )}
        >
          <img
            src="/yolup-mark.png"
            alt="YolUp"
            width={34}
            height={34}
            className={cn("flex-none", collapsed && "lg:hidden")}
          />
          <span
            className={cn(
              "font-display text-xl font-extrabold tracking-[-0.02em] text-white",
              collapsed ? "hidden" : LABEL_VISIBLE,
            )}
          >
            YolUp
          </span>
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? "Yon panelni ochish" : "Yon panelni yig'ish"}
            aria-label={collapsed ? "Yon panelni ochish" : "Yon panelni yig'ish"}
            aria-pressed={collapsed}
            className={cn(
              "hidden h-9 w-9 flex-none items-center justify-center rounded-md text-ink-on-dark-2 transition-colors hover:bg-white/[0.08] hover:text-white lg:inline-flex",
              collapsed ? "mx-auto" : "ml-auto",
            )}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-on-dark-2 transition-colors hover:bg-white/[0.08] hover:text-white md:hidden"
            aria-label="Menyuni yopish"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav — yassi ro'yxat, scrollbar yashirilgan */}
        <nav className="no-scrollbar flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4 pt-2">
          {items.map((item) => (
            <NavRow
              key={navItemKey(item)}
              item={item}
              collapsed={collapsed}
              isActive={isActive}
              expanded={expanded.includes(navItemKey(item))}
              onToggle={() => toggleItem(navItemKey(item))}
              onNavigate={go}
            />
          ))}
        </nav>

        {/* Foot — user */}
        <div className="flex-none border-t border-white/[0.06] p-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-ink-on-dark transition-colors hover:bg-white/[0.06] focus-visible:outline-none",
                collapsed ? "md:justify-center" : "md:justify-center lg:justify-start",
              )}
            >
              <Avatar name={userName} tone="navy" />
              <span className={cn("min-w-0 flex-1", collapsed ? "hidden" : LABEL_VISIBLE)}>
                <span className="block truncate text-sm font-semibold">{userName}</span>
                <span className="block truncate text-[0.75rem] text-[#8b96c4]">
                  {userRoleLabel}
                </span>
              </span>
              <ChevronDown
                className={cn("h-4 w-4 flex-none", collapsed ? "hidden" : LABEL_VISIBLE)}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-60">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings2 className="h-4 w-4" />
                  Sozlamalar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setPaletteOpen(true)}>
                <Search className="h-4 w-4" />
                Buyruq paneli
                <Kbd className="ml-auto">Ctrl K</Kbd>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Yorug' mavzu" : "Qorong'i mavzu"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={onLogout}
                className="text-danger-ink focus:bg-danger-soft"
              >
                <LogOut className="h-4 w-4" />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}

/* -------------------------------------------------------------------------- */

interface NavRowProps {
  item: NavItem;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

function NavRow({ item, collapsed, isActive, expanded, onToggle, onNavigate }: NavRowProps) {
  const Icon = item.icon;
  const group = isNavGroup(item);
  const selfActive = item.href ? isActive(item.href) : false;
  const active = selfActive || (group && item.items.some((child) => isActive(child.href)));

  const base = cn(
    "flex min-h-[42px] items-center gap-3 rounded-md px-3 text-[15px] font-medium transition-colors",
    collapsed ? "justify-start md:justify-center" : "justify-start md:justify-center lg:justify-start",
    active
      ? "bg-[var(--nav-active)] font-semibold text-white"
      : "text-ink-on-dark-2 hover:bg-white/[0.06] hover:text-[#e6ecff]",
  );

  // Guruh — havola emas: butun satr (nomi + o'q) bitta tugma bo'lib ochadi/yig'adi.
  if (group) {
    return (
      <div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          title={item.label}
          className={cn(base, "w-full")}
        >
          {Icon && <Icon className="h-[18px] w-[18px] flex-none" />}
          <span className={cn("flex-1 truncate text-left", collapsed ? "hidden" : LABEL_VISIBLE)}>
            {item.label}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-none transition-transform",
              collapsed ? "hidden" : LABEL_VISIBLE,
              expanded && "rotate-180",
            )}
          />
        </button>

        {expanded && (
          <div className={cn("mt-0.5 flex flex-col gap-0.5 md:hidden", !collapsed && "lg:flex")}>
            {item.items.map((child) => {
              const ChildIcon = child.icon;
              const childActive = isActive(child.href);
              return (
                <Link
                  key={child.href}
                  to={child.href}
                  onClick={onNavigate}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-[38px] items-center gap-3 rounded-md py-2 pl-11 pr-3 text-sm transition-colors",
                    childActive
                      ? "bg-[var(--nav-active-weak)] font-semibold text-white"
                      : "text-ink-on-dark-2 hover:bg-white/[0.06] hover:text-[#e6ecff]",
                  )}
                >
                  {ChildIcon && <ChildIcon className="h-4 w-4 flex-none" />}
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={base}
      aria-current={selfActive ? "page" : undefined}
    >
      {Icon && <Icon className="h-[18px] w-[18px] flex-none" />}
      <span className={cn("flex-1 truncate", collapsed ? "hidden" : LABEL_VISIBLE)}>
        {item.label}
      </span>
      {typeof item.count === "number" && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[0.75rem] font-bold",
            collapsed ? "hidden" : LABEL_VISIBLE,
            active ? "bg-[var(--nav-count-active)] text-[#9fe8ff]" : "bg-white/10 text-[#cfe0ff]",
          )}
        >
          {item.count}
        </span>
      )}
      <span
        className={cn(
          "h-[5px] w-[5px] rounded-full bg-brand-400",
          collapsed ? "hidden" : LABEL_VISIBLE,
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}
