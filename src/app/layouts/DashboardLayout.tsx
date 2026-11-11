import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/widgets/app-sidebar";
import { TopBar } from "@/widgets/app-header";
import { TabStrip } from "@/widgets/app-tabs";
import { CommandPalette } from "@/widgets/command-palette";
import { QuickActionSheets } from "@/widgets/quick-actions";
import { ROLE_LABELS, type User } from "@/core/auth";
import { PAGE_LABELS } from "@/core/navigation";
import { ENDPOINTS, http } from "@/shared/api";
import type { Paginated } from "@/shared/api";
import { cn } from "@/shared/lib/cn";
import { useShellStore } from "@/shared/model";
import type { Branch } from "@/modules/branches";
import type { Tenant } from "@/modules/tenants";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
  tenant: Tenant | null;
  hasPermission: (p: string) => boolean;
  hasRole: (r: string) => boolean;
  onLogout: () => void;
}

export default function DashboardLayout({
  children,
  user,
  hasPermission,
  onLogout,
}: DashboardLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sidebarPos = useShellStore((s) => s.sidebarPos);
  const sidebarCollapsed = useShellStore((s) => s.sidebarCollapsed);
  const tabStripEnabled = useShellStore((s) => s.tabStripEnabled);
  const openTab = useShellStore((s) => s.openTab);
  const setQuickAction = useShellStore((s) => s.setQuickAction);

  const isRight = sidebarPos === "right";

  /* --- Tab strip: every navigation opens (or focuses) a tab ---------------
   * Tafsilot sahifalari (`/groups/{id}`) uchun bo'lim nomi ishlatiladi; sahifa
   * o'zi yuklangach tab nomini aniqroq nom bilan yangilaydi. */
  useEffect(() => {
    const label =
      PAGE_LABELS[pathname] ?? PAGE_LABELS[`/${pathname.split("/").filter(Boolean)[0] ?? ""}`];
    if (label) openTab({ href: pathname, label });
  }, [pathname, openTab]);

  /* --- Branch context ----------------------------------------------------- */
  const branchesQuery = useQuery({
    queryKey: ["context", "branches"],
    queryFn: () => http.list<Branch>(ENDPOINTS.branches.root, { page_size: 100 }),
  });

  const activeBranchId = useShellStore((s) => s.activeBranchId);
  const activeBranchName = useShellStore((s) => s.activeBranchName);
  const setActiveBranch = useShellStore((s) => s.setActiveBranch);

  // Birinchi yuklashda foydalanuvchining filialini tanlaymiz.
  useEffect(() => {
    if (activeBranchId === null && user.branch_id) {
      setActiveBranch(user.branch_id, activeBranchName);
    }
  }, [activeBranchId, activeBranchName, user.branch_id, setActiveBranch]);

  const activeBranchQuery = useQuery<Branch | null>({
    queryKey: ["context", "branch", activeBranchId],
    enabled: Boolean(activeBranchId),
    retry: false,
    queryFn: () => http.get<Branch>(ENDPOINTS.branches.byId(activeBranchId as string)),
  });

  const branches = (branchesQuery.data as Paginated<Branch> | undefined)?.results ?? [];

  // Tanlangan filial nomini store'ga yozamiz — sahifalar shundan o'qiydi.
  // Nom o'zgarmagan bo'lsa yozmaymiz: aks holda har renderda yangi state.
  useEffect(() => {
    const name =
      activeBranchQuery.data?.name ?? branches.find((b) => b.id === activeBranchId)?.name;
    if (name && name !== activeBranchName) setActiveBranch(activeBranchId, name);
  }, [activeBranchQuery.data, branches, activeBranchId, activeBranchName, setActiveBranch]);

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const userName = `${user.first_name} ${user.last_name}`.trim();

  return (
    <div
      className={cn(
        "min-h-screen bg-background md:grid",
        isRight
          ? cn(
              "md:grid-cols-[minmax(0,1fr)_72px]",
              !sidebarCollapsed && "lg:grid-cols-[minmax(0,1fr)_264px]",
            )
          : cn(
              "md:grid-cols-[72px_minmax(0,1fr)]",
              !sidebarCollapsed && "lg:grid-cols-[264px_minmax(0,1fr)]",
            ),
      )}
    >
      <Sidebar
        pathname={pathname}
        userName={userName}
        userRoleLabel={roleLabel}
        role={user.role}
        hasPermission={hasPermission}
        onLogout={onLogout}
      />

      <div className={cn("flex min-w-0 flex-col", isRight ? "md:order-1" : "md:order-2")}>
        <TopBar
          branchName={activeBranchName}
          branches={branches.map((b) => ({ id: b.id, name: b.name }))}
          activeBranchId={activeBranchId}
          onSelectBranch={(id) => {
            const found = branches.find((b) => b.id === id);
            setActiveBranch(id, found?.name ?? activeBranchName);
          }}
          onAdd={() => setQuickAction("student")}
        />
        {tabStripEnabled && <TabStrip pathname={pathname} />}

        <main className="flex-1 px-5 pb-10 pt-6 md:px-7">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      <QuickActionSheets />
      <CommandPalette
        role={user.role}
        hasPermission={hasPermission}
        onAddStudent={() => setQuickAction("student")}
        onAddPayment={() => setQuickAction("payment")}
        onLogout={onLogout}
      />
    </div>
  );
}
