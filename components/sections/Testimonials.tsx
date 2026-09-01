import { useTranslations } from 'next-intl'
import { Reveal } from '@/components/ui/Reveal'

/* -------------------------------------------------------------------------- */
/*  Testimonials — ohlasy zákazníků, paper pole                                 */
/*                                                                              */
/*  Texty jsou převzaté doslova ze starého firemního webu sikovnytesar.cz,      */
/*  sekce #recenze - stejný zdroj jako fotky realizací (viz lib/constants.ts).  */
/*                                                                              */
/*  Jejich pravost NENÍ ověřená. Na původním webu u nich není žádný zdroj,      */
/*  žádné schema.org značkování ani odkaz na Google/Firmy.cz, autoři jsou jen   */
/*  iniciály (např. „Jana K.") a celý web je šablonový - pod všemi pěti         */
/*  službami se opakují tytéž tři odrážky textu. Klidně tedy může jít o         */
/*  výplňový text, ne o skutečné ohlasy zákazníků.                             */
/*                                                                              */
/*  Proto se nesmí promítnout do strukturovaných dat (JSON-LD `Review` /        */
/*  `AggregateRating` v app/[locale]/layout.tsx), dokud je klient nepotvrdí -    */
/*  falešné recenze ve strukturovaných datech jsou porušení pravidel            */
/*  vyhledávačů. Do té doby žijí jen jako běžný viditelný text na stránce.       */
/*                                                                              */
/*  Výměna za potvrzené/skutečné ohlasy je levná: stačí přepsat                */
/*  `testimonials.items` v messages/{locale}.json, komponenta se nemění.        */
/*                                                                              */
/*  Vizuálně stejný rytmus hairline řádků jako sekce „Hodnoty" na               */
/*  app/[locale]/o-mne/page.tsx - žádné hvězdičky, hodnocení, avatary, fotky,   */
/*  data ani lokality, protože nic z toho nemáme.                              */
/* -------------------------------------------------------------------------- */

export function Testimonials() {
  const t = useTranslations('testimonials')
  const items = t.raw('items') as { quote: string; author: string }[]

  return (
    <section aria-labelledby="testimonials-heading" className="bg-paper py-24 md:py-32">
      <div className="container-content">
        <p className="font-mono text-xs uppercase tracking-widest text-oak">{t('eyebrow')}</p>
        <h2
          id="testimonials-heading"
          className="mt-3 font-display text-3xl text-timber md:text-4xl"
        >
          {t('heading')}
        </h2>

        <Reveal stagger className="mt-14 border-t border-timber/20 md:mt-20">
          {items.map((item) => (
            <figure
              key={item.author}
              data-reveal-item
              className="grid grid-cols-1 gap-3 border-b border-timber/20 py-8 md:grid-cols-12 md:items-baseline md:gap-8"
            >
              <blockquote className="md:col-span-8">
                <p className="font-display text-[clamp(1.125rem,1.8vw,1.5rem)] leading-snug text-timber">
                  {item.quote}
                </p>
              </blockquote>
              <figcaption className="font-mono text-xs uppercase tracking-widest text-oak md:col-span-3 md:col-start-10 md:text-right">
                {item.author}
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
