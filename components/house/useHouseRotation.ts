'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/gsap'

const MAX_RAD = 0.5 // ±~29° kolem osy Y
const IDLE_MS = 2600 // po této době nečinnosti se spustí jemná auto-rotace

export interface RotationState {
  targetY: number // cílový úhel (rad), k němuž scéna lerpuje
  lastActivity: number // performance.now() poslední interakce
  reduced: boolean // prefers-reduced-motion
}

/**
 * Drží cílovou Y-rotaci domu v ref (čte ji `useFrame` ve scéně).
 * Zdroje vstupu: pohyb myši, dotyk, gyroskop (po `enableGyro`).
 * Při `prefers-reduced-motion` se vstupy nenavazují a auto-rotace se vypne.
 *
 * Vrací:
 *  - `rotationRef`  — sdílený stav rotace pro `useFrame`,
 *  - `enableGyro`   — aktivace gyroskopu z user gesta (iOS `requestPermission`),
 *  - `markActivity` — zaznamenání interakce (potlačí idle auto-rotaci).
 */
export function useHouseRotation() {
  const rotationRef = useRef<RotationState>({
    targetY: 0,
    lastActivity: 0,
    reduced: false,
  })
  const enableGyroRef = useRef<() => void>(() => {})

  useEffect(() => {
    const reduced = prefersReducedMotion()
    rotationRef.current.reduced = reduced
    rotationRef.current.lastActivity =
      typeof performance !== 'undefined' ? performance.now() : 0
    if (reduced) return

    const state = rotationRef.current
    const clamp = (v: number) => Math.max(-MAX_RAD, Math.min(MAX_RAD, v))
    const fromRatio = (ratio: number) => clamp((ratio - 0.5) * 2 * MAX_RAD)

    const touch = () => {
      state.lastActivity = performance.now()
    }

    const onMouseMove = (e: MouseEvent) => {
      state.targetY = fromRatio(e.clientX / window.innerWidth)
      touch()
    }

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      state.targetY = fromRatio(t.clientX / window.innerWidth)
      touch()
    }

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null) return
      state.targetY = clamp((e.gamma / 90) * MAX_RAD)
      touch()
    }

    enableGyroRef.current = () => {
      const DOE = window.DeviceOrientationEvent as
        | (typeof DeviceOrientationEvent & {
            requestPermission?: () => Promise<'granted' | 'denied'>
          })
        | undefined
      if (!DOE) return
      if (typeof DOE.requestPermission === 'function') {
        DOE.requestPermission()
          .then((res) => {
            if (res === 'granted')
              window.addEventListener('deviceorientation', onOrientation)
          })
          .catch(() => {
            /* tichý fallback na drag */
          })
      } else {
        window.addEventListener('deviceorientation', onOrientation)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }, [])

  return {
    rotationRef,
    enableGyro: () => enableGyroRef.current(),
    markActivity: () => {
      if (typeof performance !== 'undefined')
        rotationRef.current.lastActivity = performance.now()
    },
    IDLE_MS,
  }
}
