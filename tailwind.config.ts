import type { Config } from "tailwindcss";

/**
 * Tailwind theme mapped onto the YolUp design tokens.
 * Every value here resolves to a CSS variable defined in `src/index.css`,
 * so light/dark switch automatically and nothing is hard-coded twice.
 */
const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "Segoe UI", "system-ui", "sans-serif"],
        display: ['"Manrope"', "Segoe UI", "system-ui", "sans-serif"],
      },
      colors: {
        /* semantic (shadcn-compatible names) */
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        divider: "var(--divider)",
        input: "var(--border-strong)",
        ring: "var(--action)",
        background: "var(--bg)",
        foreground: "var(--text)",
        card: { DEFAULT: "var(--surface)", foreground: "var(--text)" },
        popover: { DEFAULT: "var(--surface)", foreground: "var(--text)" },
        primary: { DEFAULT: "var(--action)", foreground: "#ffffff" },
        secondary: { DEFAULT: "var(--surface-2)", foreground: "var(--text)" },
        muted: { DEFAULT: "var(--surface-2)", foreground: "var(--text-muted)" },
        accent: { DEFAULT: "var(--surface-2)", foreground: "var(--text)" },
        destructive: { DEFAULT: "var(--danger)", foreground: "#ffffff" },

        /* surfaces */
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
          inset: "var(--surface-inset)",
        },

        /* text inks (secondary/muted/on-dark) */
        ink: {
          DEFAULT: "var(--text)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          "on-dark": "var(--text-on-dark)",
          "on-dark-2": "var(--text-on-dark-secondary)",
        },

        /* brand */
        brand: {
          900: "var(--brand-900)",
          800: "var(--brand-800)",
          700: "var(--brand-700)",
          600: "var(--brand-600)",
          500: "var(--brand-500)",
          400: "var(--brand-400)",
          300: "var(--brand-300)",
          DEFAULT: "var(--brand-500)",
        },
        action: {
          DEFAULT: "var(--action)",
          hover: "var(--action-hover)",
          active: "var(--action-active)",
          soft: "var(--action-soft)",
          "soft-text": "var(--action-soft-text)",
        },

        /* status */
        success: {
          DEFAULT: "var(--success)",
          ink: "var(--success-ink)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          ink: "var(--warning-ink)",
          soft: "var(--warning-soft)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          ink: "var(--danger-ink)",
          soft: "var(--danger-soft)",
        },
        info: {
          DEFAULT: "var(--info)",
          soft: "var(--info-soft)",
        },
        neutral: { soft: "var(--neutral-soft)" },

        /* data-viz */
        viz: {
          1: "var(--viz-1)",
          2: "var(--viz-2)",
          3: "var(--viz-3)",
          4: "var(--viz-4)",
          5: "var(--viz-5)",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        full: "999px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(10, 15, 45, 0.06)",
        sm: "0 1px 3px rgba(10, 15, 45, 0.07), 0 4px 14px rgba(10, 15, 45, 0.06)",
        md: "0 2px 6px rgba(10, 15, 45, 0.08), 0 12px 32px rgba(10, 15, 45, 0.1)",
        sheet: "-12px 0 40px rgba(10, 15, 45, 0.16)",
        "sheet-bottom": "0 -12px 40px rgba(10, 15, 45, 0.16)",
        palette: "0 24px 64px rgba(10, 15, 45, 0.22)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "toast-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        "sheet-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "toast-in": "toast-in 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        "sheet-in-right": "sheet-in-right 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
