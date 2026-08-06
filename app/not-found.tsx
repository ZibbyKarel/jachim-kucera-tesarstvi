import Link from 'next/link'

// Globální 404 mimo lokalizovaný segment — má vlastní <html>, protože nad ním
// není žádný root layout, a proto nemá přístup k next-intl kontextu locale
// segmentu. Text je záměrně anglický jako univerzální fallback pro tento
// okrajový případ (matcher middlewaru zachytí prakticky vše ostatní).
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
          // Paleta ("Materiály řemesla") zrcadlí lib/palette.ts, protože tenhle
          // soubor nemá přístup k Tailwind vrstvě mimo lokalizovaný segment.
          backgroundColor: '#eef0ef', // paper
          color: '#1c2226', // slate
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
            color: 'rgba(28,34,38,0.6)', // slate/60
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: '2rem', margin: '0.5rem 0 0' }}>Page not found</h1>
        <p style={{ color: 'rgba(28,34,38,0.7)', marginTop: '1rem' }}>
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            marginTop: '2rem',
            backgroundColor: '#486c5a', // patina
            color: '#eef0ef', // paper
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
