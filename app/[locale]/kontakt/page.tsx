import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { SITE, contacts } from '@/lib/constants'
import { ContactForm } from '@/components/ui/ContactForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.kontakt' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/kontakt' },
  }
}

export default async function KontaktPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')
  const tCommon = await getTranslations('common')

  return (
    <div className="bg-paper">
      <header className="container-content pb-12 pt-36 md:pt-44">
        <span className="eyebrow">{t('title')}</span>
        <h1 className="mt-3 max-w-3xl font-display text-5xl italic leading-tight text-slate md:text-7xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-slate/70">
          {t('intro')}
        </p>
      </header>

      <div className="container-content grid gap-14 pb-28 md:grid-cols-[1.2fr_1fr] md:gap-20">
        {/* Formulář */}
        <div className="order-2 md:order-1">
          <ContactForm />
        </div>

        {/* Kontaktní info + mapa */}
        <aside className="order-1 space-y-10 md:order-2">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-steel">
              {t('infoHeading')}
            </h2>
            <div className="space-y-5">
              {contacts.map((contact) => (
                <div key={contact.phoneHref}>
                  <p className="font-body text-sm text-slate/60">{contact.name}</p>
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="block font-mono text-3xl text-patina transition-colors hover:text-patina-dim md:text-4xl"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
            <a
              href={`mailto:${SITE.email}`}
              className="link-underline mt-5 inline-block font-body text-base text-slate/80 hover:text-slate"
            >
              {SITE.email}
            </a>
          </div>

          <div>
            <h3 className="font-body text-xs uppercase tracking-widest text-slate/50">
              {t('areaLabel')}
            </h3>
            <p className="mt-2 font-body text-base text-slate">{tCommon('region')}</p>
          </div>

          {/* Technická "mapa" — rastr + trasy + kótovaný bod (placeholder pro Mapbox) */}
          <div
            className="tech-grid relative aspect-[4/3] overflow-hidden rounded-sm border border-slate/10 bg-paper-dim"
            role="img"
            aria-label={t('mapAriaLabel')}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 400 300"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M-20 210 C80 180 120 120 200 150 S340 120 420 90"
                className="text-steel"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.6"
              />
              <path
                d="M40 -20 C70 80 30 160 90 240 S140 360 120 420"
                className="text-steel"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.45"
              />
              <circle
                cx="200"
                cy="150"
                r="6"
                className="text-patina"
                fill="currentColor"
              />
              <circle
                cx="200"
                cy="150"
                r="16"
                className="text-patina"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>
            <span className="absolute bottom-3 left-3 font-display text-xl italic text-slate">
              {t('mapCityLabel')}
            </span>
          </div>
        </aside>
      </div>
    </div>
  )
}
