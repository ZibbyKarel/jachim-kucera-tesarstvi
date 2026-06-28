'use client'

import type { ReactNode } from 'react'

interface HouseSectionProps {
  id: string
  active: boolean
  onActivate: () => void
  onHover: (groupId: string | null) => void
  children: ReactNode
}

/**
 * Interaktivní část domu (#g-…). Slouží jako vizuální/myší afordance —
 * přístupnou navigaci zajišťují textové labely okolo domu (viz IsometricHouse),
 * proto je skupina `aria-hidden` a není ve fokus pořadí.
 */
export function HouseSection({
  id,
  active,
  onActivate,
  onHover,
  children,
}: HouseSectionProps) {
  return (
    <g
      id={id}
      aria-hidden="true"
      onClick={onActivate}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className="house-section cursor-pointer outline-none"
      data-active={active ? 'true' : 'false'}
    >
      <g
        className="transition-[stroke,opacity] duration-300"
        style={{
          stroke: active ? 'var(--wood-amber)' : '#F5ECD7',
          opacity: active ? 1 : 0.8,
        }}
      >
        {children}
      </g>
    </g>
  )
}
