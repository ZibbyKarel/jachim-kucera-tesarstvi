'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { houseLabels } from '@/lib/constants'
import { HouseSection } from './HouseSection'
import { useHouseRotation } from './useHouseRotation'

/* -- Izometrické cesty (generováno přesnou izo projekcí) -- */
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
  // okna: rámy (končí Z) jsou klikatelné polygony, vnitřní příčle ne
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

/* Neviditelné hit-area polygony pro snadný klik na tenké tahy. */
const HIT = {
  roof: 'M350 122.4 L551.2 238.5 L479.7 219.3 L278.5 103.1 Z',
  truss: 'M532.9 230.8 L408.2 302.8 L470.6 214 Z',
  gutters: 'M348 116 L552 233 L552 251 L350 134 Z',
  chimney: 'M290 120 L340 120 L333 169 L315 159 Z',
  door: 'M433.1 298 L464.3 316 L464.3 241.6 L433.1 223.6 Z',
}

export function IsometricHouse() {
  const t = useTranslations()
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const rotateRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)

  const { enableGyro } = useHouseRotation(rotateRef)

  const navigate = (href: string) => router.push(href)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const labels = gsap.utils.toArray<HTMLElement>('.house-label')

      if (prefersReducedMotion()) {
        gsap.set('.draw-path', { drawSVG: '100%', opacity: 1 })
        gsap.set('.house-labels', { opacity: 1 })
        gsap.set(labels, { opacity: 1, y: 0 })
        return
      }

      gsap.set('.house-labels', { opacity: 1 })
      // Svižná draw-on sekvence (~1.1 s celkem).
      const order = [
        ['foundation', 0.2],
        ['walls', 0.32],
        ['roof', 0.3],
        ['truss', 0.32],
        ['gutters', 0.22],
        ['chimney', 0.2],
        ['windows', 0.26],
        ['door', 0.2],
      ] as const

      const tl = gsap.timeline({ delay: 0.12 })
      order.forEach(([group, dur], i) => {
        tl.from(
          `#g-${group} .draw-path`,
          {
            drawSVG: '0%',
            duration: dur,
            stagger: 0.025,
            ease: 'power2.inOut',
          },
          i === 0 ? 0 : '-=0.18'
        )
      })
      tl.from(
        labels,
        { opacity: 0, y: 10, stagger: 0.06, duration: 0.4, ease: 'power2.out' },
        '-=0.25'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-[100dvh] w-full select-none"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 40%' }}
    >
      {/* Rotující vrstva */}
      <div
        ref={rotateRef}
        className="absolute inset-0 flex items-center justify-center will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg
          viewBox="180 80 400 380"
          className="h-[74%] max-h-[660px] w-auto max-w-[92vw] overflow-visible"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <ellipse
            cx="380"
            cy="440"
            rx="165"
            ry="26"
            fill="url(#house-shadow)"
            opacity="0.5"
          />
          <defs>
            <radialGradient id="house-shadow">
              <stop offset="0%" stopColor="#000" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Neinteraktivní vizuál */}
          <g id="g-foundation" stroke="#8B5E3C" strokeWidth="0.9" opacity="0.5">
            <DrawPaths d={PATHS.foundation} />
          </g>
          <g id="g-walls" stroke="#F5ECD7" strokeWidth="1" opacity="0.85">
            <DrawPaths d={PATHS.walls} />
          </g>

          {/* Interaktivní skupiny */}
          <InteractiveGroup
            id="g-roof"
            active={active === 'g-roof'}
            onActivate={() => navigate('/sluzby/pokryvacstvi')}
            onHover={setActive}
            paths={PATHS.roof}
            hit={HIT.roof}
            strokeWidth={1}
          />
          <InteractiveGroup
            id="g-truss"
            active={active === 'g-truss'}
            onActivate={() => navigate('/sluzby/tesarstvi')}
            onHover={setActive}
            paths={PATHS.truss}
            hit={HIT.truss}
            strokeWidth={0.9}
          />
          <InteractiveGroup
            id="g-gutters"
            active={active === 'g-gutters'}
            onActivate={() => navigate('/sluzby/klempirstvi')}
            onHover={setActive}
            paths={PATHS.gutters}
            hit={HIT.gutters}
            strokeWidth={1.1}
          />
          {/* Okna → Realizace. Rámy (closed paths) jsou samy o sobě klikatelné. */}
          <WindowsGroup
            active={active === 'g-windows'}
            onActivate={() => navigate('/realizace')}
            onHover={setActive}
          />
          <InteractiveGroup
            id="g-chimney"
            active={active === 'g-chimney'}
            onActivate={() => navigate('/o-nas')}
            onHover={setActive}
            paths={PATHS.chimney}
            hit={HIT.chimney}
            strokeWidth={1}
          />
          <InteractiveGroup
            id="g-door"
            active={active === 'g-door'}
            onActivate={() => navigate('/kontakt')}
            onHover={setActive}
            paths={PATHS.door}
            hit={HIT.door}
            strokeWidth={1}
          />
        </svg>
      </div>

      {/* Navigační labely okolo domu (= hlavní menu nad Hero sekcí) */}
      <nav
        aria-label="Hlavní navigace"
        className="house-labels pointer-events-none absolute inset-0 opacity-0"
      >
        {houseLabels.map((label) => {
          const isActive = active === label.groupId
          const left = parseFloat(label.position.x)
          const alignLeft = left < 50 // text roste vpravo od kotvy
          return (
            <Link
              key={label.id}
              href={label.href}
              onMouseEnter={() => setActive(label.groupId)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(label.groupId)}
              onBlur={() => setActive(null)}
              className="house-label pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 outline-none"
              style={{ left: label.position.x, top: label.position.y }}
            >
              <span
                className={`flex items-center gap-2 ${
                  alignLeft ? 'flex-row' : 'flex-row-reverse'
                }`}
                style={{
                  color: isActive ? 'var(--wood-amber)' : 'var(--cream)',
                  transition: 'color 0.3s ease',
                }}
              >
                <span
                  className="block h-px bg-current transition-all duration-300"
                  style={{ width: isActive ? '2.5rem' : '1.75rem', opacity: 0.6 }}
                  aria-hidden="true"
                />
                <span
                  className={`whitespace-nowrap ${alignLeft ? 'text-left' : 'text-right'}`}
                >
                  <span className="block font-display text-xl italic leading-none">
                    {label.text}
                  </span>
                  <span className="block font-body text-[0.6rem] uppercase tracking-widest opacity-60">
                    {label.subtext}
                  </span>
                </span>
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Nápověda + gyro toggle */}
      <div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center md:bottom-24">
        <p className="font-body text-xs uppercase tracking-widest text-cream/40">
          {t('home.hint')}
        </p>
      </div>
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

function DrawPaths({ d }: { d: string[] }) {
  return (
    <>
      {d.map((path) => (
        <path
          key={path}
          d={path}
          className="draw-path"
          fill="none"
          style={{ pointerEvents: 'none' }}
        />
      ))}
    </>
  )
}

function InteractiveGroup({
  id,
  active,
  onActivate,
  onHover,
  paths,
  hit,
  strokeWidth,
}: {
  id: string
  active: boolean
  onActivate: () => void
  onHover: (g: string | null) => void
  paths: string[]
  hit: string
  strokeWidth: number
}) {
  return (
    <HouseSection
      id={id}
      active={active}
      onActivate={onActivate}
      onHover={onHover}
    >
      <g strokeWidth={strokeWidth}>
        {paths.map((d) => (
          <path
            key={d}
            d={d}
            className="draw-path"
            fill="none"
            style={{ pointerEvents: 'none' }}
          />
        ))}
      </g>
      <path
        d={hit}
        fill="transparent"
        stroke="transparent"
        strokeWidth={10}
        style={{ pointerEvents: 'all' }}
      />
    </HouseSection>
  )
}

function WindowsGroup({
  active,
  onActivate,
  onHover,
}: {
  active: boolean
  onActivate: () => void
  onHover: (g: string | null) => void
}) {
  return (
    <HouseSection
      id="g-windows"
      active={active}
      onActivate={onActivate}
      onHover={onHover}
    >
      <g strokeWidth={0.9}>
        {PATHS.windows.map((d, i) => {
          // Rámy (uzavřené polygony) jsou klikatelné výplní; příčle ne.
          const isFrame = d.endsWith('Z')
          return (
            <path
              key={d}
              d={d}
              className="draw-path"
              fill={isFrame ? 'transparent' : 'none'}
              style={{ pointerEvents: isFrame ? 'all' : 'none' }}
            />
          )
        })}
      </g>
    </HouseSection>
  )
}
