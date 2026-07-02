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
          backgroundColor: '#e9e6e0',
          color: '#2d2b28',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '0 1.5rem',
        }}
      >
        <h1 style={{ fontSize: '2rem', margin: 0 }}>404 — Page not found</h1>
        <p style={{ color: 'rgba(45,43,40,0.7)', marginTop: '1rem' }}>
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            marginTop: '2rem',
            backgroundColor: '#c49a4c',
            color: '#2d2b28',
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
