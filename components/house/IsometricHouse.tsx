'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { houseLabels } from '@/lib/constants'

/**
 * Interaktivní 3D dům = hlavní navigace homepage.
 *
 * Těžká R3F scéna se načítá jen na klientovi (`ssr: false`). Skutečné
 * odkazy menu žijí navíc ve fallback `<nav>`, který je vždy v DOM (SSR) —
 * crawlovatelný a funkční i bez WebGL / JS. Vizuální menu pro WebGL uživatele
 * tvoří 3D labely ukotvené k částem domu (uvnitř `HouseScene`).
 */
const HouseScene = dynamic(() => import('./HouseScene'), {
  ssr: false,
  loading: () => <MenuFallback />,
})

export function IsometricHouse() {
  const t = useTranslations()

  return (
    <div className="relative h-[100dvh] w-full select-none">
      <HouseScene />

      {/* Crawlovatelná / přístupná navigace (vždy v DOM, vizuálně skrytá). */}
      <MenuList className="sr-only" />

      {/* Bez JS: viditelné textové menu. */}
      <noscript>
        <MenuList className="absolute inset-0 flex flex-col items-center justify-center gap-4" />
      </noscript>

      {/* Nápověda */}
      <div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center md:bottom-24">
        <p className="font-body text-xs uppercase tracking-widest text-cream/40">
          {t('home.hint')}
        </p>
      </div>
    </div>
  )
}

/** Seznam odkazů menu — sdílený fallback (SSR / noscript / loading). */
function MenuList({ className }: { className?: string }) {
  return (
    <nav aria-label="Rozcestník — části domu" className={className}>
      <ul className="flex flex-col items-center gap-4">
        {houseLabels.map((label) => (
          <li key={label.id}>
            <Link
              href={label.href}
              className="pointer-events-auto text-center text-cream outline-none transition-colors hover:text-wood-amber"
            >
              <span className="block font-display text-xl italic leading-none">
                {label.text}
              </span>
              <span className="block font-body text-[0.6rem] uppercase tracking-widest opacity-60">
                {label.subtext}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Stav během načítání 3D scény — viditelné textové menu. */
function MenuFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <MenuList className="flex flex-col items-center gap-4" />
    </div>
  )
}
