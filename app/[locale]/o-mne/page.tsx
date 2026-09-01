import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/ui/Reveal'
import { Timeline } from '@/components/sections/Timeline'
import { Link } from '@/i18n/routing'
import { Arrow } from '@/components/ui/Button'
import { people } from '@/lib/constants'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.omne' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/o-mne' },
  }
}

export default async function OMnePage({
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
    <div className="bg-paper">
      {/* Otvírák — stejný duch jako Opener.tsx na homepage, žádný obrázkový hero */}
      <header className="bg-paper">
        <div className="container-content pb-14 pt-36 md:pb-20 md:pt-44">
          <p className="font-mono text-xs uppercase tracking-widest text-oak">
            {tNav('about')} · {tCommon('region')}
          </p>
          <h1 className="mt-5 max-w-[16ch] text-balance font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-timber">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 max-w-[46ch] font-body text-lg text-oak md:text-xl">
            {t('heroQuote')}
          </p>
        </div>
      </header>

      {/* Příběh — široký sloupec + faktický pás stejného typu jako v Opener.tsx */}
      <section aria-label={t('storyAria')} className="bg-paper pb-20 md:pb-28">
        <div className="container-content max-w-[65ch]">
          <Reveal stagger className="space-y-5">
            {aboutStory.map((p) => (
              <p
                key={p.slice(0, 24)}
                data-reveal-item
                className="font-body text-base leading-relaxed text-oak"
              >
                {p}
              </p>
            ))}
          </Reveal>

          <div className="mt-10 grid grid-cols-2 border-t border-timber/20 pt-8 sm:inline-grid sm:auto-cols-max sm:grid-flow-col">
            {aboutStats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col gap-1 pr-8 ${i > 0 ? 'border-l border-timber/20 pl-8' : ''}`}
              >
                <span className="font-mono text-3xl text-timber sm:text-4xl">{stat.value}</span>
                <span className="font-mono text-xs uppercase tracking-widest text-oak">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lidé ve firmě — jeden OSVČ, jen jméno, IČO a telefon. Žádné role,
          tituly ani vymyšlené životopisy. Stejný rytmus hairline řádků jako
          sekce „Hodnoty" níže, ne karty. */}
      <section aria-labelledby="team-heading" className="bg-paper py-20 md:py-28">
        <div className="container-content">
          <h2 id="team-heading" className="font-mono text-xs uppercase tracking-widest text-oak">
            {t('teamHeading')}
          </h2>
          <Reveal stagger className="mt-12 border-t border-timber/20">
            {people.map((person) => (
              <div
                key={person.key}
                data-reveal-item
                className="flex flex-col gap-2 border-b border-timber/20 py-8 md:flex-row md:items-baseline md:gap-10"
              >
                <h3 className="font-display text-xl text-timber md:w-64 md:shrink-0">
                  {person.name}
                </h3>
                <div className="flex flex-col gap-1 font-mono text-sm text-oak sm:flex-row sm:gap-6">
                  <span>
                    {tCommon('companyIdLabel')} {person.companyId}
                  </span>
                  <a href={`tel:${person.phoneHref}`} className="link-underline w-fit text-timber">
                    {person.phone}
                  </a>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Cesta firmy — Timeline v jazyce Process.tsx */}
      <section aria-labelledby="timeline-heading" className="bg-paper-dim py-20 md:py-28">
        <div className="container-content">
          <h2
            id="timeline-heading"
            className="font-mono text-xs uppercase tracking-widest text-oak"
          >
            {t('timelineHeading')}
          </h2>
          <div className="mt-14 md:mt-20">
            <Timeline />
          </div>
        </div>
      </section>

      {/* Hodnoty — hairline oddělený seznam, žádné karty */}
      <section aria-labelledby="values-heading" className="bg-paper py-20 md:py-28">
        <div className="container-content">
          <h2 id="values-heading" className="font-display text-3xl text-timber md:text-4xl">
            {t('valuesHeading')}
          </h2>
          <Reveal stagger className="mt-12 border-t border-timber/20">
            {values.map((v) => (
              <div
                key={v.title}
                data-reveal-item
                className="flex flex-col gap-2 border-b border-timber/20 py-8 md:flex-row md:items-baseline md:gap-10"
              >
                <h3 className="font-display text-xl text-timber md:w-64 md:shrink-0">
                  {v.title}
                </h3>
                <p className="font-body text-base leading-relaxed text-oak">{v.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Certifikáty jako mono řádek + závěrečné CTA */}
      <section className="bg-paper-dim py-20 md:py-28">
        <div className="container-content">
          <h2 className="font-mono text-xs uppercase tracking-widest text-oak">
            {t('certificatesHeading')}
          </h2>
          <p className="mt-6 max-w-3xl font-mono text-sm uppercase tracking-widest text-timber">
            {certificates.join(' · ')}
          </p>

          <div className="mt-16 flex flex-col items-start gap-6 border-t border-timber/20 pt-12 md:flex-row md:items-center md:justify-between">
            <p className="max-w-md font-display text-2xl text-timber">{t('ctaText')}</p>
            <Link
              href="/kontakt"
              className="group link-underline inline-flex items-center gap-2 font-body text-timber"
            >
              {t('ctaButton')}
              <Arrow className="transition-transform duration-300 ease-craft group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
