import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { projects } from '@/lib/constants'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/ui/Reveal'
import { Arrow } from '@/components/ui/Button'

export function ProjectsPreview() {
  const t = useTranslations('home')
  const tFull = useTranslations()
  const newest = [...projects].sort((a, b) => b.year - a.year).slice(0, 6)

  return (
    <section
      aria-labelledby="projects-heading"
      /* Překrytí řeší obal <StackCover> (pin předchozí + náběh přes ni). Sekce je
         neprůhledná na celou plochu; horní stín dělá náběžnou hranu čitelnou. */
      className="relative min-h-[100dvh] bg-wood-dark py-24 shadow-[0_-30px_60px_-30px_rgba(0,0,0,0.55)] md:py-32"
    >
      <div className="container-content">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="eyebrow">{t('projectsHeading')}</span>
            <h2
              id="projects-heading"
              className="mt-3 max-w-xl font-display text-4xl italic text-cream md:text-5xl"
            >
              {t('projectsIntro')}
            </h2>
          </div>
          <Link
            href="/realizace"
            className="group inline-flex shrink-0 items-center gap-3 font-body text-xs uppercase tracking-widest text-wood-amber transition-colors hover:text-wood-warm"
          >
            {tFull('common.allProjects')}
            <Arrow className="transition-transform duration-500 ease-craft group-hover:translate-x-1" />
          </Link>
        </div>

        <Reveal stagger className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {newest.map((project, i) => {
            const title = tFull(`projectsData.${project.id}.title`)
            const location = tFull(`projectsData.${project.id}.location`)
            return (
              <Link
                key={project.id}
                href="/realizace"
                data-reveal-item
                className={`group block ${i % 4 === 0 ? 'row-span-2' : ''}`}
              >
                <ImageFrame
                  src={project.thumbnail}
                  alt={`${title} — ${location}`}
                  aspect={i % 4 === 0 ? '3/4' : '4/3'}
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="mt-3">
                  <h3 className="font-display text-lg italic text-cream transition-colors group-hover:text-wood-amber">
                    {title}
                  </h3>
                  <p className="font-body text-[0.65rem] uppercase tracking-widest text-wood-warm">
                    {tFull(`services.${project.category}.title`)} · {location}
                  </p>
                </div>
              </Link>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
