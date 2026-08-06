import { Link } from '@/i18n/routing'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-body text-sm font-medium uppercase tracking-widest transition-all duration-500 ease-craft disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-patina text-paper hover:bg-patina-dim',
  outline: 'border border-slate/30 text-slate hover:border-patina hover:text-patina',
  ghost: 'text-slate hover:text-patina',
}

const sizes: Record<Size, string> = {
  md: 'px-6 py-3',
  lg: 'px-8 py-4 text-base',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonAsLink = CommonProps & {
  href: string
} & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>

type ButtonAsButton = CommonProps & {
  href?: undefined
} & Omit<ComponentProps<'button'>, 'className' | 'children'>

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const {
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...rest
  } = props
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if ('href' in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  )
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 6h15M11 1l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
