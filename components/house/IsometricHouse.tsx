'use client'

import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { houseLabels } from '@/lib/constants'

/* -------------------------------------------------------------------------- */
/*  Izometrická skica domu (čáry + jemné stínování)                            */
/*                                                                              */
/*  Vše žije v jednom SVG `viewBox`: tvar domu, spojnice i textové labely      */
/*  (přes <foreignObject>). Díky tomu spojnice přesně míří na svou část domu    */
/*  a škálují se s ní. Hlavní navigace je textová okolo domu; kliknout lze ale  */
/*  i přímo na odpovídající část domu — vede na stejnou stránku.                */
/* -------------------------------------------------------------------------- */

/* Barva čar i stínování — jedna inkoustová (charcoal). */
const INK = '#2d2b28'

/* Izometrické cesty (čáry obrysu). Generováno z 3D iso projekce —
   všechny stěny sdílí přesné vrcholy, takže nic „nezalézá" do domu. */
const PATHS = {
  foundation: [
    'M238.6 327 L417 430 L417 418.6 L238.6 315.6 Z',
    'M417 430 L535.9 361.3 L535.9 349.9 L417 418.6 Z',
  ],
  walls: [
    'M238.6 315.6 L417 418.6 L417 319.4 L238.6 216.4 Z',
    'M417 418.6 L535.9 349.9 L535.9 250.7 L476.5 220.2 L417 319.4 Z',
  ],
  roof: [
    'M290.8 113 L483.7 224.4 L417 327.8 L224.1 216.4 Z',
    'M476.5 220.2 L483.7 224.4',
    'M417 319.4 L417 327.8',
  ],
  truss: [
    'M535.9 250.7 L417 319.4',
    'M476.5 285 L476.5 220.2',
    'M506.2 267.9 L495.5 233.9',
    'M446.7 302.2 L457.4 255.8',
  ],
  gutters: [
    'M417 327.8 L224.1 216.4',
    'M417 327.8 L417 426.9',
  ],
  chimney: [
    'M322.8 110 L339.4 119.5 L324.5 128.1 L308 118.6 Z',
    'M308 118.6 L324.5 128.1 L324.5 184.4 L308 174.8 Z',
    'M322.8 110 L308 118.6 L308 174.8 L322.8 150.1 Z',
  ],
  windows: [
    'M271.6 304.1 L296.4 318.4 L296.4 280.3 L271.6 266 Z',
    'M284 311.3 L284 273.1',
    'M271.6 285 L296.4 299.4',
    'M324.5 334.6 L349.3 348.9 L349.3 310.8 L324.5 296.5 Z',
    'M336.9 341.8 L336.9 303.6',
    'M324.5 315.6 L349.3 329.9',
    'M370.8 361.3 L395.5 375.6 L395.5 337.5 L370.8 323.2 Z',
    'M383.1 368.5 L383.1 330.3',
    'M370.8 342.3 L395.5 356.6',
  ],
  door: [
    'M491.3 375.6 L461.6 392.8 L461.6 322.2 L491.3 305.1 Z',
    'M486.4 378.5 L466.6 389.9 L466.6 325.1 L486.4 313.7 Z',
    'M476.5 384.2 L476.5 319.4',
  ],
}

/* Plochy pro jemné stínování — stejná inkoustová barva, jen různá průhlednost. */
const SHADE: { d: string; o: number }[] = [
  // základ
  { d: 'M238.6 327 L417 430 L417 418.6 L238.6 315.6 Z', o: 0.16 },
  { d: 'M417 430 L535.9 361.3 L535.9 349.9 L417 418.6 Z', o: 0.22 },
  // stěny: boční (ke světlu) + čelní štít (jemně ve stínu)
  { d: 'M238.6 315.6 L417 418.6 L417 319.4 L238.6 216.4 Z', o: 0.05 },
  { d: 'M417 418.6 L535.9 349.9 L535.9 250.7 L476.5 220.2 L417 319.4 Z', o: 0.1 },
  // střecha
  { d: 'M290.8 113 L483.7 224.4 L417 327.8 L224.1 216.4 Z', o: 0.14 },
  // komín (dvě boční stěny)
  { d: 'M308 118.6 L324.5 128.1 L324.5 184.4 L308 174.8 Z', o: 0.16 },
  { d: 'M322.8 110 L308 118.6 L308 174.8 L322.8 150.1 Z', o: 0.1 },
  // dveře
  { d: 'M491.3 375.6 L461.6 392.8 L461.6 322.2 L491.3 305.1 Z', o: 0.13 },
  // skla oken
  { d: 'M271.6 304.1 L296.4 318.4 L296.4 280.3 L271.6 266 Z', o: 0.08 },
  { d: 'M324.5 334.6 L349.3 348.9 L349.3 310.8 L324.5 296.5 Z', o: 0.08 },
  { d: 'M370.8 361.3 L395.5 375.6 L395.5 337.5 L370.8 323.2 Z', o: 0.08 },
]

/* Neviditelné hit-area polygony pro snadný klik na tenké tahy. */
const HIT: Record<string, string> = {
  'g-roof': 'M290.8 113 L483.7 224.4 L417 327.8 L224.1 216.4 Z',
  'g-truss': 'M535.9 250.7 L476.5 220.2 L417 319.4 Z',
  'g-gutters': 'M224.1 216.4 L417 327.8 L417 426.9 Z',
  'g-chimney': 'M322.8 110 L339.4 119.5 L324.5 128.1 L308 118.6 Z',
  'g-door': 'M491.3 375.6 L461.6 392.8 L461.6 322.2 L491.3 305.1 Z',
  'g-windows': '', // okenní rámy jsou klikatelné samy
}

/* Stroke šířka per skupina. */
const STROKE_W: Record<string, number> = {
  'g-roof': 1,
  'g-truss': 0.9,
  'g-gutters': 1.1,
  'g-chimney': 1,
  'g-door': 1,
  'g-windows': 0.9,
}

/* Rozvržení spojnic + labelů (souřadnice ve viewBoxu). */
type Side = 'left' | 'right' | 'bottom'
const LAYOUT: Record<string, { anchor: [number, number]; point: [number, number]; side: Side }> = {
  'g-chimney': { anchor: [323, 112], point: [250, 86], side: 'left' },
  'g-roof': { anchor: [300, 150], point: [150, 132], side: 'left' },
  'g-windows': { anchor: [284, 311], point: [150, 392], side: 'left' },
  'g-truss': { anchor: [476, 240], point: [600, 214], side: 'right' },
  'g-gutters': { anchor: [417, 360], point: [600, 372], side: 'right' },
  'g-door': { anchor: [476, 360], point: [600, 432], side: 'right' },
}

const VIEWBOX = '10 50 740 440'
const LABEL_W = 190
const LABEL_H = 56

export function IsometricHouse() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)

  const navigate = (href: string) => router.push(href)

  // Draw-on intro pro čáry (respektuje reduced motion).
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set('.draw-path', { drawSVG: '100%', opacity: 1 })
        gsap.set('.house-shade, .house-label-layer', { opacity: 1 })
        return
      }
      gsap.set('.house-shade', { opacity: 0 })
      const tl = gsap.timeline({ delay: 0.1 })
      tl.from('.draw-path', {
        drawSVG: '0%',
        duration: 0.6,
        stagger: 0.012,
        ease: 'power2.inOut',
      })
      tl.to('.house-shade', { opacity: 1, duration: 0.5, ease: 'power1.out' }, '-=0.35')
      tl.from(
        '.house-label-layer',
        { opacity: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative h-[100dvh] w-full select-none">
      <svg
        viewBox={VIEWBOX}
        className="absolute inset-0 h-full w-full overflow-visible"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Stín na zemi */}
        <defs>
          <radialGradient id="house-shadow">
            <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="400" cy="452" rx="180" ry="26" fill="url(#house-shadow)" opacity="0.5" />

        {/* Stínování (vyplněné plochy) — vše ve stejné inkoustové barvě */}
        <g className="house-shade" style={{ pointerEvents: 'none' }}>
          {SHADE.map((s, i) => (
            <path key={i} d={s.d} fill={INK} fillOpacity={s.o} stroke="none" />
          ))}
        </g>

        {/* Neinteraktivní obrys */}
        <g stroke={INK} strokeWidth={0.9} opacity={0.55} style={{ pointerEvents: 'none' }}>
          <DrawPaths d={PATHS.foundation} />
        </g>
        <g stroke={INK} strokeWidth={1} opacity={0.85} style={{ pointerEvents: 'none' }}>
          <DrawPaths d={PATHS.walls} />
        </g>

        {/* Interaktivní části domu */}
        {houseLabels.map((label) => (
          <InteractivePart
            key={label.groupId}
            id={label.groupId}
            active={active === label.groupId}
            onHover={setActive}
            onActivate={() => navigate(label.href)}
          />
        ))}

        {/* Spojnice + textové labely (jen desktop) */}
        <g className="house-label-layer hidden md:block">
          {houseLabels.map((label) => (
            <ConnectedLabel
              key={label.groupId}
              groupId={label.groupId}
              text={label.text}
              subtext={label.subtext}
              href={label.href}
              active={active === label.groupId}
              onHover={setActive}
            />
          ))}
        </g>
      </svg>

      {/* Mobilní textové menu (viditelné na malých displejích) */}
      <nav
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-28 flex flex-col items-center gap-2.5 md:hidden"
      >
        {houseLabels.map((label) => (
          <Link
            key={label.id}
            href={label.href}
            tabIndex={-1}
            onTouchStart={() => setActive(label.groupId)}
            className="pointer-events-auto rounded-full border border-cream/10 bg-wood-medium/90 px-5 py-2 text-center text-cream shadow-sm backdrop-blur-sm"
            style={{ color: active === label.groupId ? 'var(--wood-amber)' : undefined }}
          >
            <span className="font-display text-lg italic leading-none">{label.text}</span>
          </Link>
        ))}
      </nav>

      {/* Přístupná / crawlovatelná navigace (vždy v DOM, vizuálně skrytá). */}
      <nav aria-label="Rozcestník — části domu" className="sr-only">
        <ul>
          {houseLabels.map((label) => (
            <li key={label.id}>
              <Link href={label.href}>
                {label.text} — {label.subtext}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  )
}

/* -------------------------------------------------------------------------- */

function DrawPaths({ d }: { d: string[] }) {
  return (
    <>
      {d.map((path) => (
        <path key={path} d={path} className="draw-path" fill="none" style={{ pointerEvents: 'none' }} />
      ))}
    </>
  )
}

/** Obrysové čáry části domu + průhledná hit-area; klik = navigace. */
function InteractivePart({
  id,
  active,
  onHover,
  onActivate,
}: {
  id: string
  active: boolean
  onHover: (g: string | null) => void
  onActivate: () => void
}) {
  const paths = PATHS[id.replace('g-', '') as keyof typeof PATHS]
  const hit = HIT[id]
  const isWindows = id === 'g-windows'

  return (
    <g
      id={id}
      aria-hidden="true"
      onClick={onActivate}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer outline-none"
    >
      <g
        strokeWidth={STROKE_W[id]}
        className="transition-[stroke,opacity] duration-300"
        style={{ stroke: active ? 'var(--wood-amber)' : '#2d2b28', opacity: active ? 1 : 0.8 }}
      >
        {paths.map((d) => {
          // U oken jsou rámy (uzavřené polygony) klikatelné, příčle ne.
          const clickable = isWindows && d.endsWith('Z')
          return (
            <path
              key={d}
              d={d}
              className="draw-path"
              fill={clickable ? 'transparent' : 'none'}
              style={{ pointerEvents: clickable ? 'all' : 'none' }}
            />
          )
        })}
      </g>
      {hit && (
        <path d={hit} fill="transparent" stroke="transparent" strokeWidth={10} style={{ pointerEvents: 'all' }} />
      )}
    </g>
  )
}

/** Spojnice z části domu k textovému labelu (desktop). */
function ConnectedLabel({
  groupId,
  text,
  subtext,
  href,
  active,
  onHover,
}: {
  groupId: string
  text: string
  subtext: string
  href: string
  active: boolean
  onHover: (g: string | null) => void
}) {
  const { anchor, point, side } = LAYOUT[groupId]
  const [ax, ay] = anchor
  const [px, py] = point
  const color = active ? 'var(--wood-amber)' : 'var(--cream)'

  // Pozice foreignObjectu vůči kotvícímu bodu spojnice.
  let foX = px
  let foY = py - LABEL_H / 2
  let justify = 'flex-start'
  let textAlign: 'left' | 'right' | 'center' = 'left'
  if (side === 'left') {
    foX = px - LABEL_W
    justify = 'flex-end'
    textAlign = 'right'
  } else if (side === 'bottom') {
    foX = px - LABEL_W / 2
    foY = py
    justify = 'center'
    textAlign = 'center'
  }

  return (
    <g>
      <line
        x1={ax}
        y1={ay}
        x2={px}
        y2={py}
        stroke={color}
        strokeWidth={0.8}
        opacity={active ? 0.9 : 0.5}
        className="transition-[stroke,opacity] duration-300"
      />
      <circle cx={ax} cy={ay} r={active ? 3 : 2.2} fill={color} className="transition-all duration-300" />
      <foreignObject x={foX} y={foY} width={LABEL_W} height={LABEL_H} style={{ overflow: 'visible' }}>
        <div
          // @ts-expect-error xmlns je platný v foreignObjectu (HTML namespace)
          xmlns="http://www.w3.org/1999/xhtml"
          style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: justify }}
        >
          <Link
            href={href}
            tabIndex={-1}
            aria-hidden="true"
            onMouseEnter={() => onHover(groupId)}
            onMouseLeave={() => onHover(null)}
            className="block whitespace-nowrap outline-none transition-colors"
            style={{ color, textAlign }}
          >
            <span className="block font-display text-xl italic leading-none">{text}</span>
            <span className="block font-body text-[0.6rem] uppercase tracking-widest opacity-60">
              {subtext}
            </span>
          </Link>
        </div>
      </foreignObject>
    </g>
  )
}
