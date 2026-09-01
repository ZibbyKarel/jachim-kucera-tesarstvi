'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { navLinks } from '@/lib/constants'
import type { NavLink } from '@/lib/types'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'

function navLabel(t: (key: string) => string, source: NavLink['textSource']) {
  return source.ns === 'service' ? t(`services.${source.slug}.title`) : t(`nav.${source.key}`)
}

/* -------------------------------------------------------------------------- */
/*  Header — logo viditelné okamžitě a vždy                                    */
/*                                                                              */
/*  V1 schovávala logo (`opacity-0`) nad Hero sekcí homepage s odůvodněním      */
/*  „nese ho i dům" - dům žádný wordmark nenesl, takže nad ohybem nebyla        */
/*  značka vůbec. V2 nemá žádný dům na landingu, takže logo i navigace jsou     */
/*  vidět od prvního renderu, na homepage i všude jinde.                       */
/*                                                                              */
/*  Krom `scrolled` (> 40px, zúžení hlavičky) sleduje hlavička na homepage od   */
/*  D-061 ještě `logoHiddenForHero`: pod `lg` má domovská stránka vlastní       */
/*  velké logo v hero sekci (`Opener.tsx`, `#mobile-hero-logo`) - dokud je to   */
/*  logo vidět, logo v hlavičce zmizí (`opacity-0`, ne unmount), ať se dvě      */
/*  stejná loga nezdvojí na jedné obrazovce. Jakmile hero logo odscrolluje z    */
/*  viewportu, logo v hlavičce se vrátí. Na `lg`+ a na všech ostatních          */
/*  stránkách (žádné `#mobile-hero-logo` v DOM) zůstává vždy viditelné.         */
/* -------------------------------------------------------------------------- */

const HOME_PATHNAME = '/'
const DESKTOP_QUERY = '(min-width: 1024px)'

export function Header() {
  const t = useTranslations('common')
  const tFull = useTranslations()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  // Výchozí `true`: na homepage pod `lg` je při prvním vykreslení hero logo
  // vždy vidět (scroll = 0), takže logo v hlavičce má být od prvního
  // klientského renderu schované - žádný záblesk viditelného loga před tím,
  // než IntersectionObserver stihne doběhnout.
  const [heroLogoInView, setHeroLogoInView] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setIsDesktop(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (pathname !== HOME_PATHNAME || isDesktop) {
      setHeroLogoInView(false)
      return
    }
    const target = document.getElementById('mobile-hero-logo')
    if (!target) {
      setHeroLogoInView(false)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setHeroLogoInView(entry.isIntersecting))
    observer.observe(target)
    return () => observer.disconnect()
  }, [pathname, isDesktop])

  const logoHiddenForHero = pathname === HOME_PATHNAME && !isDesktop && heroLogoInView

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Zúžení headeru: na začátku stránky (nebo pokud je otevřené mobilní menu,
  // které má vlastní tmavé pozadí) zůstává plně průhledný.
  const solid = !menuOpen && scrolled
  // Logo je lockup (742×686, public/logo1_clean.svg) - dům + vysázené jméno
  // firmy na dvou řádcích pod ním, skoro čtvercový poměr stran, ne
  // širokoúhlý odznak.
  //
  // Výškové stropy (`h-8`/`h-10` pod `sm`, `h-12`/`h-14` od `sm`) byly
  // doladěné na 281px viewportu (nejužší testovaný, vedle jazykového
  // přepínače a hamburgeru) pro starší širokoúhlý lockup - u skoro
  // čtvercového logo1_clean.svg je teď šířky spíš nazbyt, ne málo, hodnoty
  // ale zůstávají zachované jako bezpečná spodní hranice. `h-14`/`h-12`
  // apod. jsou skutečné vykreslené rozměry (viz Logo.tsx
  // `heightClassName`); `height` prop níž slouží next/image jen jako
  // intrinsic atribut pro srcset (bere se z největší použité velikosti, ať
  // se retina desktop nedočká zvětšeného, rozmazaného downscalu).
  const logoHeightClass = solid ? 'h-8 sm:h-12' : 'h-10 sm:h-14'

  return (
    <header
      aria-label={t('siteHeaderAria')}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ease-craft ${
        solid ? 'border-timber/10 bg-paper/90 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <div
        className={`container-content flex items-center justify-between transition-all duration-500 ease-craft ${
          solid ? 'py-3' : 'py-5'
        }`}
      >
        {/* py-1.5/py-0.5 dorovnávají klikací plochu pod `sm` na 44px
            (32+2×6, 40+2×2) - viz komentář u logoHeightClass výše. Od `sm`
            už to obrázek přerostl (48px/56px), takže se padding ruší
            (`sm:py-0`), ať logo nestrhává i zbytek řádku hlavičky výš, než
            je nutné. */}
        <Logo
          height={56}
          heightClassName={logoHeightClass}
          tabIndex={logoHiddenForHero ? -1 : undefined}
          ariaHidden={logoHiddenForHero}
          className={`shrink-0 transition-opacity duration-500 ease-craft ${
            logoHiddenForHero ? 'pointer-events-none opacity-0' : 'opacity-100'
          } ${solid ? 'py-1.5 sm:py-0' : 'py-0.5 sm:py-0'}`}
        />

        <nav aria-label={t('mainNavAria')} className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
                  active ? 'text-ember' : 'text-oak hover:text-timber'
                }`}
              >
                {navLabel(tFull, link.textSource)}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-5">
          <LanguageSwitcher light={menuOpen} />

          {/* Hamburger — mobil / tablet (vždy dostupný) */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('close') : t('menu')}
            className={`relative z-50 flex h-11 w-11 items-center justify-center lg:hidden ${
              menuOpen ? 'focus-visible:outline-ember-soft' : ''
            }`}
          >
            <span className="sr-only">{menuOpen ? t('close') : t('menu')}</span>
            <div className="flex w-6 flex-col items-end gap-[6px]">
              <span
                className={`h-px transition-all duration-300 ${
                  menuOpen ? 'w-6 translate-y-[7px] rotate-45 bg-paper' : 'w-6 bg-timber'
                }`}
              />
              <span
                className={`h-px transition-all duration-300 ${
                  menuOpen ? 'w-0 opacity-0 bg-paper' : 'w-4 bg-timber'
                }`}
              />
              <span
                className={`h-px transition-all duration-300 ${
                  menuOpen ? 'w-6 -translate-y-[7px] -rotate-45 bg-paper' : 'w-5 bg-timber'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Fullscreen overlay menu (mobil) — timber pole přes celou obrazovku.
          #mobile-menu focus ring (ember-soft) je definovaný v app/globals.css. */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex h-[100dvh] w-screen flex-col bg-timber transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav
          aria-label={t('mobileNavAria')}
          className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={menuOpen ? undefined : -1}
              aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
              /* min-h-11 + px-4: řádkový box textu má 40px, což je pod dotykovým
                 cílem. Na mobilu je tohle jediná navigace, takže se doplácá
                 odsazením na 44px. */
              className="flex min-h-11 items-center justify-center px-4 font-display text-4xl text-paper transition-colors duration-300 hover:text-ember-soft"
            >
              {navLabel(tFull, link.textSource)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-paper/40 px-8 py-6">
          <span className="font-mono text-xs uppercase tracking-widest text-oak-soft">
            {t('region')}
          </span>
          <LanguageSwitcher light />
        </div>
      </div>
    </header>
  )
}
