'use client'

import { useEffect, useRef } from 'react'
import type { MenuId } from './config'
import { SceneManager } from './SceneManager'

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
  const containerRef = useRef<HTMLDivElement>(null)
  // drž poslední callbacky bez restartu scény
  const cbRef = useRef(onMenuSelect)
  cbRef.current = onMenuSelect
  const introDoneRef = useRef(onIntroDone)
  introDoneRef.current = onIntroDone

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const manager = new SceneManager(container, {
      onMenuSelect: (id) => cbRef.current?.(id),
      transparent,
      playIntro,
      onIntroDone: () => introDoneRef.current?.(),
    })
    return () => manager.dispose()
  }, [transparent, playIntro])

  return (
    <div
      ref={containerRef}
      className={className ?? 'relative h-[100dvh] w-full'}
      style={{ touchAction: transparent ? 'auto' : 'none' }}
    />
  )
}
