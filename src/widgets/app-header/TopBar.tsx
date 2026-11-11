import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";

import { Kbd } from "@/shared/ui/kbd";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useShellStore, useThemeStore } from "@/shared/model";

interface BranchOption {
  id: string;
  name: string;
}

interface TopBarProps {
  branchName: string;
  branches: BranchOption[];
  activeBranchId: string | null;
  onSelectBranch: (id: string) => void;
  onAdd: () => void;
}

const NOTIFICATIONS = [
  { t: "12 ta to'lov kutilmoqda", m: "Bugungi kassa smenasi uchun", time: "5 daqiqa oldin" },
  { t: "3 ta qarzdor muddati o'tdi", m: "Umumiy qarz: 4.2 mln so'm", time: "28 daqiqa oldin" },
  { t: "Xona 305 to'la", m: "Kids Starter guruhi 16/16", time: "1 soat oldin" },
];

export default function TopBar({
  branchName,
  branches,
  activeBranchId,
  onSelectBranch,
  onAdd,
}: TopBarProps) {
  const toggleDrawer = useShellStore((s) => s.toggleDrawer);
  const setPaletteOpen = useShellStore((s) => s.setPaletteOpen);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <header className="sticky top-0 z-30 flex h-[60px] flex-none items-center gap-3 border-b border-border bg-surface px-5">
      <button
        type="button"
        onClick={toggleDrawer}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
        aria-label="Menyuni ochish"
      >
        <Menu className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="flex h-10 w-full min-w-0 max-w-[420px] items-center gap-3 rounded-md border border-border-strong bg-surface-inset pl-4 pr-3 text-sm text-ink-muted transition-colors hover:border-ink-muted hover:bg-surface md:max-w-[42vw]"
        aria-label="Global qidiruv"
      >
        <Search className="h-4 w-4 flex-none" />
        <span className="truncate">O'quvchi, guruh yoki amal qidirish…</span>
        <Kbd className="ml-auto hidden sm:inline-flex">Ctrl K</Kbd>
      </button>

      <span className="flex-1" />

      {/* Branch switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-10 max-w-[240px] items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-2">
          <Building2 className="h-4 w-4 flex-none text-ink-muted" />
          <span className="hidden truncate sm:inline">{branchName}</span>
          <ChevronDown className="h-4 w-4 flex-none text-ink-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Filial</DropdownMenuLabel>
          {branches.map((b) => (
            <DropdownMenuItem key={b.id} onSelect={() => onSelectBranch(b.id)}>
              <Building2 className="h-4 w-4" />
              <span className="flex-1 truncate">{b.name}</span>
              {b.id === activeBranchId && <Check className="h-4 w-4 text-action" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add */}
      <Button onClick={onAdd} className="hidden sm:inline-flex">
        <Plus className="h-4 w-4" />
        Qo'shish
      </Button>
      <Button onClick={onAdd} size="icon" className="sm:hidden" aria-label="Qo'shish">
        <Plus className="h-4 w-4" />
      </Button>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
          aria-label="Bildirishnomalar"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-surface bg-danger" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Bildirishnomalar</DropdownMenuLabel>
          {NOTIFICATIONS.map((n) => (
            <DropdownMenuItem key={n.t} className="flex-col items-start gap-0.5 py-2">
              <span className="text-sm font-semibold text-ink">{n.t}</span>
              <span className="text-xs text-ink-muted">{n.m}</span>
              <time className="text-[0.75rem] text-ink-muted">{n.time}</time>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="hidden h-10 w-10 items-center justify-center rounded-md text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink lg:inline-flex"
        aria-label="Mavzuni almashtirish"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
