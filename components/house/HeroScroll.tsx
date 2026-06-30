'use client'

import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { HeroHouse } from './HeroHouse'

/* -------------------------------------------------------------------------- */
/*  HeroScroll — celoobrazovkový dům „na papíře" se scroll efektem             */
/*                                                                              */
/*  Dům drží 100vh. Při scrollu se přes ScrollTrigger pin scrubne měřítko       */
/*  z 1 → 0.8 (dům se zmenší), teprve pak scroll posune stránku dál.            */
/*                                                                              */
/*  Pinujeme VNITŘNÍ wrapper, ne <section>. GSAP pin obalí cíl do .pin-spacer   */
/*  (přerodičuje ho); <section> tak zůstane přímým potomkem <main> a React ji   */
/*  při navigaci najde (jinak removeChild NotFoundError).                       */
/* -------------------------------------------------------------------------- */

/* Jemná zrnitost papíru (grayscale fractal noise jako data-URI SVG). */
const PAPER_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function HeroScroll() {
  const pinRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pinned = pinRef.current
    const scale = scaleRef.current
    if (!pinned || !scale) return

    const ctx = gsap.context(() => {
      // Při omezeném pohybu necháme dům staticky v plné velikosti.
      if (prefersReducedMotion()) return

      gsap.to(scale, {
        scale: 0.65,
        ease: 'none',
        scrollTrigger: {
          trigger: pinned,
          start: 'top top',
          // dráha, po kterou se dům zmenšuje (60 % výšky okna), pak scroll jede dál
          end: () => '+=' + window.innerHeight * 0.6,
          pin: pinned,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    }, pinRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={pinRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-[#f4efe3]"
    >
      {/* zrnitost papíru (nepohybuje se s domem) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-multiply"
        style={{ backgroundImage: PAPER_GRAIN, backgroundSize: '180px 180px' }}
      />
      {/* jemná vinětace listu */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 90px rgba(74,64,46,0.12)' }}
      />
      {/* škálovaná vrstva s interaktivním domem */}
      <div ref={scaleRef} className="absolute inset-0 will-change-transform">
        <HeroHouse />
      </div>
    </div>
  )
}
