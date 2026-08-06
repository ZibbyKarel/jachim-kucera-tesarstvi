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
    //
    // Rozměry a pozice jsou napočítané z reálného layoutu Openeru (změřeno
    // Playwrightem na 1024/1280/1440/1920 px, cs i en), ne odhadem:
    // - `bottom-24` (96px od spodku sekce) místo `bottom-0` - sekce má dole
    //   80px prázdného paddingu (`pb-20` v Openeru), 96px je o kousek víc,
    //   takže spodek vrstvy sedí těsně NAD řádkem CTA odkazů, ne pod ním.
    //   Díky tomu zůstává celá vrstva nad ohybem i při výšce viewportu
    //   720px, kde `bottom-0` (spodek sekce) dnes končí až pod ním.
    // - `w-[clamp(240px,20vw,300px)]` - `aspect-[7/5]` z toho dělá výšku
    //   171-214px. Strop 300px/214px není nahodilý: mezera mezi patou <h1>
    //   a řádkem CTA je constantních 249px na všech čtyřech šířkách (fixní
    //   px odstupy v Openeru, ne vw), takže 214px nechává právě ~19px
    //   vzduchu nahoře. Šířka nikdy neomezuje - i na 1024px zůstává
    //   pravý okraj vrstvy přes 150px za pravým okrajem odstavce s
    //   podtitulkem (nejširší sousední prvek), na širších už jen s rezervou.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-24 right-0 z-0 hidden aspect-[7/5] w-[clamp(240px,20vw,300px)] lg:block"
    >
      <House3DScene className="h-full w-full" transparent interactive={false} playIntro />
    </div>
  )
}
