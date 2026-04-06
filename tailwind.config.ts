import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          400: '#1D9E75',
          600: '#0F6E56',
          800: '#085041',
          900: '#04342C',
        },
        surface: {
          0:   'hsl(var(--surface-0))',
          1:   'hsl(var(--surface-1))',
          2:   'hsl(var(--surface-2))',
          3:   'hsl(var(--surface-3))',
        },
        ink: {
          primary:   'hsl(var(--ink-primary))',
          secondary: 'hsl(var(--ink-secondary))',
          tertiary:  'hsl(var(--ink-tertiary))',
          brand:     'hsl(var(--ink-brand))',
        },
        border: {
          subtle: 'hsl(var(--border-subtle))',
          DEFAULT:'hsl(var(--border-default))',
          strong: 'hsl(var(--border-strong))',
        },
        status: {
          success: '#1D9E75',
          warning: '#EF9F27',
          danger:  '#E24B4A',
          info:    '#378ADD',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.04)',
        modal: '0 20px 60px rgba(0,0,0,.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s cubic-bezier(.22,1,.36,1)',
        'scale-in': 'scaleIn 0.15s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.6' } },
      },
    },
  },
  plugins: [],
}
export default config
