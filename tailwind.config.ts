import type { Config } from 'tailwindcss'

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
        // Hex hodnoty jsou WCAG AA doladěné (viz tabulka tokenů v sekci "Design
        // tokens: WCAG contrast verification" plánu) — steel/patina/patina-dim jsou
        // ztmavené oproti výchozím hex hodnotám z designového zadání konkrétně proto,
        // aby každé použití jako text prošlo 4.5:1 na paper/paper-dim. Ladit dál lze
        // beze změny kódu komponent (viz spec §3.1), ale je nutné znovu ověřit kontrast.
        paper: {
          DEFAULT: '#eef0ef', // primární světlé pozadí
          dim: '#e2e5e3', // sekundární světlé pozadí (střídavé panely)
        },
        slate: {
          DEFAULT: '#1c2226', // primární tmavé pozadí / inkoust (text na paper)
          soft: '#2a3136', // sekundární tmavé pozadí (overlaye, střídavé panely)
        },
        steel: {
          DEFAULT: '#5f666a', // text/čísla/labely na SVĚTLÉM pozadí + obecné bordery (5.10:1 na paper, 4.60:1 na paper-dim)
          soft: '#b7bcbe', // text/bordery na TMAVÉM pozadí (8.38:1 na slate) — nepoužívat na světlém pozadí, jako text tam nedostatečný kontrast
        },
        patina: {
          DEFAULT: '#486c5a', // JEDINÝ akcent na SVĚTLÉM pozadí — CTA, odkazy, aktivní/hover stav, nadpisy, focus ring (5.14:1 na paper, 4.64:1 na paper-dim)
          dim: '#3a5648', // ztmavený akcent pro hover/pressed stavy akcentu samotného, na světlém pozadí (7.04:1 jako výplň tlačítka při hoveru)
          soft: '#74a48c', // stejný odstín akcentu, zesvětlený, pro text/hover/aktivní stav/focus ring na TMAVÉM pozadí (5.69:1 na slate, 4.67:1 na slate-soft — viz párovací matice v Global Constraints) — nepoužívat na světlém pozadí
        },
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
