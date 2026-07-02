'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

interface Milestone {
  year: string
  title: string
  description: string
}

export function Timeline() {
  const t = useTranslations('about')
  const timeline = t.raw('timeline') as Milestone[]
  const ref = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-milestone]')
      if (prefersReducedMotion()) {
        gsap.set(items, { opacity: 1, x: 0 })
        return
      }
      items.forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          x: -48,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 82%' },
        })
      })
      // postupné dokreslení svislé linky
      const line = el.querySelector('[data-timeline-line]')
      if (line) {
        gsap.from(line, {
          scaleY: 0,
          transformOrigin: 'top',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 70%',
            end: 'bottom 70%',
            scrub: 1,
          },
        })
      }
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <ol ref={ref} className="relative ml-3 space-y-12 pl-10 md:ml-6">
      <span
        data-timeline-line
        aria-hidden="true"
        className="absolute left-0 top-2 h-[calc(100%-1rem)] w-px bg-wood-warm/50"
      />
      {timeline.map((m) => (
        <li key={m.year} data-milestone className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[2.85rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-wood-amber bg-wood-dark md:-left-[3.35rem]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-wood-amber" />
          </span>
          <span className="font-display text-3xl italic text-wood-amber">
            {m.year}
          </span>
          <h3 className="mt-1 font-display text-2xl italic text-cream">
            {m.title}
          </h3>
          <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-cream/70">
            {m.description}
          </p>
        </li>
      ))}
    </ol>
  )
}
