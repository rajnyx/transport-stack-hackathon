/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '360px',
      'sm': '600px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          deep: "var(--color-primary-deep)",
          tint: "var(--color-primary-tint)",
          container: "var(--color-primary-container)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          container: "var(--color-secondary-container)",
        },
        tertiary: {
          DEFAULT: "var(--color-tertiary)",
        },
        navy: {
          DEFAULT: "var(--color-navy)",
          dark: "var(--color-navy-dark)",
        },
        teal: {
          DEFAULT: "var(--color-teal)",
          hover: "var(--color-teal-hover)",
          tint: "var(--color-teal-tint)",
        },
        transit: {
          bg: "var(--color-background)",
          border: "var(--color-border)",
          borderSubtle: "var(--color-border-subtle)",
          text: "var(--color-text)",
          textMuted: "var(--color-text-muted)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          bg: "var(--color-background)",
          dim: "var(--color-surface-dim)",
          low: "var(--color-surface-low)",
          container: "var(--color-surface-container)",
          high: "var(--color-surface-high)",
          highest: "var(--color-surface-highest)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
        },
        tx: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          subtle: "var(--color-text-subtle)",
          inverse: "var(--color-text-inverse)",
        },
        crowd: {
          low: "var(--color-crowd-low)",
          'low-tint': "var(--color-crowd-low-tint)",
          'low-border': "var(--color-crowd-low-border)",
          mod: "var(--color-crowd-mod)",
          'mod-text': "var(--color-crowd-mod-text)",
          'mod-tint': "var(--color-crowd-mod-tint)",
          'mod-border': "var(--color-crowd-mod-border)",
          high: "var(--color-crowd-high)",
          'high-tint': "var(--color-crowd-high-tint)",
          'high-border': "var(--color-crowd-high-border)",
          unknown: "var(--color-crowd-unknown)",
          'unknown-tint': "var(--color-crowd-unknown-tint)",
          'unknown-border': "var(--color-crowd-unknown-border)",
        }
      },
      borderRadius: {
        control: "var(--radius-control)",
        panel: "var(--radius-panel)",
        badge: "var(--radius-badge)",
        chip: "var(--radius-chip)",
        button: "var(--radius-button)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        overlay: "var(--shadow-overlay)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        medium: "var(--duration-medium)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        transit: "var(--ease-transit)",
      }
    },
  },
  plugins: [],
}
