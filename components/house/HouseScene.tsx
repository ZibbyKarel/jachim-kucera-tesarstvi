'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, ContactShadows } from '@react-three/drei'
import type { Group } from 'three'
import { useRouter, Link } from '@/i18n/routing'
import { houseLabels } from '@/lib/constants'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { HouseModel, LABEL_ANCHORS } from './HouseModel'
import { useHouseRotation, type RotationState } from './useHouseRotation'

/* -------------------------------------------------------------------------- */
/*  Kamera                                                                      */
/* -------------------------------------------------------------------------- */

function CameraRig() {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    camera.lookAt(0, 2.3, 0.3)
  }, [camera])
  return null
}

/* -------------------------------------------------------------------------- */
/*  Rotující skupina + idle auto-rotace + intro                                */
/* -------------------------------------------------------------------------- */

function RotatingHouse({
  rotationRef,
  idleMs,
  active,
  onHover,
  onActivate,
}: {
  rotationRef: { current: RotationState }
  idleMs: number
  active: string | null
  onHover: (g: string | null) => void
  onActivate: (href: string) => void
}) {
  const group = useRef<Group>(null)
  const autoAngle = useRef(0)

  // Úvodní scale-in (respektuje reduced motion).
  useEffect(() => {
    if (!group.current || prefersReducedMotion()) return
    const tween = gsap.fromTo(
      group.current.scale,
      { x: 0.85, y: 0.85, z: 0.85 },
      { x: 1, y: 1, z: 1, duration: 0.9, ease: 'power2.out' }
    )
    return () => {
      tween.kill()
    }
  }, [])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const s = rotationRef.current
    let target = s.targetY
    if (!s.reduced && performance.now() - s.lastActivity > idleMs) {
      autoAngle.current += delta * 0.12
      target = Math.sin(autoAngle.current) * 0.35
    }
    g.rotation.y += (target - g.rotation.y) * Math.min(1, delta * 3)
  })

  return (
    <group ref={group}>
      <HouseModel active={active} onHover={onHover} onActivate={onActivate} />

      {LABEL_ANCHORS.map((anchor) => {
        const label = houseLabels.find((l) => l.groupId === anchor.groupId)
        if (!label) return null
        const on = active === anchor.groupId
        return (
          <Html
            key={anchor.groupId}
            position={anchor.pos}
            center
            occlude
            zIndexRange={[20, 0]}
            style={{ pointerEvents: 'auto' }}
          >
            <Link
              href={label.href}
              onMouseEnter={() => onHover(anchor.groupId)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(anchor.groupId)}
              onBlur={() => onHover(null)}
              className="house-label-3d block whitespace-nowrap text-center outline-none"
              style={{ color: on ? 'var(--wood-amber)' : 'var(--cream)' }}
            >
              <span className="block font-display text-lg italic leading-none drop-shadow">
                {label.text}
              </span>
              <span className="block font-body text-[0.55rem] uppercase tracking-widest opacity-70">
                {label.subtext}
              </span>
            </Link>
          </Html>
        )
      })}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  Scéna                                                                       */
/* -------------------------------------------------------------------------- */

export default function HouseScene() {
  const router = useRouter()
  const [active, setActive] = useState<string | null>(null)
  const { rotationRef, enableGyro, markActivity, IDLE_MS } = useHouseRotation()

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [7.5, 4.5, 9], fov: 38 }}
        onPointerDown={markActivity}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#1c130c']} />
        <CameraRig />

        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#fff5e6', '#3a2a1c', 0.5]} />
        <directionalLight
          position={[6, 9, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={1}
          shadow-camera-far={30}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={12}
          shadow-camera-bottom={-2}
        />

        <RotatingHouse
          rotationRef={rotationRef}
          idleMs={IDLE_MS}
          active={active}
          onHover={setActive}
          onActivate={(href) => router.push(href)}
        />

        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.4}
          blur={2.4}
          scale={18}
          far={8}
          resolution={512}
          color="#000000"
        />
      </Canvas>

      {/* Gyro toggle (mobil) */}
      <button
        type="button"
        onClick={enableGyro}
        className="pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full border border-cream/20 px-4 py-1.5 font-body text-[0.65rem] uppercase tracking-widest text-cream/50 transition-colors hover:text-cream md:hidden"
      >
        Naklonit telefonem
      </button>
    </div>
  )
}
