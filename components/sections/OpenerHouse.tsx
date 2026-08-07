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
    // Playwrightem na 1024/1280/1440/1920 px, cs i en, po zmenšení <h1> na
    // clamp(2.5rem,5.5vw,5rem) - viz Opener.tsx), ne odhadem. Klient chtěl dům
    // „trochu větší" a zároveň zmenšit nadpis - obojí spolu souvisí: menší <h1>
    // uvolnilo prostor NAD původním stropem vrstvy, který dřív zabíral text.
    //
    // 2026-08-07 klient znovu: „dům může být klidně 2x tak velký". Celý clamp
    // se proto znásobil dvěma - `w-[clamp(260px,24vw,345px)]` →
    // `w-[clamp(520px,48vw,690px)]`, přesně dvojnásobek na všech třech větvích.
    // `aspect-[7/5]` z toho dělá výšku 371-493px (dřív 186-246px). Protože
    // SceneManager rámuje dům podle poměru stran canvasu (ten se nemění),
    // dvojnásobný canvas = dvojnásobně velká kresba.
    //
    // - Původní strop 345px byl vybraný tak, aby se bounding boxy vrstvy a
    //   <h1>/lead nikdy nepotkaly. **Ta podmínka teď záměrně neplatí.** Dvojnásobný
    //   dům se do mezery vpravo od sazby nevejde, takže se od 1440px vodorovně
    //   překrývá s koncem <h1> (poslední řádek + čárka za „řemesla,"). Vrstva
    //   zůstává `z-0` a textový sloupec `z-10`, takže text kreslí přes dům, ne
    //   naopak - čitelnost drží kontrast tmavého písma na světlé stěně.
    //   Změřeno Playwrightem na 1024/1280/1440/1920 px: na 1024 a 1280 se
    //   kresba se sazbou vůbec nepotkává, na 1440/1920 se dotýká jen patka
    //   posledního řádku <h1>. Lead odstavec, statistiky ani CTA nikde.
    // - Svisle je dům **zarovnaný patou na spodní hranu řádku CTA**: klient
    //   chtěl, aby spodek kresby lícoval se spodní hranou textu „Prohlédnout
    //   realizace". Dřív tu bylo prosté `bottom-28` (112px). Konstanta ale po
    //   zdvojnásobení nestačí, protože **spodní okraj canvasu není spodek
    //   domu**: SceneManager nechává pod kresbou prázdný pás o konstantních
    //   ~9 % výšky canvasu, který tedy s velikostí domu roste (změřeno
    //   analýzou pixelů: 33,4 / 39,8 / 43,8 / 44,8px na 1024/1280/1440/1920).
    //   Pevné `bottom` by proto sedlo vždy jen na jedné šířce a jinde bylo
    //   o 5-11px vedle.
    //
    //   Proto `calc()`, ne konstanta:
    //     bottom = 84px - 0,0645 × <šířka vrstvy>
    //   84px je vzdálenost spodní hrany textu CTA od spodku sekce - konstantní
    //   na všech čtyřech šířkách (`pb-20` plus řádkování, nikde žádné `vw`),
    //   takže cíl je pevný. 0,0645 je ten prázdný pás přepočtený z výšky na
    //   šířku: 9,03 % × poměr 5/7. Zbytek dopočítá tentýž `clamp()` jako
    //   u `w-`, takže obě hodnoty nejdou rozejít.
    //
    //   Pozor při zásahu do 3D scény: 0,0645 je odvozené z rámování
    //   (`FIT_MARGIN_DECOR`) a z modelu domu. Když se změní jedno nebo druhé,
    //   je potřeba prázdný pás přeměřit, jinak zarovnání odjede.
    //
    //   Vodorovně se pata kresby s odkazy CTA nepotká: odkazy končí kolem
    //   x≈540px (1440), kresba začíná až na x≈590px. Sesunem o ~70px dolů se
    //   posunula celá vrstva, takže se s <h1> teď nepotkává pergola, ale hřeben
    //   střechy - překryv zůstává zhruba stejně velký, jen výš na kresbě.
    //
    // Vodorovně se vrstva váže na textový sloupec (`container-content`), ne na
    // okraj viewportu: `right-0` na sekci vypadalo dobře do ~1440px, ale nad
    // šířkou sloupce (max-w-content) dům odplul do prázdné mrže vpravo, ztratil
    // vazbu na sazbu a na 1920px ho pravý okraj okna dokonce ořízl. `ml-auto`
    // uvnitř sloupce srovná pravou hranu domu s pravou hranou textu na všech
    // šířkách (ověřeno: canvasRight - textRight = 0 na 1024/1280/1440/1920,
    // cs i en).
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-[calc(84px_-_0.0645_*_clamp(520px,48vw,690px))] z-0 hidden lg:block"
    >
      <div className="container-content">
        <div className="ml-auto aspect-[7/5] w-[clamp(520px,48vw,690px)]">
          <House3DScene className="h-full w-full" transparent interactive={false} playIntro />
        </div>
      </div>
    </div>
  )
}
