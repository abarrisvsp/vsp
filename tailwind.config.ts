import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // shadcn CSS variable bindings (preserved)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        // VSP design tokens
        bg: '#0b0a09',
        'bg-elev': '#141210',
        'bg-soft': '#1b1815',
        line: '#2a2622',
        'line-soft': '#1f1c19',
        ink: '#f5f1ea',
        'ink-dim': '#b8b1a4',
        'ink-mute': '#7a7468',
        amber: '#ef4444',
        'amber-soft': '#f87171',
        magenta: '#ec4899',
        cyan: '#3b82f6',
        'logo-red': '#dc2626',
        'logo-blue': '#2563eb',
        paper: '#f1ece2',
        'ink-on-paper': '#1a1714',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Cormorant Garamond', 'Times New Roman', 'serif'],
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      maxWidth: { container: '1440px' },
      animation: {
        'edit-pulse': 'editPulse 2s ease-in-out infinite',
      },
      keyframes: {
        editPulse: {
          '0%, 100%': { outlineColor: 'rgba(240, 192, 64, 0.3)' },
          '50%': { outlineColor: 'rgba(240, 192, 64, 0.9)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
