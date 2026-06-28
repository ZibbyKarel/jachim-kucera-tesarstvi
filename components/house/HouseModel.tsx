'use client'

import { useMemo, type ReactNode } from 'react'
import type {} from '@react-three/fiber'
import * as THREE from 'three'
import { DIMS, GEO, PART_HREF, MAT } from './dimensions'

/* -------------------------------------------------------------------------- */
/*  Typy a sdílené pomůcky                                                      */
/* -------------------------------------------------------------------------- */

interface PartProps {
  active: string | null
  onHover: (groupId: string | null) => void
  onActivate: (href: string) => void
}

/** Kotvy 3D labelů (model space). Doladěno vizuálně. */
export const LABEL_ANCHORS: { groupId: string; pos: [number, number, number] }[] = [
  { groupId: 'g-roof', pos: [0, GEO.ridgeY + 0.2, 0] },
  { groupId: 'g-chimney', pos: [1.3, GEO.ridgeY + 1.05, -0.4] },
  { groupId: 'g-truss', pos: [0, 2.7, GEO.halfD + 2.4] },
  { groupId: 'g-gutters', pos: [GEO.eaveX + 0.35, GEO.eaveY + 0.1, GEO.halfD] },
  { groupId: 'g-windows', pos: [-GEO.halfW - 0.35, GEO.wallCenterY + 0.2, 1.0] },
  { groupId: 'g-door', pos: [0, GEO.foundTopY + 2.25, GEO.halfD + 0.3] },
]

/** Interaktivní obal části domu: hover/klik + kurzor. */
function InteractivePart({
  groupId,
  onHover,
  onActivate,
  children,
}: {
  groupId: string
  onHover: (g: string | null) => void
  onActivate: (href: string) => void
  children: ReactNode
}) {
  return (
    <group
      name={groupId}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(groupId)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        onHover(null)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e) => {
        e.stopPropagation()
        onActivate(PART_HREF[groupId])
      }}
    >
      {children}
    </group>
  )
}

/** Standardní materiál s emisivním zvýrazněním při aktivaci. */
function Mat({
  color,
  active,
  metalness = 0,
  roughness = 0.85,
}: {
  color: string
  active: boolean
  metalness?: number
  roughness?: number
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={MAT.highlight}
      emissiveIntensity={active ? 0.4 : 0}
      metalness={metalness}
      roughness={roughness}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Neinteraktivní základ domu                                                 */
/* -------------------------------------------------------------------------- */

function Foundation() {
  return (
    <mesh position={[0, DIMS.foundH / 2, 0]} receiveShadow castShadow>
      <boxGeometry args={[DIMS.width + 0.3, DIMS.foundH, DIMS.depth + 0.3]} />
      <meshStandardMaterial color={MAT.foundation} roughness={0.95} />
    </mesh>
  )
}

function Walls() {
  // Štítové trojúhelníky nad stěnami (přední +Z a zadní −Z).
  const gable = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-GEO.halfW, GEO.eaveY)
    s.lineTo(GEO.halfW, GEO.eaveY)
    s.lineTo(0, GEO.ridgeY)
    s.closePath()
    return s
  }, [])

  return (
    <group>
      <mesh position={[0, GEO.wallCenterY, 0]} castShadow receiveShadow>
        <boxGeometry args={[DIMS.width, DIMS.wallH, DIMS.depth]} />
        <meshStandardMaterial color={MAT.wall} roughness={0.9} />
      </mesh>
      {/* přední štít */}
      <mesh position={[0, 0, GEO.halfD]}>
        <shapeGeometry args={[gable]} />
        <meshStandardMaterial color={MAT.wall} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* zadní štít */}
      <mesh position={[0, 0, -GEO.halfD]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[gable]} />
        <meshStandardMaterial color={MAT.wall} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  Interaktivní části                                                          */
/* -------------------------------------------------------------------------- */

function Roof({ active, onHover, onActivate }: PartProps) {
  const on = active === 'g-roof'
  const midY = (GEO.ridgeY + GEO.eaveY) / 2
  const half = GEO.roofHalfBase / 2
  return (
    <InteractivePart groupId="g-roof" onHover={onHover} onActivate={onActivate}>
      {/* pravá rovina (+X) */}
      <mesh position={[half, midY, 0]} rotation={[0, 0, -GEO.roofAngle]} castShadow>
        <boxGeometry args={[GEO.roofSlopeLen, DIMS.roofThick, GEO.roofLenZ]} />
        <Mat color={MAT.roof} active={on} />
      </mesh>
      {/* levá rovina (−X) */}
      <mesh position={[-half, midY, 0]} rotation={[0, 0, GEO.roofAngle]} castShadow>
        <boxGeometry args={[GEO.roofSlopeLen, DIMS.roofThick, GEO.roofLenZ]} />
        <Mat color={MAT.roof} active={on} />
      </mesh>
    </InteractivePart>
  )
}

function Gutters({ active, onHover, onActivate }: PartProps) {
  const on = active === 'g-gutters'
  const y = GEO.eaveY - 0.05
  return (
    <InteractivePart groupId="g-gutters" onHover={onHover} onActivate={onActivate}>
      {/* žlaby podél obou okapních hran */}
      <mesh position={[GEO.eaveX, y, 0]} castShadow>
        <boxGeometry args={[0.14, 0.14, GEO.roofLenZ]} />
        <Mat color={MAT.metal} active={on} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-GEO.eaveX, y, 0]} castShadow>
        <boxGeometry args={[0.14, 0.14, GEO.roofLenZ]} />
        <Mat color={MAT.metal} active={on} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* svislý svod v předním rohu */}
      <mesh position={[GEO.eaveX, GEO.eaveY / 2, GEO.halfD - 0.1]} castShadow>
        <boxGeometry args={[0.1, GEO.eaveY, 0.1]} />
        <Mat color={MAT.metal} active={on} metalness={0.6} roughness={0.4} />
      </mesh>
    </InteractivePart>
  )
}

function Chimney({ active, onHover, onActivate }: PartProps) {
  const on = active === 'g-chimney'
  const base = 2.6
  const top = GEO.ridgeY + 0.8
  const h = top - base
  return (
    <InteractivePart groupId="g-chimney" onHover={onHover} onActivate={onActivate}>
      <mesh position={[1.3, base + h / 2, -0.4]} castShadow>
        <boxGeometry args={[0.5, h, 0.5]} />
        <Mat color={MAT.brick} active={on} roughness={1} />
      </mesh>
      {/* hlavice */}
      <mesh position={[1.3, top + 0.06, -0.4]} castShadow>
        <boxGeometry args={[0.66, 0.12, 0.66]} />
        <Mat color={MAT.brick} active={on} roughness={1} />
      </mesh>
    </InteractivePart>
  )
}

function Win({
  position,
  size,
  facing,
  active,
}: {
  position: [number, number, number]
  size: [number, number]
  facing: 'x' | 'z'
  active: boolean
}) {
  const [w, h] = size
  const depth = 0.12
  const frame: [number, number, number] =
    facing === 'x' ? [depth, h, w] : [w, h, depth]
  const glass: [number, number, number] =
    facing === 'x' ? [depth * 0.5, h * 0.82, w * 0.82] : [w * 0.82, h * 0.82, depth * 0.5]
  const push = depth * 0.4
  const glassPos: [number, number, number] =
    facing === 'x'
      ? [Math.sign(position[0]) * push, 0, 0]
      : [0, 0, Math.sign(position[2]) * push]
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={frame} />
        <Mat color={MAT.frame} active={active} />
      </mesh>
      <mesh position={glassPos}>
        <boxGeometry args={glass} />
        <meshStandardMaterial
          color={MAT.glass}
          emissive={active ? MAT.highlight : MAT.glass}
          emissiveIntensity={active ? 0.5 : 0.18}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
    </group>
  )
}

function Windows({ active, onHover, onActivate }: PartProps) {
  const on = active === 'g-windows'
  const y = GEO.wallCenterY + 0.2
  return (
    <InteractivePart groupId="g-windows" onHover={onHover} onActivate={onActivate}>
      {/* boční stěna +X */}
      <Win position={[GEO.halfW, y, -1.1]} size={[1.0, 1.2]} facing="x" active={on} />
      <Win position={[GEO.halfW, y, 1.1]} size={[1.0, 1.2]} facing="x" active={on} />
      {/* boční stěna −X */}
      <Win position={[-GEO.halfW, y, -1.1]} size={[1.0, 1.2]} facing="x" active={on} />
      <Win position={[-GEO.halfW, y, 1.1]} size={[1.0, 1.2]} facing="x" active={on} />
      {/* štítové okno nad dveřmi (+Z) */}
      <Win position={[0, GEO.eaveY + 0.45, GEO.halfD]} size={[0.8, 0.8]} facing="z" active={on} />
    </InteractivePart>
  )
}

function Door({ active, onHover, onActivate }: PartProps) {
  const on = active === 'g-door'
  const h = 2.0
  const y = GEO.foundTopY + h / 2
  return (
    <InteractivePart groupId="g-door" onHover={onHover} onActivate={onActivate}>
      <mesh position={[0, y, GEO.halfD]} castShadow>
        <boxGeometry args={[1.1, h + 0.05, 0.12]} />
        <Mat color={MAT.frame} active={on} />
      </mesh>
      <mesh position={[0, y - 0.05, GEO.halfD + 0.05]} castShadow>
        <boxGeometry args={[0.9, h - 0.1, 0.08]} />
        <Mat color={MAT.wood} active={on} />
      </mesh>
      {/* klika */}
      <mesh position={[0.32, y - 0.05, GEO.halfD + 0.11]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <Mat color={MAT.metal} active={on} metalness={0.7} roughness={0.3} />
      </mesh>
    </InteractivePart>
  )
}

function Pergola({ active, onHover, onActivate }: PartProps) {
  const on = active === 'g-truss'
  const postH = 2.4
  const px = GEO.halfW - 0.4 // poloha sloupků v X
  const z1 = GEO.halfD + 0.5 // přední řada
  const z2 = GEO.halfD + 2.2 // zadní řada (u domu)
  const beamY = postH + 0.05
  const spanZ = z1 - z2 // záporné, vezmeme abs
  const rafterLen = Math.abs(spanZ) + 0.4
  const rafterZ = (z1 + z2) / 2
  const crossW = 2 * px + 0.4
  const crossZs = [z2 + 0.1, z2 + 0.65, rafterZ, z1 - 0.1]
  const posts: [number, number][] = [
    [px, z1],
    [-px, z1],
    [px, z2],
    [-px, z2],
  ]
  return (
    <InteractivePart groupId="g-truss" onHover={onHover} onActivate={onActivate}>
      {/* sloupky */}
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, postH / 2, z]} castShadow>
          <boxGeometry args={[0.18, postH, 0.18]} />
          <Mat color={MAT.beam} active={on} />
        </mesh>
      ))}
      {/* podélné nosníky (podél Z) na obou stranách */}
      {[px, -px].map((x, i) => (
        <mesh key={i} position={[x, beamY, rafterZ]} castShadow>
          <boxGeometry args={[0.16, 0.2, rafterLen]} />
          <Mat color={MAT.beam} active={on} />
        </mesh>
      ))}
      {/* příčné trámy (podél X) */}
      {crossZs.map((z, i) => (
        <mesh key={i} position={[0, beamY + 0.16, z]} castShadow>
          <boxGeometry args={[crossW, 0.14, 0.14]} />
          <Mat color={MAT.wood} active={on} />
        </mesh>
      ))}
    </InteractivePart>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sestavení modelu                                                           */
/* -------------------------------------------------------------------------- */

export function HouseModel(props: PartProps) {
  return (
    <group>
      <Foundation />
      <Walls />
      <Roof {...props} />
      <Gutters {...props} />
      <Chimney {...props} />
      <Windows {...props} />
      <Door {...props} />
      <Pergola {...props} />
    </group>
  )
}
