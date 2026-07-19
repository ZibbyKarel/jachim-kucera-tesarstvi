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
    <div className="bg-wood-dark">
      <header className="container-content pb-12 pt-36 md:pt-44">
        <span className="eyebrow">{t('title')}</span>
        <h1 className="mt-3 max-w-3xl font-display text-5xl italic leading-tight text-cream md:text-7xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-cream/70">
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
            <h2 className="eyebrow mb-4">{t('infoHeading')}</h2>
            <div className="space-y-5">
              {contacts.map((contact) => (
                <div key={contact.phoneHref}>
                  <p className="font-body text-sm text-cream/60">{contact.name}</p>
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="block font-display text-3xl italic text-wood-amber transition-colors hover:text-wood-warm md:text-4xl"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
            <a
              href={`mailto:${SITE.email}`}
              className="link-underline mt-5 inline-block font-body text-base text-cream/80 hover:text-cream"
            >
              {SITE.email}
            </a>
          </div>

          <div>
            <h3 className="font-body text-xs uppercase tracking-widest text-cream/50">
              {t('areaLabel')}
            </h3>
            <p className="mt-2 font-body text-base text-cream">{tCommon('region')}</p>
          </div>

          {/* Statická „mapa" ve světlém stylu (placeholder pro Mapbox) */}
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-sm border border-cream/10"
            role="img"
            aria-label={t('mapAriaLabel')}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: '#efeae0',
                backgroundImage:
                  'linear-gradient(0deg, rgba(45,43,40,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,43,40,0.06) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* stylizované „silnice" */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 400 300"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M-20 210 C80 180 120 120 200 150 S340 120 420 90"
                stroke="#b0a283"
                strokeWidth="2"
                opacity="0.7"
              />
              <path
                d="M40 -20 C70 80 30 160 90 240 S140 360 120 420"
                stroke="#b0a283"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <circle cx="200" cy="150" r="7" fill="#a07d33" />
              <circle
                cx="200"
                cy="150"
                r="16"
                stroke="#a07d33"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>
            <span className="absolute bottom-3 left-3 font-display text-xl italic text-cream">
              {t('mapCityLabel')}
            </span>
          </div>
        </aside>
      </div>
    </div>
  )
}
