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
  // Separator glyph is real visible text, not decoration - it must clear AA
  // on its own. Minimum opacities per docs/superpowers/redesign/PALETTE-WOOD.md
  // ("Minimální přípustná průhlednost"): timber/N as text on paper needs N≥65
  // (4.87:1 at the floor), paper/N as text on timber needs N≥50 (4.50:1 at the
  // floor). Both values below are above their respective floor with margin.
  const sep = light ? 'text-paper/55' : 'text-timber/65'
  // idle - same floors as `sep` above (timber/N≥65 on paper, paper/N≥50 on timber).
  const idle = light
    ? 'text-paper/60 hover:text-paper'
    : 'text-timber/70 hover:text-timber'
  // On the dark `timber` background (light===true, e.g. the mobile menu), plain
  // `text-ember` fails AA as text - use `text-ember-soft` there instead (6.99:1
  // on timber, see PALETTE-WOOD.md). On the light background, `text-ember`
  // (5.56:1 on paper) is fine on its own.
  const active = light ? 'text-ember-soft' : 'text-ember'

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
