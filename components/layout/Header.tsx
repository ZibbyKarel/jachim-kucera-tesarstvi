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

export function Header() {
  const t = useTranslations('common')
  const tFull = useTranslations()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [pastHero, setPastHero] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Na homepage je menu skryté nad Hero sekcí (navigaci tam tvoří dům).
  // Objeví se, jakmile uživatel odscrolluje pod Hero.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      setPastHero(window.scrollY > window.innerHeight - 140)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Desktop navigace: na homepage až po Hero, jinde vždy.
  const showNav = !isHome || pastHero
  // Plné pozadí headeru: na homepage až po Hero, jinde po malém odscrollování.
  // Při otevřeném menu zůstane průhledný — splyne s tmavým fullscreen overlayem.
  const solid = !menuOpen && (isHome ? pastHero : scrolled)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid
          ? 'border-b border-cream/10 bg-wood-dark/85 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container-content flex items-center justify-between py-4">
        {/* Logo je na homepage nad Hero redundantní (nese ho i dům) — objeví se
            zároveň s horní navigací (po Hero / na podstránkách), menší. */}
        <div
          className={`transition-opacity duration-500 ${
            showNav ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={!showNav}
        >
          <Logo size={56} tabIndex={showNav ? undefined : -1} />
        </div>

        <nav
          aria-label={t('mainNavAria')}
          className={`hidden items-center gap-8 transition-opacity duration-500 lg:flex ${
            showNav ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                tabIndex={showNav ? undefined : -1}
                className={`link-underline font-body text-xs uppercase tracking-widest transition-colors duration-300 ${
                  active ? 'text-wood-amber' : 'text-cream/80 hover:text-cream'
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
            className="relative z-50 flex h-10 w-8 items-center justify-center lg:hidden"
          >
            <span className="sr-only">{menuOpen ? t('close') : t('menu')}</span>
            <div className="flex w-6 flex-col items-end gap-[6px]">
              <span
                className={`h-px transition-all duration-300 ${
                  menuOpen ? 'w-6 translate-y-[7px] rotate-45 bg-wood-medium' : 'w-6 bg-cream'
                }`}
              />
              <span
                className={`h-px transition-all duration-300 ${
                  menuOpen ? 'w-0 opacity-0 bg-wood-medium' : 'w-4 bg-cream'
                }`}
              />
              <span
                className={`h-px transition-all duration-300 ${
                  menuOpen ? 'w-6 -translate-y-[7px] -rotate-45 bg-wood-medium' : 'w-5 bg-cream'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Fullscreen overlay menu (mobil) — tmavé pozadí přes celou obrazovku */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex h-[100dvh] w-screen flex-col bg-charcoal transition-opacity duration-300 lg:hidden ${
          menuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
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
              className="font-display text-4xl italic text-wood-medium transition-colors duration-300 hover:text-wood-amber"
            >
              {navLabel(tFull, link.textSource)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-wood-medium/10 px-8 py-6">
          <span className="font-body text-xs uppercase tracking-widest text-wood-light">
            {t('region')}
          </span>
          <LanguageSwitcher light />
        </div>
      </div>
    </header>
  )
}
