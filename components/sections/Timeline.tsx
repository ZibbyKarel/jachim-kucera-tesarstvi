import { useTranslations } from 'next-intl'
import { Reveal } from '@/components/ui/Reveal'

/* -------------------------------------------------------------------------- */
/*  Timeline — cesta firmy, přepsáno do jazyka Process.tsx (T5/C)               */
/*                                                                              */
/*  Stejný vzor jako postup zakázky na homepage: jedna průběžná vlasová linka   */
/*  na kontejneru (svislá vlevo - Timeline je vždy jeden sloupec, na rozdíl od  */
/*  Process, který má na desktopu čtyři vedle sebe). Mono letopočet v ember     */
/*  nahrazuje mono pořadové číslo z Process - je to konkrétnější a pořád        */
/*  existující obsah (about.timeline), ne vymyšlené číslo. Reveal (stagger)     */
/*  nahrazuje bespoke GSAP scroll animace (slide-from-left + scrubovaná linka)  */
/*  - shoduje se s pravidlem spec §"Pohyb": jediný povolený efekt je fade+rise. */
/* -------------------------------------------------------------------------- */

interface Milestone {
  year: string
  title: string
  description: string
}

export function Timeline() {
  const t = useTranslations('about')
  const timeline = t.raw('timeline') as Milestone[]

  return (
    <Reveal
      as="ol"
      stagger
      className="relative list-none space-y-10 border-l border-timber/20 pl-8 md:pl-10"
    >
      {timeline.map((m) => (
        <li key={m.year} data-reveal-item className="flex flex-col gap-2">
          <span className="font-mono text-2xl text-ember md:text-3xl">{m.year}</span>
          <h3 className="font-display text-xl text-timber">{m.title}</h3>
          <p className="max-w-xl font-body text-sm leading-relaxed text-oak">
            {m.description}
          </p>
        </li>
      ))}
    </Reveal>
  )
}
