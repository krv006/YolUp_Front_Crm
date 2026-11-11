import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SidebarPos = "left" | "right";

export interface ShellTab {
  href: string;
  label: string;
}

interface ShellState {
  /** Sidebar can be pinned to either edge (persisted). */
  sidebarPos: SidebarPos;
  setSidebarPos: (pos: SidebarPos) => void;
  toggleSidebarPos: () => void;

  /** Desktop sidebar collapsed to the 72px icon rail (persisted). */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;

  /** Mobile drawer — ephemeral. */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;

  /** Command palette — ephemeral. */
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;

  /** Which quick-action sheet is open (student / payment). */
  quickAction: "student" | "payment" | null;
  setQuickAction: (action: "student" | "payment" | null) => void;

  /**
   * Filial konteksti — topbar'dagi tanlov bilan sahifa sarlavhalari bir xil
   * nomni ko'rsatishi uchun shu yerda saqlanadi.
   */
  activeBranchId: string | null;
  activeBranchName: string;
  setActiveBranch: (id: string | null, name: string) => void;

  /** Chrome-style tab strip. */
  tabs: ShellTab[];
  openTab: (tab: ShellTab) => void;
  closeTab: (href: string) => void;
  closeAllTabs: () => void;

  /**
   * Tab strip ko'rinishi (persisted). O'chirilganda ochilgan tablar
   * yo'qolmaydi — qayta yoqilganda eskisicha tiklanadi.
   */
  tabStripEnabled: boolean;
  setTabStripEnabled: (enabled: boolean) => void;
}

const HOME_TAB: ShellTab = { href: "/", label: "Bosh sahifa" };

export const useShellStore = create<ShellState>()(
  persist(
    (set) => ({
      sidebarPos: "left",
      setSidebarPos: (sidebarPos) => set({ sidebarPos }),
      toggleSidebarPos: () =>
        set((s) => ({ sidebarPos: s.sidebarPos === "left" ? "right" : "left" })),

      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      drawerOpen: false,
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
      toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),

      paletteOpen: false,
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),

      quickAction: null,
      setQuickAction: (quickAction) => set({ quickAction }),

      activeBranchId: null,
      activeBranchName: "Filial tanlanmagan",
      setActiveBranch: (activeBranchId, activeBranchName) =>
        set({ activeBranchId, activeBranchName }),

      tabs: [HOME_TAB],
      openTab: (tab) =>
        set((s) => {
          const existing = s.tabs.find((t) => t.href === tab.href);
          if (!existing) return { tabs: [...s.tabs, tab] };
          // Sarlavha aniqlashganda mavjud tab nomi yangilanadi (state churn yo'q).
          if (existing.label === tab.label) return s;
          return {
            tabs: s.tabs.map((t) => (t.href === tab.href ? { ...t, label: tab.label } : t)),
          };
        }),
      closeTab: (href) =>
        set((s) => {
          const next = s.tabs.filter((t) => t.href !== href);
          return { tabs: next.length ? next : [HOME_TAB] };
        }),
      closeAllTabs: () => set({ tabs: [HOME_TAB] }),

      tabStripEnabled: true,
      setTabStripEnabled: (tabStripEnabled) => set({ tabStripEnabled }),
    }),
    {
      name: "yolup_shell",
      partialize: (state) => ({
        sidebarPos: state.sidebarPos,
        sidebarCollapsed: state.sidebarCollapsed,
        tabStripEnabled: state.tabStripEnabled,
        tabs: state.tabs,
      }),
    },
  ),
);
