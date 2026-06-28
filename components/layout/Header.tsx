'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { navLinks } from '@/lib/constants'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Header() {
  const t = useTranslations('common')
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
  // Tmavé pozadí headeru: na homepage až po Hero, jinde po malém odscrollování.
  const solid = (isHome ? pastHero : scrolled) || menuOpen

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid
          ? 'border-b border-cream/10 bg-wood-dark/85 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container-content flex items-center justify-between py-4">
        <Logo />

        <nav
          aria-label="Hlavní navigace"
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
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-5">
          <LanguageSwitcher />

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
                className={`h-px bg-cream transition-all duration-300 ${
                  menuOpen ? 'w-6 translate-y-[7px] rotate-45' : 'w-6'
                }`}
              />
              <span
                className={`h-px bg-cream transition-all duration-300 ${
                  menuOpen ? 'w-0 opacity-0' : 'w-4'
                }`}
              />
              <span
                className={`h-px bg-cream transition-all duration-300 ${
                  menuOpen ? 'w-6 -translate-y-[7px] -rotate-45' : 'w-5'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Fullscreen overlay menu (mobil) */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col bg-wood-dark transition-opacity duration-500 lg:hidden ${
          menuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <nav
          aria-label="Mobilní navigace"
          className="flex flex-1 flex-col justify-center gap-2 px-8"
        >
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={menuOpen ? undefined : -1}
              className="font-display text-4xl italic text-cream transition-colors duration-300 hover:text-wood-amber"
              style={{
                transitionDelay: menuOpen ? `${i * 40 + 100}ms` : '0ms',
                transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
                opacity: menuOpen ? 1 : 0,
                transitionProperty: 'opacity, transform, color',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-cream/10 px-8 py-6">
          <span className="font-body text-xs uppercase tracking-widest text-wood-light">
            {t('region')}
          </span>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
