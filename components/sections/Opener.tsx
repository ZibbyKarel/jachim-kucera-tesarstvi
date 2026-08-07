import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Arrow } from '@/components/ui/Button'
import { LOGO_ASPECT_RATIO } from '@/components/layout/Logo'
import { OpenerHouse } from './OpenerHouse'

/* -------------------------------------------------------------------------- */
/*  Opener — otvírák homepage                                                   */
/*                                                                              */
/*  Nahrazuje starý HeroScroll (dům + scroll choreografie). Obsah je zarovnaný  */
/*  dolů (justify-end), ne na střed - dává sekci váhu. Normální dokumentový     */
/*  tok, žádný pin/scrub.                                                      */
/*                                                                              */
/*  Rok založení (2008) potvrdil klient 2026-08-07. Předtím to bylo jen číslo   */
/*  odvozené z about.timeline; potvrzení ho z odvozeniny dělá fakt. Pozor, že   */
/*  rejstřík uvádí u Petra Jáchima živnost už od roku 2003 - 2008 je tedy rok   */
/*  vzniku společné party, ne první živnosti. ICU parametr {year} drží text a   */
/*  číslo odděleně v messages.                                                  */
/*                                                                              */
/*  Faktický pás bere hodnoty výhradně z about.stats (dvě položky v obsahu -    */
/*  dvě položky se zobrazí, žádná třetí/čtvrtá se nedomýšlí). Obě tvrzení       */
/*  („15+ let praxe", „150+ realizací") klient potvrdil 2026-08-07.             */
/*                                                                              */
/*  D-062: `min-h-[88svh]` samo o sobě roste s výškou okna bez stropu - na      */
/*  nízkém notebookovém displeji (~830-930px výšky) to vypadá v pořádku, ale    */
/*  na vysokém externím monitoru (1080p+) nechával nad textem stovky pixelů     */
/*  prázdna, protože obsahový blok dole má prakticky konstantní výšku (`<h1>`   */
/*  je omezené na `max-w-[14ch]`, takže se nezalamuje jinak podle šířky okna).  */
/*  `min(88svh,820px)` je proto strop, ne floor - pod 932px výšky okna (kde     */
/*  88 % dá ≤820px) se chová úplně stejně jako dřív, nad tím přestane růst.     */
/*  820px odpovídá tomu, jak sekce vypadá na běžné notebookové výšce (změřeno   */
/*  na 929px: `min-h` vyšlo 817px) - cíl je zamrazit dnešní, už schválený       */
/*  poměr, ne redesignovat ho.                                                 */
/* -------------------------------------------------------------------------- */

const FOUNDED_YEAR = 2008

export function Opener() {
  const t = useTranslations('home')
  const tCommon = useTranslations('common')
  const tAbout = useTranslations('about')
  const stats = tAbout.raw('stats') as { value: string; label: string }[]

  return (
    <section
      aria-labelledby="opener-heading"
      className="relative flex min-h-[min(88svh,820px)] flex-col justify-end overflow-hidden bg-paper"
    >
      <div className="grain absolute inset-0" aria-hidden="true" />
      {/* Dekorativní 3D dům - jen desktop, neinteraktivní (viz OpenerHouse.tsx).
          Rejstřík služeb (ServiceIndex) zůstává jedinou navigací, dům je čistá
          kresba za textem, ne klikací plocha. */}
      <OpenerHouse />
      {/* D-061: pod `lg` OpenerHouse nic nekreslí (viz její vlastní komentář),
          takže tam nad textem zíval prázdný prostor. Velké logo (stejný
          lockup jako v hlavičce) ten prostor vyplňuje - `flex-1` na obalu
          pohltí přesně to, co v `flex-col justify-end` sekci zbyde nad
          `container-content`, ať je stránka česká nebo anglická, hlavička
          zúžená nebo ne - žádné natvrdo zadané odsazení shora, které by se
          muselo dolaďovat zvlášť.

          `pt-28` na obalu (stejná hodnota jako `pt-*` níž na
          `container-content`) je pojistka, ne jen odsazení loga od hlavičky:
          ověřeno simulovaným mobilním viewportem (386×840 v <iframe>), že
          součet loga a textového bloku někdy přesáhne `min-h` sekce (D-062) -
          pak nemá `flex-1` žádný volný prostor k rozdělení a bez pojistky by
          se logo přilepilo na `top: 0`, tedy PODÉ fixní hlavičku (ta má na
          mobilu nescrollovaná ~84-96px). `pt-28` garantuje odstup od
          hlavičky vždy, ať flex prostor zbyde, nebo ne.

          Dekorace, ne druhá navigace: `aria-hidden`, žádný <Link> - jsme už
          na homepage, odkaz na sebe sama by byl matoucí duplicita. `id`
          je pozorovaný cíl pro IntersectionObserver v Header.tsx: dokud je
          tohle logo v viewportu, logo v hlavičce zůstává schované (jinak by
          se na jedné obrazovce zdvojilo), po odscrollování se vrátí. */}
      <div
        className="relative z-10 flex flex-1 items-center justify-center pt-28 lg:hidden"
        aria-hidden="true"
      >
        <Image
          id="mobile-hero-logo"
          src="/logo_2.png"
          alt=""
          width={Math.round(180 * LOGO_ASPECT_RATIO)}
          height={180}
          priority
          className="h-[clamp(96px,22svh,180px)] w-auto object-contain"
        />
      </div>
      <div className="container-content relative z-10 pb-14 pt-28 md:pb-20 md:pt-32">
        <p className="font-mono text-xs uppercase tracking-widest text-oak">
          {tCommon('region')} · {t('openerEyebrowFounded', { year: FOUNDED_YEAR })}
        </p>

        <h1
          id="opener-heading"
          className="mt-5 max-w-[14ch] text-balance font-display text-[clamp(2.5rem,5.5vw,5rem)] leading-[0.95] tracking-tight text-timber"
        >
          {t('openerTitle')}
        </h1>

        <p className="mt-6 max-w-[38ch] font-body text-lg text-oak md:max-w-[46ch] md:text-xl">
          {t('openerLead')}
        </p>

        <div className="mt-10 grid grid-cols-2 border-t border-timber/20 pt-8 sm:inline-grid sm:auto-cols-max sm:grid-flow-col">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col gap-1 pr-8 ${i > 0 ? 'border-l border-timber/20 pl-8' : ''}`}
            >
              <span className="font-mono text-3xl text-timber sm:text-4xl">{stat.value}</span>
              <span className="font-mono text-xs uppercase tracking-widest text-oak">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
          <Link
            href="/kontakt"
            className="group link-underline inline-flex w-fit items-center gap-2 font-body text-timber"
          >
            {t('openerCtaInquiry')}
            <Arrow className="transition-transform duration-300 ease-craft group-hover:translate-x-1" />
          </Link>
          <Link
            href="/realizace"
            className="group link-underline inline-flex w-fit items-center gap-2 font-body text-timber"
          >
            {t('openerCtaProjects')}
            <Arrow className="transition-transform duration-300 ease-craft group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
