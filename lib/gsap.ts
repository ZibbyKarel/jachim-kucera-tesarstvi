'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

// Registrace pluginů proběhne jen v prohlížeči.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin)
}

/**
 * Aktuální preference uživatele ohledně omezení pohybu.
 * Čteme dynamicky (ne jen při importu), aby to fungovalo i po změně nastavení.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// ScrollTrigger/DrawSVGPlugin zůstávají zaregistrované výše (Reveal.tsx je
// používá nepřímo přes `scrollTrigger: {...}` v gsap.from()), ale nikdo je
// needovažuje jako přímý import - export drží jen `gsap` samotné, které
// komponenty skutečně importují (grep `ScrollTrigger`/`DrawSVGPlugin` mimo
// tenhle soubor vrací 0 hitů).
export { gsap }
