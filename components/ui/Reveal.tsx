'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

interface RevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  /** zpoždění v sekundách */
  delay?: number
  /** posun zdola v px */
  y?: number
  /** animovat potomky se staggerem (vybírá [data-reveal-item]) */
  stagger?: boolean
}

/**
 * Obecný scroll-in reveal. Element (nebo jeho potomci s [data-reveal-item])
 * najede zdola s fade. Respektuje prefers-reduced-motion.
 */
export function Reveal({
  children,
  as,
  className = '',
  delay = 0,
  y = 28,
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const Tag = (as ?? 'div') as ElementType

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const targets = stagger
        ? el.querySelectorAll('[data-reveal-item]')
        : [el]

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }

      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.9,
        delay,
        stagger: stagger ? 0.12 : 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [delay, y, stagger])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
