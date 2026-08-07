import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Arrow } from '@/components/ui/Button'
import { services } from '@/lib/constants'

/* -------------------------------------------------------------------------- */
/*  ServiceIndex — rejstřík služeb, timber pole                                 */
/*                                                                              */
/*  Nahrazuje starou bento mřížku (ServicesGrid) i mobilní kartový seznam       */
/*  (MobileServiceGrid). Čtyři celoplošné odkazové řádky, každý na              */
/*  /sluzby/<slug>. Sám o sobě je mobilní navigací - žádná zvláštní mobilní     */
/*  varianta.                                                                  */
/*                                                                              */
/*  Layout: `md:contents` na vnitřním wrapperu čísla+šipky ho na desktopu       */
/*  „rozpustí" do rodičovské grid, takže vznikne přesně sloupcová sazba         */
/*  auto/1fr/auto/auto (číslo | název | tagline | šipka) beze duplicitního      */
/*  DOM. Na mobilu (flex-col) zůstává číslo+šipka jako jeden řádek nahoře,      */
/*  název a tagline pod ním - šipka tak i na mobilu zůstává vpravo.             */
/* -------------------------------------------------------------------------- */

export function ServiceIndex() {
  const t = useTranslations()

  return (
    <section aria-labelledby="service-index-heading" className="bg-timber py-20 md:py-28">
      <div className="container-content">
        <h2
          id="service-index-heading"
          className="font-mono text-xs uppercase tracking-widest text-oak-soft"
        >
          {t('home.serviceIndexHeading')}
        </h2>

        <div className="mt-8 md:mt-12">
          {services.map((service, i) => (
            <Link
              key={service.slug}
              href={`/sluzby/${service.slug}`}
              className="group flex min-h-[88px] flex-col justify-center gap-2 border-t border-paper/40 py-5 transition-colors duration-200 first:border-t-0 hover:bg-ember focus-visible:bg-ember focus-visible:outline-paper motion-reduce:transition-none md:grid md:min-h-[120px] md:grid-cols-[auto_1fr_auto_auto] md:items-center md:gap-8 md:py-0"
            >
              <div className="flex items-center justify-between md:contents">
                <span className="font-mono text-sm text-oak-soft transition-colors duration-200 group-hover:text-paper">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Arrow className="text-oak-soft transition-all duration-200 group-hover:translate-x-1 group-hover:text-paper md:hidden" />
              </div>

              <span className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-none text-paper">
                {t(`services.${service.slug}.title`)}
              </span>

              <span className="font-body text-sm text-oak-soft transition-colors duration-200 group-hover:text-paper md:text-base">
                {t(`services.${service.slug}.tagline`)}
              </span>

              <Arrow className="hidden text-oak-soft transition-all duration-200 group-hover:translate-x-1 group-hover:text-paper md:block md:justify-self-end" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
