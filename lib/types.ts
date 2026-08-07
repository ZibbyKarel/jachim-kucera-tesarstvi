export type ServiceSlug =
  | 'tesarstvi'
  | 'pokryvacstvi'
  | 'klempirstvi'
  | 'cisteni-strech'

export type ProjectCategory = 'tesarstvi' | 'pokryvacstvi' | 'klempirstvi'

export interface Service {
  slug: ServiceSlug
  /** Hero obrázek detailní stránky. */
  heroImage: string
  /** Galerie na detailní stránce (alt text přichází z messages/{locale}.json). */
  gallery: { src: string }[]
  /** Počet položek „Co zahrnuje" (texty přichází z messages/{locale}.json). */
  workItemNumbers: string[]
}

export interface Project {
  id: string
  category: ProjectCategory
  year: number
  images: string[]
  thumbnail: string
}

export interface NavLink {
  href: string
  textSource: { ns: 'service'; slug: ServiceSlug } | { ns: 'nav'; key: 'projects' | 'about' | 'contact' }
}

export interface Person {
  key: string
  name: string
  companyId: string
  phone: string
  phoneHref: string
}
