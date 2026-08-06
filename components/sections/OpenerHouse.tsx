'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

/* -------------------------------------------------------------------------- */
/*  OpenerHouse — dekorativní 3D dům v pravém dolním rohu hero sekce            */
/*                                                                             */
/*  Čistá dekorace, ne navigace (tu drží ServiceIndex). Jen na desktopu:        */
/*  - `next/dynamic({ ssr: false })` vyhodí three.js bundle ze serverového      */
/*    renderu i z hlavního klientského chunku homepage, ať WebGL nic neblokuje. */
/*  - matchMedia gate navíc zaručí, že se komponenta (a tedy WebGL kontext)     */
/*    na mobilu/tabletu vůbec nemountne - samotné CSS „hidden lg:block" by ji   */
/*    pořád drželo v DOM a canvas by se pořád vytvořil.                        */
/*  - `useState(false)` + `useEffect` místo čtení matchMedia přímo v renderu,   */
/*    ať se server i první klientský render shodnou (žádný hydration mismatch). */
/* -------------------------------------------------------------------------- */

const House3DScene = dynamic(
  () => import('@/components/house3d').then((mod) => mod.House3DScene),
  { ssr: false }
)

const DESKTOP_QUERY = '(min-width: 1024px)'

export function OpenerHouse() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    setIsDesktop(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  if (!isDesktop) return null

  return (
    // aria-hidden: čistá dekorace, do stromu pro odečítače nepatří (a ani
    // fokusovatelný obsah v ní není - dům je neinteraktivní).
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 z-0 hidden aspect-[7/5] w-[clamp(200px,19vw,400px)] lg:block"
    >
      <House3DScene className="h-full w-full" transparent interactive={false} playIntro />
    </div>
  )
}
