'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { services } from '@/lib/constants'
import { ServiceCard } from '@/components/ui/ServiceCard'

export function ServicesScroll() {
  const t = useTranslations('home')
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const pinned = pinRef.current
    const track = trackRef.current
    if (!section || !pinned || !track) return

    const ctx = gsap.context(() => {
      // Na mobilu i při omezeném pohybu necháme vertikální stack.
      const mm = gsap.matchMedia()

      mm.add('(min-width: 768px)', () => {
        if (prefersReducedMotion()) return
        const getDistance = () => track.scrollWidth - window.innerWidth

        gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${getDistance()}`,
            // Pinujeme VNITŘNÍ wrapper, ne <section>. GSAP pin obalí cílový prvek
            // do .pin-spacer (přerodičuje ho); kdyby to byla <section> (přímý
            // potomek <main>), React by ji při navigaci nenašel pod main a spadl
            // by removeChild NotFoundError. Takhle zůstane <section> pod <main>.
            pin: pinned,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="services-heading"
      className="relative bg-wood-dark"
    >
      {/* Vnitřní wrapper = pinovaný prvek (GSAP ho obalí do .pin-spacer). */}
      <div
        ref={pinRef}
        className="relative overflow-hidden py-20 md:h-screen md:py-0"
      >
        <div className="container-content pt-8 md:absolute md:left-0 md:right-0 md:top-12 md:z-10">
          <span className="eyebrow">{t('servicesHeading')}</span>
          <h2
            id="services-heading"
            className="mt-3 max-w-xl font-display text-3xl italic text-cream md:text-4xl"
          >
            {t('servicesIntro')}
          </h2>
        </div>

        <div className="md:flex md:h-full md:items-center">
          <div
            ref={trackRef}
            className="mt-10 flex flex-col gap-6 px-6 md:mt-0 md:h-[64vh] md:flex-row md:gap-8 md:px-10 md:pl-[8vw] md:pr-[8vw]"
          >
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
