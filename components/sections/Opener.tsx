import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Arrow } from '@/components/ui/Button'

/* -------------------------------------------------------------------------- */
/*  Opener — otvírák homepage                                                   */
/*                                                                              */
/*  Nahrazuje starý HeroScroll (dům + scroll choreografie). Obsah je zarovnaný  */
/*  dolů (justify-end), ne na střed - dává sekci váhu. Normální dokumentový     */
/*  tok, žádný pin/scrub.                                                      */
/*                                                                              */
/*  Rok založení (2008) je vzatý z about.timeline v messages/cs.json - položka  */
/*  "Vlastní firma" / „Zakládáme vlastní tesařskou partu" je jediné místo v      */
/*  obsahu, které mluví o založení firmy. Číslo se odsud nevymýšlí, jen         */
/*  přebírá; ICU parametr {year} drží text a číslo odděleně v messages.        */
/*                                                                              */
/*  Faktický pás bere hodnoty výhradně z about.stats (dvě položky v obsahu -    */
/*  dvě položky se zobrazí, žádná třetí/čtvrtá se nedomýšlí).                   */
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
      className="relative flex min-h-[88svh] flex-col justify-end overflow-hidden bg-paper"
    >
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="container-content relative pb-14 pt-28 md:pb-20 md:pt-32">
        <p className="font-mono text-xs uppercase tracking-widest text-oak">
          {tCommon('region')} · {t('openerEyebrowFounded', { year: FOUNDED_YEAR })}
        </p>

        <h1
          id="opener-heading"
          className="mt-5 max-w-[14ch] text-balance font-display text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] tracking-tight text-timber"
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
