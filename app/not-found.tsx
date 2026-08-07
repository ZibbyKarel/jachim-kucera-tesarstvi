import Link from 'next/link'
import { PALETTE } from '@/lib/palette'

// Globální 404 mimo lokalizovaný segment — má vlastní <html>, protože nad ním
// není žádný root layout, a proto nemá přístup k next-intl kontextu locale
// segmentu. Text je záměrně anglický jako univerzální fallback pro tento
// okrajový případ (matcher middlewaru zachytí prakticky vše ostatní).
//
// Tenhle soubor nemá přístup k Tailwind vrstvě (žádný <link> na globals.css
// mimo lokalizovaný segment), takže barvy jde použít jen jako inline styly —
// ale je to normální React komponenta, takže hodnoty bere importem přímo
// z lib/palette.ts, ne opsané natvrdo. Průhledné varianty (label/text) jdou
// přes color-mix() stejně jako .shadow-panel-* v app/globals.css.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: PALETTE.paper.DEFAULT,
          color: PALETTE.timber.DEFAULT,
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '0 1.5rem',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: `color-mix(in srgb, ${PALETTE.timber.DEFAULT} 65%, transparent)`,
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: '2rem', margin: '0.5rem 0 0' }}>Page not found</h1>
        <p
          style={{
            color: `color-mix(in srgb, ${PALETTE.timber.DEFAULT} 70%, transparent)`,
            marginTop: '1rem',
          }}
        >
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            marginTop: '2rem',
            backgroundColor: PALETTE.ember.DEFAULT,
            color: PALETTE.paper.DEFAULT,
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontSize: '0.85rem',
          }}
        >
          Back home
        </Link>
      </body>
    </html>
  )
}
