import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/shared/constants";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  applyTheme: (theme: Theme) => void;
}

/**
 * Mavzuni `<html>` ga yozadi.
 * `data-theme` — YolUp tokenlari (`index.css`) uchun,
 * `dark` klassi — Tailwind `dark:` variantlari uchun.
 */
function paint(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => {
        paint(theme);
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const next: Theme = state.theme === "light" ? "dark" : "light";
          paint(next);
          return { theme: next };
        }),
      applyTheme: (theme) => {
        paint(theme);
        set({ theme });
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
