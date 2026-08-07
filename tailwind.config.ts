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
        // "Dřevo a čas" paleta — paper, timber (tmavá dřevěná), oak (střední
        // dřevěná), ember (jediný akcent). Hex hodnoty a WCAG kontrastní
        // poznámky ke každému tokenu žijí v lib/palette.ts (jediný zdroj
        // pravdy, viz D-024) — tady se jen mapují na strukturu Tailwind
        // tokenů, aby vznikly utility třídy jako bg-paper, text-ember,
        // bg-timber-soft apod.
        paper: PALETTE.paper,
        timber: PALETTE.timber,
        oak: PALETTE.oak,
        ember: PALETTE.ember,
      },
      fontFamily: {
        // Fraunces (display) a Archivo (body) a IBM Plex Mono (mono) se
        // registrují jako next/font/google proměnné na <html> v
        // app/[locale]/layout.tsx. Fallback stacky jsou jen pro dobu před
        // hydratací fontu / při selhání načtení.
        display: ['var(--font-display)', 'Georgia', 'ui-serif', 'serif'],
        body: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
