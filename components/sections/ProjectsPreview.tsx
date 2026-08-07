import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { projects } from '@/lib/constants'
import type { Project } from '@/lib/types'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/ui/Reveal'
import { Arrow } from '@/components/ui/Button'

/* -------------------------------------------------------------------------- */
/*  ProjectsPreview — realizace, paper pole                                     */
/*                                                                              */
/*  Asymetrická sazba na 12 sloupcích (spec §4): první realizace col-span-7     */
/*  s vysokým rámem (4/5), další dvě naskládané pod sebou v col-span-5 (4/3).   */
/*  Na mobilu jeden sloupec, pořadí zůstává. Popiska pod každým rámem je mono,  */
/*  hairline oddělená shora, ve tvaru ROK / KATEGORIE (lokalitu neznáme, viz    */
/*  lib/constants.ts) - rok jde z lib/constants.ts, kategorie z                */
/*  services.<slug>.title. U realizací bez roku se zobrazí jen kategorie.       */
/*  Žádné číslo/rok se nevymýšlí, vše je existující obsah.                     */
/* -------------------------------------------------------------------------- */

function ProjectFrame({
  project,
  aspect,
  t,
}: {
  project: Project
  aspect: string
  t: ReturnType<typeof useTranslations>
}) {
  const title = t(`projectsData.${project.id}.title`)
  const categoryTitle = t(`services.${project.category}.title`)

  return (
    <Link href="/realizace" className="group block">
      <ImageFrame
        src={project.thumbnail}
        alt={title}
        aspect={aspect}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <p className="mt-3 border-t border-timber/20 pt-3 font-mono text-xs uppercase tracking-widest text-oak">
        {project.year ? `${project.year} / ${categoryTitle}` : categoryTitle}
      </p>
    </Link>
  )
}

export function ProjectsPreview() {
  const t = useTranslations('home')
  const tFull = useTranslations()
  // Realizace bez roku (sady fotek z více let) jdou na konec, ne na začátek -
  // `?? 0` by je jinak řadilo mezi ty nejstarší.
  const featured = [...projects]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 3)
  const [main, ...rest] = featured

  return (
    <section aria-labelledby="projects-heading" className="bg-paper py-24 md:py-32">
      <div className="container-content">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <h2
            id="projects-heading"
            className="max-w-xl font-display text-3xl text-timber md:text-4xl"
          >
            {t('projectsIntro')}
          </h2>
          <Link
            href="/realizace"
            className="group link-underline inline-flex shrink-0 items-center gap-2 font-body text-timber"
          >
            {tFull('common.allProjects')}
            <Arrow className="transition-transform duration-300 ease-craft group-hover:translate-x-1" />
          </Link>
        </div>

        <Reveal stagger className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          {main && (
            <div data-reveal-item className="md:col-span-7">
              <ProjectFrame project={main} aspect="4/5" t={tFull} />
            </div>
          )}
          <div data-reveal-item className="flex flex-col gap-10 md:col-span-5 md:gap-8">
            {rest.map((project) => (
              <ProjectFrame key={project.id} project={project} aspect="4/3" t={tFull} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
