'use client'

import { useRef } from 'react'
import { useRouter } from '@/i18n/routing'
import { House3DScene, type MenuId } from '@/components/house3d'

/* Úvodní „vykreslení" domu jen jednou za session. Module-level flag přežije
   client-side navigaci (reset až při hard refresh), takže návrat na landing
   už ukáže dům rovnou plně vykreslený. Nastaví se až PO dokončení intra —
   přežije tím React StrictMode dvojitý mount v dev režimu (ten proběhne dřív,
   než intro doběhne, takže se na první návštěvě intro stejně přehraje). */
let introPlayed = false

/* -------------------------------------------------------------------------- */
/*  HeroHouse — interaktivní 3D dům v hero sekci                                */
/*                                                                              */
/*  Tenký klientský obal: vykreslí 3D scénu (na průhledném pozadí, ať prosvítá  */
/*  papírový panel za ní) a klik na část domu přesměruje na odpovídající        */
/*  stránku. Routing drží mimo znovupoužitelný modul house3d.                   */
/* -------------------------------------------------------------------------- */

const HREF: Record<MenuId, string> = {
  roof: '/sluzby/pokryvacstvi',
  gutters: '/sluzby/klempirstvi',
  pergola: '/sluzby/tesarstvi',
  entrance: '/kontakt',
}

export function HeroHouse() {
  const router = useRouter()
  // přečteme jednou při mountu — stabilní pro celý život komponenty
  const playIntro = useRef(!introPlayed).current
  return (
    <House3DScene
      transparent
      playIntro={playIntro}
      onIntroDone={() => {
        introPlayed = true
      }}
      className="absolute inset-0 h-full w-full"
      onMenuSelect={(id) => router.push(HREF[id])}
    />
  )
}
