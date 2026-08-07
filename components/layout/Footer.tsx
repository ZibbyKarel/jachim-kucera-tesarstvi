import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { SITE, contacts, navLinks } from '@/lib/constants'
import type { NavLink } from '@/lib/types'
import { Logo } from './Logo'

function navLabel(t: (key: string) => string, source: NavLink['textSource']) {
  return source.ns === 'service' ? t(`services.${source.slug}.title`) : t(`nav.${source.key}`)
}

/* -------------------------------------------------------------------------- */
/*  Footer — úzký timber pás                                                    */
/*                                                                              */
/*  Wordmark, navigace, telefon a e-mail jako odkazy, IČO, copyright. Nic       */
/*  víc - žádný popisný odstavec jako v1 (ten patřil k jinému rytmu stránky).   */
/* -------------------------------------------------------------------------- */

export function Footer() {
  const t = useTranslations()
  const year = 2026

  return (
    <footer className="bg-timber">
      <div className="container-content flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between md:gap-6">
        <Logo size={44} />

        <nav
          aria-label={t('common.footerNavAria')}
          className="flex flex-wrap gap-x-6 gap-y-3"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-underline font-body text-sm text-paper"
            >
              {navLabel(t, link.textSource)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 font-mono text-sm">
          {contacts.map((contact) => (
            <a
              key={contact.phoneHref}
              href={`tel:${contact.phoneHref}`}
              className="link-underline w-fit text-paper"
            >
              {contact.name} — {contact.phone}
            </a>
          ))}
          <a href={`mailto:${SITE.email}`} className="link-underline w-fit text-paper">
            {SITE.email}
          </a>
        </div>
      </div>

      <div className="container-content flex flex-col gap-2 border-t border-paper/15 py-6 font-body text-xs text-oak-soft sm:flex-row sm:items-center sm:justify-between">
        <p>
          {contacts
            .map((contact) => `${contact.name} ${t('common.icoLabel')} ${contact.ic}`)
            .join(' · ')}
        </p>
        <p>
          © {year} {SITE.name}. {t('common.allRightsReserved')}
        </p>
      </div>
    </footer>
  )
}
