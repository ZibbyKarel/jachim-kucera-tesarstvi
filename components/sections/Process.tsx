import { useTranslations } from 'next-intl'
import { Reveal } from '@/components/ui/Reveal'

/* -------------------------------------------------------------------------- */
/*  Process — postup zakázky, paper-dim pole                                    */
/*                                                                              */
/*  Čtyři kroky vedle sebe na desktopu, pod sebou na mobilu. Spojuje je jedna   */
/*  průběžná vlasová linka na kontejneru (ne na jednotlivých krocích) -         */
/*  vodorovná nad čísly na desktopu, svislá vlevo na mobilu. Žádné ikony,       */
/*  žádné lhůty ani vymyšlená čísla (spec §5 / T4 pravidlo 4).                  */
/* -------------------------------------------------------------------------- */

export function Process() {
  const t = useTranslations('home.process')
  const steps = t.raw('steps') as { title: string; text: string }[]

  return (
    <section aria-labelledby="process-heading" className="bg-paper-dim py-24 md:py-32">
      <div className="container-content">
        <h2
          id="process-heading"
          className="font-mono text-xs uppercase tracking-widest text-oak"
        >
          {t('heading')}
        </h2>

        <Reveal
          as="ol"
          stagger
          className="mt-14 grid list-none grid-cols-1 gap-10 border-l border-timber/20 pl-6 md:mt-20 md:grid-cols-4 md:gap-8 md:border-l-0 md:border-t md:pl-0 md:pt-10"
        >
          {steps.map((step, i) => (
            <li key={step.title} data-reveal-item className="flex flex-col gap-3">
              <span className="font-mono text-3xl text-ember md:text-4xl">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-xl text-timber">{step.title}</h3>
              <p className="font-body text-sm leading-relaxed text-oak">{step.text}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
