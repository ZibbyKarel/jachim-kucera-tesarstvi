import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Arrow } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

/* -------------------------------------------------------------------------- */
/*  AboutSection — o nás, timber pole                                           */
/*                                                                              */
/*  Velký výrok (home.aboutHeadline) přes ~8 sloupců, vedle krátký odstavec     */
/*  (about.heroQuote - existující, krátká, úderná věta, ne nový text) v         */
/*  oak-soft. Hodnoty (about.values) jako prostý hairline oddělený seznam,      */
/*  žádné karty - stejný vzor jako oddělovače v ServiceIndex (border-paper/40). */
/* -------------------------------------------------------------------------- */

export function AboutSection() {
  const t = useTranslations('home')
  const tAbout = useTranslations('about')
  const values = tAbout.raw('values') as { title: string; description: string }[]

  return (
    <section aria-labelledby="about-heading" className="bg-timber py-24 md:py-32">
      <div className="container-content">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          <h2
            id="about-heading"
            className="text-balance font-display text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.1] text-paper md:col-span-8"
          >
            {t('aboutHeadline')}
          </h2>
          <p className="font-body text-base leading-relaxed text-oak-soft md:col-span-4 md:pt-2">
            {tAbout('heroQuote')}
          </p>
        </div>

        <Reveal
          stagger
          className="mt-14 border-t border-paper/40 md:mt-20"
        >
          {values.map((value) => (
            <div
              key={value.title}
              data-reveal-item
              className="flex flex-col gap-2 border-b border-paper/40 py-8 md:flex-row md:items-baseline md:gap-10"
            >
              <h3 className="font-display text-xl text-paper md:w-64 md:shrink-0">
                {value.title}
              </h3>
              <p className="font-body text-base leading-relaxed text-oak-soft">
                {value.description}
              </p>
            </div>
          ))}
        </Reveal>

        <div className="mt-10">
          <Link
            href="/o-nas"
            className="group link-underline inline-flex items-center gap-2 font-body text-paper"
          >
            {t('aboutCta')}
            <Arrow className="transition-transform duration-300 ease-craft group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
