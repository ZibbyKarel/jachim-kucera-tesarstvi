import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/ui/Reveal'
import { Counter } from '@/components/ui/Counter'
import { Timeline } from '@/components/sections/Timeline'
import { Button, Arrow } from '@/components/ui/Button'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.onas' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/o-nas' },
  }
}

export default async function ONasPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('about')
  const tCommon = await getTranslations('common')
  const tNav = await getTranslations('nav')
  const aboutStory = t.raw('story') as string[]
  const aboutStats = t.raw('stats') as { value: string; label: string }[]
  const values = t.raw('values') as { title: string; description: string }[]
  const certificates = t.raw('certificates') as string[]

  return (
    <div className="bg-wood-dark">
      {/* Hero portrét */}
      <header className="relative h-[70vh] min-h-[440px] w-full overflow-hidden">
        <ImageFrame
          src="/images/tym/tym-portret.jpg"
          alt={t('heroAlt')}
          aspect="16/9"
          aged={false}
          rounded={false}
          priority
          sizes="100vw"
          className="!absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wood-dark via-wood-dark/55 to-wood-dark/25" />
        <div className="container-content absolute inset-x-0 bottom-0">
          <div className="pb-14">
            <span className="eyebrow">{tNav('about')} · {tCommon('region')}</span>
            <h1 className="mt-3 font-display text-5xl italic leading-none text-cream md:text-8xl">
              {t('heroTitle')}
            </h1>
          </div>
        </div>
      </header>

      {/* Příběh */}
      <section aria-label={t('storyAria')} className="py-20 md:py-28">
        <div className="container-content grid gap-10 md:grid-cols-[1fr_1.3fr] md:gap-16">
          <Reveal>
            <p className="font-display text-3xl italic leading-snug text-wood-amber md:sticky md:top-28">
              {t('heroQuote')}
            </p>
          </Reveal>
          <Reveal stagger className="space-y-5">
            {aboutStory.map((p) => (
              <p
                key={p.slice(0, 24)}
                data-reveal-item
                className="font-body text-base leading-relaxed text-cream/75"
              >
                {p}
              </p>
            ))}
            <div
              data-reveal-item
              className="mt-8 grid grid-cols-3 gap-4 border-y border-cream/10 py-8"
            >
              {aboutStats.map((s) => (
                <Counter key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <section
        aria-labelledby="timeline-heading"
        className="border-t border-cream/10 bg-wood-medium py-20 md:py-28"
      >
        <div className="container-content">
          <h2
            id="timeline-heading"
            className="mb-14 font-display text-3xl italic text-cream md:text-4xl"
          >
            {t('timelineHeading')}
          </h2>
          <Timeline />
        </div>
      </section>

      {/* Hodnoty */}
      <section
        aria-labelledby="values-heading"
        className="bg-wood-dark py-20 md:py-28"
      >
        <div className="container-content">
          <h2
            id="values-heading"
            className="font-display text-3xl italic text-cream md:text-4xl"
          >
            {t('valuesHeading')}
          </h2>
          <Reveal stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((v, i) => (
              <div
                key={v.title}
                data-reveal-item
                className="border-t border-cream/15 pt-6"
              >
                <span className="font-display text-2xl italic text-wood-warm">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-display text-3xl italic text-cream">
                  {v.title}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-cream/70">
                  {v.description}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Certifikáty + CTA */}
      <section className="border-t border-cream/10 bg-wood-medium py-20 md:py-28">
        <div className="container-content">
          <h2 className="font-display text-3xl italic text-cream md:text-4xl">
            {t('certificatesHeading')}
          </h2>
          <Reveal stagger className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {certificates.map((c) => (
              <div
                key={c}
                data-reveal-item
                className="flex aspect-[3/2] items-center justify-center rounded-sm border border-cream/10 bg-wood-dark p-6 text-center font-body text-xs uppercase tracking-widest text-cream/50"
              >
                {c}
              </div>
            ))}
          </Reveal>

          <div className="mt-16 flex flex-col items-start gap-6 border-t border-cream/10 pt-12 md:flex-row md:items-center md:justify-between">
            <p className="max-w-md font-display text-2xl italic text-cream">
              {t('ctaText')}
            </p>
            <Button href="/kontakt" size="lg">
              {t('ctaButton')} <Arrow />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
