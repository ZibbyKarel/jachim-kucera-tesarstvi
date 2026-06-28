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
        // Paleta odvozená z loga: antická mosazná zlatá + uhlový charcoal + krém.
        wood: {
          dark: '#1b1a17', // pozadí — uhlový charcoal (z loga)
          medium: '#242019', // sekundární pozadí
          warm: '#a98545', // ztlumená mosaz (čísla, sekundární akcent)
          light: '#d9bd84', // světlá zlatá — hover
          amber: '#c49a4c', // mosazná zlatá — primární akcent / CTA (z loga)
        },
        // Uhlová z loga (tmavý text na světlém pozadí, ikony).
        charcoal: {
          DEFAULT: '#2d2b28',
          light: '#3a3833',
        },
        steel: {
          dark: '#2D3748',
          medium: '#4A5568',
          light: '#718096',
        },
        cream: '#f3ecdd', // text, linky — teplá bílá (pozadí loga)
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
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
