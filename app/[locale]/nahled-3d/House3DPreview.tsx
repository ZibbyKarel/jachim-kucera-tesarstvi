'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { House3DScene, MENU, type MenuId } from '@/components/house3d'

/* Klientský náhled — drží poslední emitnutý onMenuSelect (zatím bez routingu). */
export function House3DPreview() {
  const t = useTranslations()
  const [selected, setSelected] = useState<MenuId | null>(null)
  const item = MENU.find((m) => m.id === selected)
  const label = item ? t(`services.${item.serviceSlug}.title`) : null

  return (
    <main className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden bg-white">
      <House3DScene onMenuSelect={setSelected} />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6">
        <p className="font-display text-lg italic text-[#35332f]">
          {t('nahled3d.heading')}
        </p>
        <p
          className="font-body text-xs uppercase tracking-widest text-[#a07d33] transition-opacity duration-300"
          style={{ opacity: label ? 1 : 0 }}
        >
          {label ? `onMenuSelect → ${label}` : '—'}
        </p>
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center font-body text-[0.65rem] uppercase tracking-[0.2em] text-[#35332f]/40">
        {t('nahled3d.hint')}
      </p>
    </main>
  )
}
