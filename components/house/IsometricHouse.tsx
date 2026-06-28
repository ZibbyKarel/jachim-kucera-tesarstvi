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

/* Izometrické cesty (čáry obrysu). */
const PATHS = {
  foundation: [
    'M350 256.7 L532.9 362.3 L532.9 355.6 L350 250 Z',
    'M532.9 362.3 L408.2 434.3 L408.2 427.6 L532.9 355.6 Z',
  ],
  walls: [
    'M350 250 L532.9 355.6 L532.9 230.8 L350 125.2 Z',
    'M532.9 355.6 L408.2 427.6 L408.2 302.8 L470.6 214 L532.9 230.8 Z',
    'M350 187.6 L532.9 293.2 L408.2 365.2',
    'M532.9 230.8 L408.2 302.8',
  ],
  roof: [
    'M350 122.4 L551.2 238.5 L479.7 219.3 L278.5 103.1 Z',
    'M278.5 103.1 L479.7 219.3 L408.2 321.1 L207 204.9 Z',
    'M278.5 103.1 L479.7 219.3',
    'M350 122.4 L278.5 103.1',
    'M310.7 111.8 L511.9 227.9',
  ],
  truss: [
    'M532.9 230.8 L408.2 302.8',
    'M532.9 230.8 L470.6 214',
    'M408.2 302.8 L470.6 214',
    'M470.6 266.8 L470.6 214',
    'M501.7 248.8 L484.3 229.1',
    'M439.4 284.8 L456.8 245',
  ],
  gutters: [
    'M350 124.8 L551.2 240.9',
    'M551.2 243.3 L537.1 235.6 L537.1 355.6',
  ],
  chimney: [
    'M314.7 157.3 L333.4 168.1 L333.4 122.8 L314.7 112 Z',
    'M333.4 168.1 L314.7 194.7 L314.7 133.6 L333.4 122.8 Z',
    'M314.7 112 L333.4 122.8 L314.7 133.6 L296 122.8 Z',
    'M314.7 108.6 L339.2 122.8 L314.7 137 L290.1 122.8 Z',
  ],
  windows: [
    'M372.9 241.6 L399.9 257.2 L399.9 226 L372.9 210.4 Z',
    'M386.4 249.4 L386.4 218.2',
    'M372.9 226 L399.9 241.6',
    'M483 305.2 L510 320.8 L510 289.6 L483 274 Z',
    'M496.5 313 L496.5 281.8',
    'M483 289.6 L510 305.2',
    'M372.9 184 L399.9 199.6 L399.9 168.4 L372.9 152.8 Z',
    'M386.4 191.8 L386.4 160.6',
    'M372.9 168.4 L399.9 184',
    'M483 247.6 L510 263.2 L510 232 L483 216.4 Z',
    'M496.5 255.4 L496.5 224.2',
    'M483 232 L510 247.6',
    'M486.3 248.1 L454.8 266.3 L454.8 236.6 L486.3 218.3 Z',
  ],
  door: [
    'M433.1 298 L464.3 316 L464.3 241.6 L433.1 223.6 Z',
    'M437.3 295.6 L460.2 308.8 L460.2 244 L437.3 230.8 Z',
    'M448.7 302.2 L448.7 237.4',
    'M456 277.6 L456 269.9',
  ],
}

/* Plochy pro jemné stínování (vyplněné polygony pod čarami). */
const SHADE: { d: string; fill: string }[] = [
  // základ
  { d: 'M350 256.7 L532.9 362.3 L532.9 355.6 L350 250 Z', fill: '#6b5f51' },
  { d: 'M532.9 362.3 L408.2 434.3 L408.2 427.6 L532.9 355.6 Z', fill: '#5d5246' },
  // stěny: boční (přivrácená ke světlu) + čelní štít (ve stínu)
  { d: 'M350 250 L532.9 355.6 L532.9 230.8 L350 125.2 Z', fill: '#e7dcc2' },
  { d: 'M532.9 355.6 L408.2 427.6 L408.2 302.8 L470.6 214 L532.9 230.8 Z', fill: '#d2c4a3' },
  // střecha: dvě roviny
  { d: 'M350 122.4 L551.2 238.5 L479.7 219.3 L278.5 103.1 Z', fill: '#8a5736' },
  { d: 'M278.5 103.1 L479.7 219.3 L408.2 321.1 L207 204.9 Z', fill: '#724529' },
  // komín
  { d: 'M314.7 157.3 L333.4 168.1 L333.4 122.8 L314.7 112 Z', fill: '#9a5238' },
  { d: 'M333.4 168.1 L314.7 194.7 L314.7 133.6 L333.4 122.8 Z', fill: '#7d4029' },
  { d: 'M314.7 108.6 L339.2 122.8 L314.7 137 L290.1 122.8 Z', fill: '#a9603f' },
  // dveře
  { d: 'M433.1 298 L464.3 316 L464.3 241.6 L433.1 223.6 Z', fill: '#4a3322' },
  // skla oken
  { d: 'M372.9 241.6 L399.9 257.2 L399.9 226 L372.9 210.4 Z', fill: '#9fc4d6' },
  { d: 'M483 305.2 L510 320.8 L510 289.6 L483 274 Z', fill: '#9fc4d6' },
  { d: 'M372.9 184 L399.9 199.6 L399.9 168.4 L372.9 152.8 Z', fill: '#9fc4d6' },
  { d: 'M483 247.6 L510 263.2 L510 232 L483 216.4 Z', fill: '#9fc4d6' },
  { d: 'M486.3 248.1 L454.8 266.3 L454.8 236.6 L486.3 218.3 Z', fill: '#9fc4d6' },
]

/* Neviditelné hit-area polygony pro snadný klik na tenké tahy. */
const HIT: Record<string, string> = {
  'g-roof': 'M350 122.4 L551.2 238.5 L479.7 219.3 L278.5 103.1 Z',
  'g-truss': 'M532.9 230.8 L408.2 302.8 L470.6 214 Z',
  'g-gutters': 'M348 116 L552 233 L552 251 L350 134 Z',
  'g-chimney': 'M290 120 L340 120 L333 169 L315 159 Z',
  'g-door': 'M433.1 298 L464.3 316 L464.3 241.6 L433.1 223.6 Z',
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
  'g-chimney': { anchor: [314, 120], point: [232, 92], side: 'left' },
  'g-roof': { anchor: [340, 200], point: [190, 182], side: 'left' },
  'g-windows': { anchor: [386, 235], point: [190, 342], side: 'left' },
  'g-truss': { anchor: [486, 250], point: [560, 206], side: 'right' },
  'g-gutters': { anchor: [540, 296], point: [576, 318], side: 'right' },
  'g-door': { anchor: [452, 300], point: [566, 408], side: 'right' },
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

        {/* Stínování (vyplněné plochy) */}
        <g className="house-shade" style={{ pointerEvents: 'none' }}>
          {SHADE.map((s, i) => (
            <path key={i} d={s.d} fill={s.fill} stroke="none" />
          ))}
        </g>

        {/* Neinteraktivní obrys */}
        <g stroke="#a07d33" strokeWidth={0.9} opacity={0.6} style={{ pointerEvents: 'none' }}>
          <DrawPaths d={PATHS.foundation} />
        </g>
        <g stroke="#2d2b28" strokeWidth={1} opacity={0.85} style={{ pointerEvents: 'none' }}>
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
            className="pointer-events-auto text-center text-cream"
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
