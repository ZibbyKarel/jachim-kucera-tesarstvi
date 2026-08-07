'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { Button } from '@/components/ui/Button'
import { HeroHouse } from './HeroHouse'
import { MobileServiceGrid } from './MobileServiceGrid'

/* -------------------------------------------------------------------------- */
/*  HeroScroll — dům „na papíře" se scroll choreografií                         */
/*                                                                              */
/*  Panel drží 100dvh a je STICKY uvnitř delší dráhy (runway). Sticky (ne GSAP  */
/*  pin) = žádné přerodičování do .pin-spacer → App Router při navigaci nespadne */
/*  na removeChild. Dům zůstává v klidu (žádné „usazení"). Na desktopu je       */
/*  layout asymetrický - text vlevo (~42 %), dům jako hlavní asset vpravo       */
/*  (spec §4.1). Na mobilu (<768px) je dům zmenšen na horní pásmo a pod ním     */
/*  je MobileServiceGrid - jediná garantovaná cesta k navigaci (spec §4.2).     */
/* -------------------------------------------------------------------------- */

export function HeroScroll() {
  const t = useTranslations('home')
  const runwayRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const runway = runwayRef.current
    if (!runway) return

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return

      gsap.to(headerRef.current, {
        opacity: 0,
        y: -28,
        ease: 'none',
        scrollTrigger: { trigger: runway, start: 'top top', end: '35% top', scrub: true },
      })
    }, runwayRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={runwayRef} className="relative h-[calc(100dvh_+_100vh)] motion-reduce:h-[100dvh]">
      <div className="sticky top-0 flex h-[100dvh] w-full flex-col overflow-hidden bg-paper md:flex-row">
        {/* text blok - mobil: overlay nad zmenšeným domem (centrováno); desktop: samostatný levý sloupec ~42 % (asymetrie dle spec §4.1) */}
        <div
          ref={headerRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-[5.5rem] text-center md:pointer-events-auto md:static md:z-auto md:w-[42%] md:shrink-0 md:items-start md:justify-center md:px-12 md:pt-0 md:text-left lg:px-16"
        >
          <span className="eyebrow">{t('heroEyebrow')}</span>
          <h1 className="mt-3 max-w-2xl font-display text-3xl italic leading-[1.05] text-timber sm:text-4xl md:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <Button href="/kontakt" size="md" className="pointer-events-auto mt-6">
            {t('heroCta')}
          </Button>
        </div>

        {/* dům - hlavní asset. Mobil: zmenšené horní pásmo (h-[38vh]). Desktop: zbylých ~58 % šířky panelu. */}
        <div className="relative h-[38vh] w-full md:h-full md:flex-1">
          <HeroHouse />
        </div>

        {/* mobilní kartový seznam služeb - jediná garantovaná navigace pod 768px */}
        <div className="flex-1 overflow-y-auto border-t border-timber/50 bg-paper-dim px-4 py-4 md:hidden">
          <MobileServiceGrid />
        </div>
      </div>
    </div>
  )
}
