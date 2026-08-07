'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { houseLabels } from '@/lib/constants'
import type { HouseLabel, NavLink } from '@/lib/types'

function labelText(t: (key: string) => string, source: NavLink['textSource']) {
  return source.ns === 'service' ? t(`services.${source.slug}.title`) : t(`nav.${source.key}`)
}

const ICONS: Record<HouseLabel['key'], JSX.Element> = {
  roof: <path d="M4 20 16 8l12 12M8 18v8h16v-8" />,
  truss: <path d="M4 22 16 8l12 14M8 20l8-9 8 9M16 8v14" />,
  gutters: <path d="M4 10h20M6 10v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M14 14v6a2 2 0 0 0 2 2h2" />,
  chimney: <path d="M6 26 16 12l10 14M11 19V9h4v6M8 24h16" />,
  windows: <path d="M7 6h18v20H7zM16 6v20M7 16h18" />,
  door: <path d="M9 27V6h14v21M9 27h14M20 16v2" />,
}

export function MobileServiceGrid({ className = '' }: { className?: string }) {
  const t = useTranslations()

  return (
    <nav
      aria-label={t('common.mobileServicesNavAria')}
      className={`grid grid-cols-2 gap-2.5 ${className}`}
    >
      {houseLabels.map((label: HouseLabel) => (
        <Link
          key={label.id}
          href={label.href}
          className="group flex min-h-[44px] items-center gap-3 rounded-sm border border-timber/50 bg-paper/90 px-3.5 py-3 backdrop-blur-sm transition-colors hover:border-ember"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-oak transition-colors group-hover:text-ember"
          >
            {ICONS[label.key]}
          </svg>
          <span className="font-body text-sm leading-tight text-timber">
            {labelText(t, label.textSource)}
          </span>
        </Link>
      ))}
    </nav>
  )
}
