import { HeroScroll } from '@/components/house/HeroScroll'
import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { ProjectsPreview } from '@/components/sections/ProjectsPreview'
import { ServicesScroll } from '@/components/sections/ServicesScroll'
import { Link } from '@/i18n/routing'
import { houseLabels } from '@/lib/constants'
import { setRequestLocale } from 'next-intl/server'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      {/* 1A — Hero: celoobrazovkový interaktivní dům „na papíře" se scroll efektem */}
      <section
        aria-label="Rozcestník — interaktivní dům"
        className="relative bg-wood-dark"
      >
        <HeroScroll />

        {/* Přístupná / crawlovatelná navigace (vždy v SSR HTML, vizuálně skrytá). */}
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
      </section>

      {/* 1B — Služby (horizontální scroll) */}
      <ServicesScroll />

      {/* 1C — Realizace preview */}
      <ProjectsPreview />

      {/* 1D — O nás zkráceně */}
      <AboutSection />

      {/* 1E — Kontakt CTA */}
      <ContactSection />
    </>
  )
}
