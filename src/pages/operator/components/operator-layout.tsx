import type { ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Building2, ClipboardList, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';

export function OperatorLayout({
  children,
  onLogout,
}: {
  children: ReactNode;
  onLogout: () => void;
}) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const links = [
    {
      to: '/cpanel/tenants' as const,
      label: 'Markazlar',
      icon: Building2,
      active: !path.startsWith('/cpanel/audit'),
    },
    {
      to: '/cpanel/audit' as const,
      label: 'Faoliyat jurnali',
      icon: ClipboardList,
      active: path.startsWith('/cpanel/audit'),
    },
  ];
  return (
    <div className="min-h-screen bg-background text-ink md:flex">
      <aside className="border-b border-white/10 bg-brand-900 text-ink-on-dark md:sticky md:top-0 md:flex md:h-screen md:w-[240px] md:flex-none md:flex-col md:border-b-0">
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/yolup-mark.png" alt="YolUp" className="h-10 w-10" />
          <div>
            <div className="font-display text-lg font-bold text-white">YolUp</div>
            <div className="text-xs text-ink-on-dark-2">Operator paneli</div>
          </div>
        </div>
        <div className="px-3 pb-3">
          <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-brand-300" /> C-Panel
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-on-dark-2">Markazlar boshqaruvi</p>
          </div>
        </div>
        <nav
          aria-label="Operator navigatsiyasi"
          className="flex gap-1 overflow-x-auto px-3 pb-3 md:grid md:content-start"
        >
          <p className="hidden px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-ink-on-dark-2 md:block">
            Boshqaruv
          </p>
          {links.map(({ to, label, icon: Icon, active }) => (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-10 flex-none items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors',
                active
                  ? 'bg-action text-white'
                  : 'text-ink-on-dark-2 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden flex-1 md:block" />
        <div className="hidden border-t border-white/10 p-3 md:block">
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-ink-on-dark-2 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-[18px] w-[18px]" /> Chiqish
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-5 sm:px-8">
          <div>
            <p className="text-sm font-semibold">YolUp C-Panel</p>
            <p className="text-xs text-ink-muted">Operator ish muhiti</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Chiqish
          </Button>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
