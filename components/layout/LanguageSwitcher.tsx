'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { routing } from '@/i18n/routing'

export function LanguageSwitcher({
  className = '',
  light = false,
}: {
  className?: string
  /** Světlá varianta pro tmavé pozadí (otevřené mobilní menu). */
  light?: boolean
}) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const sep = light ? 'text-wood-medium/30' : 'text-cream/30'
  const idle = light
    ? 'text-wood-medium/60 hover:text-wood-medium'
    : 'text-cream/60 hover:text-cream'

  return (
    <div
      className={`flex items-center gap-1 font-body text-xs uppercase tracking-widest ${className}`}
      role="group"
      aria-label="Volba jazyka"
    >
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className={sep}>|</span>}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={loc === locale ? 'true' : undefined}
            className={`transition-colors duration-300 ${
              loc === locale ? 'text-wood-amber' : idle
            }`}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  )
}
