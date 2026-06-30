import { Link } from '@/i18n/routing'

/**
 * Logo Jáchim & Kučera — věrná rekreace firemního loga (štítová střecha
 * s okénkem + slovní značka). Na tmavém pozadí: ikona a jméno krémově,
 * „&", podtitul a ozdobné linky zlatě (mosaz z loga).
 */
export function Logo({
  className = '',
  light = false,
}: {
  className?: string
  /** Světlá varianta pro tmavé pozadí (otevřené mobilní menu). */
  light?: boolean
}) {
  const ink = light ? 'text-wood-medium' : 'text-cream'
  return (
    <Link
      href="/"
      aria-label="Jáchim & Kučera — Tesařství, domů"
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <LogoMark className="h-9 w-9 shrink-0" light={light} />
      <span className="flex flex-col items-start leading-none">
        <span className={`font-display text-lg leading-none tracking-wide ${ink}`}>
          Jáchim <span className="text-wood-amber">&amp;</span> Kučera
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <span className="h-px w-3 bg-wood-amber/60" aria-hidden="true" />
          <span className="font-body text-[0.6rem] uppercase tracking-[0.3em] text-wood-amber">
            Tesařství
          </span>
          <span className="h-px w-3 bg-wood-amber/60" aria-hidden="true" />
        </span>
      </span>
    </Link>
  )
}

/** Samotná značka — štítová střecha s věžičkou a okénkem. */
export function LogoMark({
  className = '',
  light = false,
}: {
  className?: string
  light?: boolean
}) {
  const ink = light ? 'text-wood-medium' : 'text-cream'
  return (
    <svg
      viewBox="0 0 48 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* střešní pás (gable) */}
      <path
        d="M3 25 L24 7 L46 25 L39.5 25 L24 13.5 L9.5 25 Z"
        fill="currentColor"
        className={`${ink} transition-colors duration-500 group-hover:text-wood-light`}
      />
      {/* věžička / nástavec u hřebene */}
      <path
        d="M17.5 4 H21 V16 H17.5 Z"
        fill="currentColor"
        className={`${ink} transition-colors duration-500 group-hover:text-wood-light`}
      />
      {/* okénko 2×2 ve štítu */}
      <g
        className={light ? 'text-wood-medium/90' : 'text-cream/90'}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <rect x="20.5" y="16.5" width="7" height="7" rx="0.5" fill="none" />
        <path d="M24 16.5 V23.5 M20.5 20 H27.5" />
      </g>
    </svg>
  )
}
