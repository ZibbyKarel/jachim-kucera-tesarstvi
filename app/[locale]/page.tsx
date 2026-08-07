import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { Opener } from '@/components/sections/Opener'
import { ProjectsPreview } from '@/components/sections/ProjectsPreview'
import { ServiceIndex } from '@/components/sections/ServiceIndex'
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
      <Opener />
      <ServiceIndex />
      <ProjectsPreview />
      <AboutSection />
      <ContactSection />
    </>
  )
}
