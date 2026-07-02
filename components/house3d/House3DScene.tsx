'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { MENU, type MenuId } from './config'
import { SceneManager } from './SceneManager'
import type { MenuLabelText } from './MenuOverlay'

/* -------------------------------------------------------------------------- */
/*  House3DScene — React mount pro vanilla Three.js scénu                       */
/*                                                                             */
/*  Veškerá 3D logika žije v SceneManageru (čistý TS). Tahle komponenta jen     */
/*  drží kontejner, vytvoří/zruší scénu a propojí onMenuSelect. WebGL běží      */
/*  výhradně v efektu (klient), takže SSR se nedotkne `window`.                 */
/* -------------------------------------------------------------------------- */

export interface House3DSceneProps {
  /** Emitne se při kliknutí na položku menu. Zatím bez routingu. */
  onMenuSelect?: (id: MenuId) => void
  className?: string
  /** Průhledné pozadí — scéna leží na panelu (papír) za canvasem. */
  transparent?: boolean
  /** Přehrát úvodní vykreslení? (false = dům rovnou plně vykreslen) */
  playIntro?: boolean
  /** Zavolá se po dokončení úvodního vykreslení. */
  onIntroDone?: () => void
}

export function House3DScene({
  onMenuSelect,
  className,
  transparent,
  playIntro,
  onIntroDone,
}: House3DSceneProps) {
  const t = useTranslations()
  const labels: Record<MenuId, MenuLabelText> = Object.fromEntries(
    MENU.map((item) => [
      item.id,
      {
        service: t(`services.${item.serviceSlug}.title`),
        element: t(`house3dMenu.${item.id}`),
      },
    ])
  ) as Record<MenuId, MenuLabelText>

  const containerRef = useRef<HTMLDivElement>(null)
  // drž poslední callbacky bez restartu scény
  const cbRef = useRef(onMenuSelect)
  cbRef.current = onMenuSelect
  const introDoneRef = useRef(onIntroDone)
  introDoneRef.current = onIntroDone
  const labelsRef = useRef(labels)
  labelsRef.current = labels

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const manager = new SceneManager(container, {
      onMenuSelect: (id) => cbRef.current?.(id),
      labels: labelsRef.current,
      transparent,
      playIntro,
      onIntroDone: () => introDoneRef.current?.(),
    })
    return () => manager.dispose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transparent, playIntro])

  return (
    <div
      ref={containerRef}
      className={className ?? 'relative h-[100dvh] w-full'}
      style={{ touchAction: transparent ? 'auto' : 'none' }}
    />
  )
}
