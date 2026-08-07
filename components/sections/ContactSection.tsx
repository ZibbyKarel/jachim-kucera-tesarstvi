'use client'

import { useTranslations } from 'next-intl'
import { SITE, people } from '@/lib/constants'
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
/*                                                                              */
/*  Sdílená komponenta (T5): `heading`/`description` jdou přepsat, ať se ta     */
/*  samá sazba dá znovupoužít jako závěrečné CTA na ServicePageTemplate         */
/*  (spec §A) beze duplikace markupu. Bez props se chová přesně jako předtím -  */
/*  homepage volá <ContactSection /> beze změny.                                */
/*                                                                              */
/*  Dekorativní "mapa" oblasti působnosti (prop `showMap`, jen na /kontakt) je   */
/*  pryč (klient 2026-08-07): byly to abstraktní SVG křivky s puntíkem, žádná    */
/*  skutečná geografie - k ničemu, jen placeholder. Oblast působnosti drží       */
/*  textový řádek `contact.areaLabel` / `common.region` výš ve sloupci.          */
/* -------------------------------------------------------------------------- */

export function ContactSection({
  heading,
  description,
}: {
  heading?: string
  description?: string
} = {}) {
  const t = useTranslations()

  return (
    <section id="kontakt" aria-labelledby="contact-heading">
      <div className="flex flex-col md:flex-row-reverse">
        {/* Faktické údaje — timber, "závěrečný obraz stránky" */}
        <Reveal
          as="div"
          className="flex flex-col justify-center bg-timber px-6 py-20 md:w-1/2 md:px-16 md:py-32"
        >
          {/* `<dl>` obaluje jen skutečné dvojice termín/hodnota (telefon, e-mail,
              oblast) - IČO řádky nejsou definiční páry, takže žijí mimo
              `<dl>` jako sourozenci, ne jako další `<div>` uvnitř něj. HTML spec
              povoluje uvnitř `<dl>` jen `dt`/`dd` skupiny nebo `<div>` obalující
              výhradně `dt`/`dd` - vnořený `<div>` s `<p>` by to porušil. */}
          <div className="flex flex-col gap-8">
            <dl className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <dt className="font-mono text-xs uppercase tracking-widest text-oak-soft">
                  {t('contact.phone')}
                </dt>
                {people.map((person) => (
                  <dd key={person.key}>
                    <span className="block font-mono text-sm text-oak-soft">{person.name}</span>
                    <a
                      href={`tel:${person.phoneHref}`}
                      className="link-underline mt-1 inline-block font-mono text-[clamp(1.5rem,2.5vw,2.25rem)] text-paper"
                    >
                      {person.phone}
                    </a>
                  </dd>
                ))}
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
            </dl>

            <div className="border-t border-paper/40 pt-6">
              <div className="flex flex-col gap-1">
                {people.map((person) => (
                  <p key={person.key} className="font-mono text-sm text-oak-soft">
                    {person.name} · {t('common.companyIdLabel')} {person.companyId}
                  </p>
                ))}
              </div>
            </div>

          </div>
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
            {heading ?? t('home.contactHeadline')}
          </h2>
          {description && (
            <p className="mt-4 max-w-md font-body text-base text-oak">{description}</p>
          )}
          <div className="mt-10">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
