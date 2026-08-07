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
  const sep = light ? 'text-paper/30' : 'text-slate/30'
  const idle = light
    ? 'text-paper/60 hover:text-paper'
    : 'text-slate/60 hover:text-slate'
  // On the dark `slate` background (light===true, e.g. the mobile menu), `text-patina`
  // falls to ~2.8:1 as text and fails AA — use `text-patina-soft` there instead
  // (5.69:1 on slate). On the light background, `text-patina` (5.14:1 on paper) is fine.
  const active = light ? 'text-patina-soft' : 'text-patina'

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
              loc === locale ? active : idle
            }`}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  )
}
