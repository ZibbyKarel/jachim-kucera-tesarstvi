import type { Config } from 'tailwindcss'
import { PALETTE } from './lib/palette'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // "Materiály řemesla" paleta — steel/zinek, slate, patina (jediný akcent), paper.
        // Hex hodnoty a WCAG kontrastní poznámky ke každému tokenu žijí v
        // lib/palette.ts (jediný zdroj pravdy, viz D-003) — tady se jen mapují
        // na strukturu Tailwind tokenů, aby zůstaly beze změny utility třídy
        // jako bg-paper, text-patina, bg-slate-soft apod.
        paper: PALETTE.paper,
        slate: PALETTE.slate,
        steel: PALETTE.steel,
        patina: PALETTE.patina,
      },
      fontFamily: {
        display: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        widest: '0.2em',
      },
      maxWidth: {
        content: '1200px',
      },
      transitionTimingFunction: {
        craft: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
    },
  },
  plugins: [],
}

export default config
