import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';

import { useAuthStore, useSession, useLogout } from '@/core/auth';
import { usePermission } from '@/core/permission';
import { AUTH_EXPIRED_EVENT } from '@/shared/api';
import { tokenStorage } from '@/shared/lib/token-storage';
import { useThemeStore } from '@/shared/model';
import { AuthLayout, DashboardLayout } from '@/app/layouts';
import LoginPage from '@/pages/login';
import OperatorPanel from '@/pages/operator';
import PasswordChange from '@/core/auth/ui/password-change';

function BootSplash() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-action/20 border-t-action" />
        <span className="text-sm text-ink-muted">Ishga tushirilmoqda…</span>
      </div>
    </div>
  );
}

export default function App() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const signOut = useAuthStore((state) => state.signOut);
  const { can, hasRole } = usePermission();
  const theme = useThemeStore((state) => state.theme);
  const applyTheme = useThemeStore((state) => state.applyTheme);

  // Token faqat birinchi renderda o'qiladi (login dan keyin sahifa qayta yuklanadi).
  const [hasToken] = useState(() => Boolean(tokenStorage.getAccess()));
  const session = useSession(hasToken);
  const logout = useLogout();

  // Mavzuni DOM ga qo'llaymiz (localStorage dan tiklangandan keyin).
  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sessiya tiklandi — foydalanuvchini store ga yozamiz.
  useEffect(() => {
    if (session.data) {
      setUser(session.data);
      if (session.data.tenant_id) tokenStorage.setTenantId(session.data.tenant_id);
      else tokenStorage.removeTenantId();
    }
  }, [session.data, setUser]);

  // Token muddati tugasa (axios interceptor) — tizimdan chiqaramiz.
  useEffect(() => {
    const handleExpired = () => signOut();
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [signOut]);

  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();

  /*
   * Rolga mos manzillar.
   *
   * Sidebar havolasini yashirish yetarli emas: manzilni qo'lda kiritish ham
   * mumkin. Shuning uchun o'qituvchi faqat o'z ish qurollariga, o'quvchi va
   * ota-ona esa faqat shaxsiy kabinetga kiritiladi. Boshqa manzil — kabinetga
   * qaytariladi.
   */
  const isStaffManager = hasRole(['ceo', 'admin']);
  const isTeacher = hasRole(['teacher']);
  useEffect(() => {
    if (!user) return;
    if (user.role === 'operator') {
      if (!pathname.startsWith('/cpanel')) navigate({ to: '/cpanel/tenants', replace: true });
      return;
    }
    if (pathname.startsWith('/cpanel')) {
      navigate({ to: '/', replace: true });
      return;
    }
    if (isStaffManager) return;
    const allowed = isTeacher ? ['/cabinet', '/groups', '/students', '/attendance'] : ['/cabinet'];
    const isAllowed = allowed.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (!isAllowed) navigate({ to: '/cabinet', replace: true });
  }, [user, isStaffManager, isTeacher, pathname, navigate]);

  // `/auth/me/` javobini kutamiz — shu vaqt ichida spinner.
  if (hasToken && session.isLoading) return <BootSplash />;

  // Kirilmagan — login sahifasi (qaysi manzilda bo'lishidan qat'i nazar).
  if (!user) {
    return (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    );
  }

  if (user.must_change_password)
    return (
      <PasswordChange onDone={() => void session.refetch()} onLogout={() => logout.mutate()} />
    );
  if (user.role === 'operator') return <OperatorPanel onLogout={() => logout.mutate()} />;

  const hasPermission = (permission: string) => can(permission as never);
  const hasRoleFn = (role: string) => hasRole([role as never]);

  return (
    <DashboardLayout
      user={user}
      tenant={null}
      hasPermission={hasPermission}
      hasRole={hasRoleFn}
      onLogout={() => logout.mutate()}
    >
      <Outlet />
    </DashboardLayout>
  );
}
