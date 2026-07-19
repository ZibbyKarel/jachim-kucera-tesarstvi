import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { SITE, contacts, navLinks } from '@/lib/constants'
import type { NavLink } from '@/lib/types'
import { Logo } from './Logo'

function navLabel(t: (key: string) => string, source: NavLink['textSource']) {
  return source.ns === 'service' ? t(`services.${source.slug}.title`) : t(`nav.${source.key}`)
}

export function Footer() {
  const t = useTranslations()
  const year = 2026

  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-wood-medium">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="container-content relative grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo size={64} />
          <p className="max-w-xs font-body text-sm leading-relaxed text-cream/60">
            {t('common.footerDescription')}
          </p>
        </div>

        <nav aria-label={t('common.footerNavAria')} className="space-y-4">
          <h2 className="eyebrow">{t('common.navigationHeading')}</h2>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-underline font-body text-sm text-cream/70 transition-colors hover:text-cream"
                >
                  {navLabel(t, link.textSource)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <h2 className="eyebrow">{t('nav.contact')}</h2>
          <ul className="space-y-2 font-body text-sm text-cream/70">
            {contacts.map((contact) => (
              <li key={contact.phoneHref}>
                <a
                  href={`tel:${contact.phoneHref}`}
                  className="link-underline transition-colors hover:text-cream"
                >
                  {contact.name} — {contact.phone}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="link-underline transition-colors hover:text-cream"
              >
                {SITE.email}
              </a>
            </li>
            <li className="pt-2 text-cream/50">{t('common.region')}</li>
          </ul>
        </div>
      </div>

      <div className="container-content relative flex flex-col items-start justify-between gap-2 border-t border-cream/10 py-6 font-body text-xs text-cream/40 sm:flex-row sm:items-center">
        <p>
          © {year} {SITE.name}. {t('common.allRightsReserved')}
        </p>
        <p>
          {contacts
            .map((contact) => `${contact.name} ${t('common.icoLabel')} ${contact.ic}`)
            .join(' · ')}{' '}
          · {t('common.region')}
        </p>
      </div>
    </footer>
  )
}
