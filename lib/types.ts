export type ServiceSlug =
  | 'tesarstvi'
  | 'pokryvacstvi'
  | 'klempirstvi'
  | 'cisteni-strech'

export type ProjectCategory = 'tesarstvi' | 'pokryvacstvi' | 'klempirstvi'

export interface Service {
  slug: ServiceSlug
  /** Skupina v SVG domě, na kterou služba navazuje (#g-…). */
  houseGroup: string
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

export type HouseLabelKey = 'chimney' | 'roof' | 'truss' | 'gutters' | 'windows' | 'door'

export interface HouseLabel {
  id: string
  /** Klíč pro podtext v messages.houseLabels a pro odvození hlavního textu. */
  key: HouseLabelKey
  /** Hlavní text labelu se bere buď ze služby, nebo z obecné navigace. */
  textSource: { ns: 'service'; slug: ServiceSlug } | { ns: 'nav'; key: 'projects' | 'about' | 'contact' }
  /** Pozice v procentech vůči wrapperu. */
  position: { x: string; y: string }
  groupId: string
  href: string
}

export interface NavLink {
  href: string
  textSource: { ns: 'service'; slug: ServiceSlug } | { ns: 'nav'; key: 'projects' | 'about' | 'contact' }
}
