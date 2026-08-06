'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

interface CounterProps {
  value: string
  label: string
}

/** Vytáhne číselnou část a předponu/příponu (např. "20+" → 20, "+"). */
function parse(value: string) {
  const match = value.match(/^(\D*)(\d+)(\D*)$/)
  if (!match) return { prefix: '', num: null as number | null, suffix: value }
  return { prefix: match[1], num: parseInt(match[2], 10), suffix: match[3] }
}

export function Counter({ value, label }: CounterProps) {
  const numRef = useRef<HTMLSpanElement>(null)
  const { prefix, num, suffix } = parse(value)

  useEffect(() => {
    const el = numRef.current
    if (!el || num === null) return

    if (prefersReducedMotion()) {
      el.textContent = String(num)
      return
    }

    const obj = { val: 0 }
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: num,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.val))
        },
      })
    })
    return () => ctx.revert()
  }, [num])

  return (
    <div className="text-center">
      <div className="font-mono text-4xl text-patina md:text-5xl">
        {prefix}
        {num !== null ? <span ref={numRef}>0</span> : null}
        {num === null ? <span>{suffix}</span> : suffix}
      </div>
      <div className="mt-2 font-body text-xs uppercase tracking-widest text-slate/60">
        {label}
      </div>
    </div>
  )
}
