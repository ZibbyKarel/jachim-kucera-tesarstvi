'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/* -------------------------------------------------------------------------- */
/*  StackCover — jednotné „překrytí" sekcí při scrollu                          */
/*                                                                             */
/*  Každá sekce se na konci své dráhy NA CHVÍLI zastaví (pin) a následující     */
/*  sekce po ní vyjede zespodu nahoru, dokud ji KOMPLETNĚ nezakryje — stejný    */
/*  pohyb, jakým služby zakryjí hero. Pin drží VNITŘNÍ wrapper (ne <section>),  */
/*  takže <section> zůstává přímým potomkem <main> a App Router při navigaci    */
/*  nespadne na removeChild; ctx.revert() vše vrátí před odmountováním.         */
/*                                                                             */
/*   • pin: start „bottom bottom" → sekce zamrzne, až její spodek dojede ke      */
/*     spodku okna (takže VYŠŠÍ obsah se stihne odscrollovat a přečíst),        */
/*     drží 100vh (= přesně jedno okno, co potřebuje nástupce na zakrytí).      */
/*   • climb: −100vh marginTop zruší pin-spacer předchozí sekce → tato sekce     */
/*     šplhá PŘES zamrzlou předchozí, místo aby byla odstrčena pod ni.          */
/* -------------------------------------------------------------------------- */

interface StackCoverProps {
  /** Vrstva v překryvu (vyšší = později, kryje předchozí). */
  z: number
  children: ReactNode
  /** Šplhá přes zamrzlou předchozí sekci (−100vh). Vypnout jen pro první vrstvu. */
  climb?: boolean
  /** Zamrzne na konci, ať ji nástupce zakryje. Vypnout pro poslední sekci. */
  pin?: boolean
  className?: string
}

export function StackCover({
  z,
  children,
  climb = true,
  pin = true,
  className = '',
}: StackCoverProps) {
  // VNĚJŠÍ obal drží React (přímý potomek <main>) — nikdy se nepřerodičuje.
  // VNITŘNÍ div je to, co GSAP pinne a obalí do .pin-spaceru. Díky tomu React při
  // navigaci odebírá jen vnější obal jedním removeChildem a přerodičení pinu uvnitř
  // ho nezajímá (jinak: „removeChild — node is not a child of this node").
  const outerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const pinned = pinRef.current
    if (!outer || !pinned) return
    if (prefersReducedMotion()) return // klidový režim: prostý tok, žádné překrytí

    const apply = () => {
      // 100vh v px (clientHeight = CSS vh, bez scrollbaru) → climb i pin sedí na sebe.
      const vh = document.documentElement.clientHeight
      outer.style.marginTop = climb ? `-${vh}px` : ''
    }
    apply()

    const ctx = gsap.context(() => {
      if (pin) {
        ScrollTrigger.create({
          trigger: outer,
          start: 'bottom bottom',
          end: () => '+=' + document.documentElement.clientHeight,
          pin: pinned,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      }
    }, outerRef)

    const onResize = () => apply()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
      outer.style.marginTop = ''
    }
  }, [climb, pin, z])

  return (
    <div ref={outerRef} className="relative" style={{ zIndex: z }}>
      <div ref={pinRef} className={className}>
        {children}
      </div>
    </div>
  )
}
