'use client'

import { useTranslations } from 'next-intl'
import { SITE } from '@/lib/constants'
import { ContactForm } from '@/components/ui/ContactForm'
import { Reveal } from '@/components/ui/Reveal'

/* -------------------------------------------------------------------------- */
/*  ContactSection — split kontakt, poslední sekce homepage před patičkou       */
/*                                                                              */
/*  Desktop: dva sloupce 50/50, na celou šířku okna (žádný container-content    */
/*  na vnějším wrapperu, ať barvy jdou do krajů). Vlevo paper + formulář,       */
/*  vpravo timber + faktické údaje velké a čitelné - "závěrečný obraz           */
/*  stránky" (spec §7).                                                        */
/*                                                                              */
/*  Pořadí v DOM je záměrně [faktické údaje, formulář]: s `md:flex-row-reverse` */
/*  se na desktopu první DOM potomek (údaje) objeví vpravo a druhý (formulář)   */
/*  vlevo - přesně podle zadání. Na mobilu (`flex-col`, bez reverse) zůstává    */
/*  DOM pořadí, tedy nejdřív údaje, pak formulář - taky přesně podle zadání.    */
/*                                                                              */
/*  ContactForm je funkčně beze změny (Web3Forms endpoint, validace, stavy).    */
/*  Vzhledově taky beze změny - je navržený pro paper pozadí (text-timber,      */
/*  border-timber, akcent ember) a levá půlka zůstává paper, takže sedí beze    */
/*  zásahu.                                                                    */
/* -------------------------------------------------------------------------- */

export function ContactSection() {
  const t = useTranslations()

  return (
    <section id="kontakt" aria-labelledby="contact-heading">
      <div className="flex flex-col md:flex-row-reverse">
        {/* Faktické údaje — timber, "závěrečný obraz stránky" */}
        <Reveal
          as="div"
          className="flex flex-col justify-center bg-timber px-6 py-20 md:w-1/2 md:px-16 md:py-32"
        >
          <dl className="flex flex-col gap-8">
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-oak-soft">
                {t('contact.phone')}
              </dt>
              <dd className="mt-2">
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="link-underline inline-block font-mono text-[clamp(1.5rem,2.5vw,2.25rem)] text-paper"
                >
                  {SITE.phone}
                </a>
              </dd>
            </div>

            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-oak-soft">
                {t('contact.emailLabel')}
              </dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${SITE.email}`}
                  className="link-underline inline-block break-all font-mono text-xl text-paper md:text-2xl"
                >
                  {SITE.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-oak-soft">
                {t('contact.areaLabel')}
              </dt>
              <dd className="mt-2 font-body text-lg text-paper">{t('common.region')}</dd>
            </div>

            <div className="border-t border-paper/40 pt-6">
              <p className="font-mono text-sm text-oak-soft">{t('common.companyIdLabel')}</p>
            </div>
          </dl>
        </Reveal>

        {/* Formulář — paper */}
        <Reveal
          as="div"
          delay={0.1}
          className="flex flex-col justify-center bg-paper px-6 py-20 md:w-1/2 md:px-16 md:py-32"
        >
          <h2
            id="contact-heading"
            className="font-display text-3xl text-timber md:text-4xl"
          >
            {t('home.contactHeadline')}
          </h2>
          <div className="mt-10">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
