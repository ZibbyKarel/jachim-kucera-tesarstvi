'use client'

import { useTranslations } from 'next-intl'
import { services } from '@/lib/constants'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { Reveal } from '@/components/ui/Reveal'

/* -------------------------------------------------------------------------- */
/*  ServicesGrid — „Co umíme"                                                   */
/*                                                                              */
/*  Replaces the old ServicesScroll (three matchMedia-branched GSAP             */
/*  ScrollTrigger pins — mobile hold / tablet horizontal track / desktop        */
/*  card-deal stagger) with a plain static bento grid. No pin, no scrub, no     */
/*  matchMedia — entry is a simple scroll-into-view reveal via the shared       */
/*  <Reveal stagger> primitive (same one ProjectsPreview/AboutSection already   */
/*  use), which is itself prefers-reduced-motion-guarded.                      */
/*                                                                              */
/*  Bento: exactly one `featured` service (see lib/constants.ts) fills a       */
/*  cell spanning all 3 grid rows on md:+; the other three fill one row each   */
/*  in the second column, so the featured cell reads visibly taller/wider —    */
/*  pure CSS Grid auto-row sizing, no JS measurement needed. Single column     */
/*  stack below md:.                                                          */
/* -------------------------------------------------------------------------- */

export function ServicesGrid() {
  const t = useTranslations('home')
  const featured = services.find((s) => s.featured)
  const secondary = services.filter((s) => !s.featured)

  return (
    <section
      aria-labelledby="services-heading"
      className="relative bg-paper py-24 shadow-panel-12 md:py-32"
    >
      <div className="container-content">
        <h2
          id="services-heading"
          className="max-w-xl font-display text-3xl italic text-slate md:text-4xl"
        >
          {t('servicesIntro')}
        </h2>

        <Reveal
          stagger
          className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-3 md:gap-6"
        >
          {featured && (
            <div data-reveal-item className="md:col-start-1 md:row-start-1 md:row-span-3">
              <ServiceCard service={featured} />
            </div>
          )}
          {secondary.map((service, i) => (
            <div
              key={service.slug}
              data-reveal-item
              className={
                i === 0
                  ? 'md:col-start-2 md:row-start-1'
                  : i === 1
                    ? 'md:col-start-2 md:row-start-2'
                    : 'md:col-start-2 md:row-start-3'
              }
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
