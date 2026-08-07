import type { NavLink, Person, Project, Service } from './types'

/* -------------------------------------------------------------------------- */
/*  Lidé — firma jsou dva OSVČ, každý s vlastním IČO, ne jedna právnická       */
/*  osoba. Pořadí odpovídá jménu firmy „Jáchim & Kučera" - Petr Jáchim první.  */
/*  Údaje dodal klient, opisují se znak po znaku (žádné role, tituly, e-maily  */
/*  ani biografie - nikdo neřekl, kdo je „šéf").                               */
/* -------------------------------------------------------------------------- */

export const people: Person[] = [
  {
    key: 'jachim',
    name: 'Petr Jáchim',
    companyId: '47748303',
    phone: '+420 608 212 410',
    phoneHref: '+420608212410',
  },
  {
    key: 'kucera',
    name: 'Milan Kučera',
    companyId: '29640113',
    phone: '+420 725 443 271',
    phoneHref: '+420725443271',
  },
]

export const SITE = {
  name: 'Jáchim & Kučera, tesařství',
  shortName: 'Jáchim & Kučera',
  // Doména odvozená z e-mailu, který klient potvrdil (viz `email` níž) - tedy
  // už ne placeholder. Kdyby web nakonec běžel jinde, přepsat: `url` živí
  // canonical odkazy, sitemap, robots i JSON-LD. Přebít se dá i za běhu přes
  // NEXT_PUBLIC_SITE_URL (app/sitemap.ts, app/robots.ts).
  url: 'https://jachim-kucera-tesarstvi.cz',
  // Hlavní číslo je Petr Jáchim, protože je první ve jméně firmy. Používá se
  // v JSON-LD (app/[locale]/layout.tsx, kde jde navíc pole obou čísel) a jako
  // fallback při chybě odeslání v ContactForm.
  phone: people[0].phone,
  phoneHref: people[0].phoneHref,
  // Potvrzeno klientem 2026-08-07. Shodou okolností stejná hodnota, jakou tu
  // od prvního commitu držel placeholder - proto ji nepřepisuj se slovy „je to
  // stejné jako dřív, tedy vymyšlené". Není.
  email: 'info@jachim-kucera-tesarstvi.cz',
} as const

/* -------------------------------------------------------------------------- */
/*  Služby — texty žijí v messages/{locale}.json pod services.<slug>          */
/* -------------------------------------------------------------------------- */

export const services: Service[] = [
  {
    slug: 'tesarstvi',
    heroImage: '/images/realizace/krov-detail-01.jpg',
    gallery: [
      { src: '/images/realizace/krov-plzen-01.jpg' },
      { src: '/images/realizace/krov-klatovy-01.jpg' },
      { src: '/images/realizace/strop-tramovy-01.jpg' },
      { src: '/images/realizace/pergola-rokycany-01.jpg' },
      { src: '/images/realizace/carport-01.jpg' },
      { src: '/images/realizace/krov-detail-spoj.jpg' },
    ],
    workItemNumbers: ['01', '02', '03', '04'],
  },
  {
    slug: 'pokryvacstvi',
    heroImage: '/images/realizace/strecha-palena-01.jpg',
    gallery: [
      { src: '/images/realizace/strecha-palena-plzen.jpg' },
      { src: '/images/realizace/strecha-plech-falc.jpg' },
      { src: '/images/realizace/strecha-bobrovka.jpg' },
      { src: '/images/realizace/strecha-uzlabi.jpg' },
      { src: '/images/realizace/strecha-hreben.jpg' },
      { src: '/images/realizace/strecha-rekonstrukce.jpg' },
    ],
    workItemNumbers: ['01', '02', '03', '04'],
  },
  {
    slug: 'klempirstvi',
    heroImage: '/images/realizace/okap-mer-01.jpg',
    gallery: [
      { src: '/images/realizace/okap-med.jpg' },
      { src: '/images/realizace/okap-titanzinek.jpg' },
      { src: '/images/realizace/oplechovani-komin.jpg' },
      { src: '/images/realizace/oplechovani-parapet.jpg' },
      { src: '/images/realizace/svod-detail.jpg' },
      { src: '/images/realizace/lemovani-zed.jpg' },
    ],
    workItemNumbers: ['01', '02', '03', '04'],
  },
  {
    slug: 'cisteni-strech',
    heroImage: '/images/realizace/cisteni-strecha-01.jpg',
    gallery: [
      { src: '/images/realizace/cisteni-pred-po.jpg' },
      { src: '/images/realizace/cisteni-mech.jpg' },
      { src: '/images/realizace/cisteni-tlak.jpg' },
      { src: '/images/realizace/cisteni-nater.jpg' },
      { src: '/images/realizace/cisteni-okap.jpg' },
      { src: '/images/realizace/cisteni-strecha-02.jpg' },
    ],
    workItemNumbers: ['01', '02', '03', '04'],
  },
]

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug)
}

/* -------------------------------------------------------------------------- */
/*  Realizace — texty žijí v messages/{locale}.json pod projectsData.<id>     */
/* -------------------------------------------------------------------------- */

export const projects: Project[] = [
  {
    id: 'krov-rodinny-dum-plzen',
    category: 'tesarstvi',
    year: 2024,
    images: [
      '/images/realizace/krov-plzen-01.jpg',
      '/images/realizace/krov-plzen-02.jpg',
      '/images/realizace/krov-plzen-03.jpg',
    ],
    thumbnail: '/images/realizace/krov-plzen-01.jpg',
  },
  {
    id: 'rekonstrukce-krovu-klatovy',
    category: 'tesarstvi',
    year: 2023,
    images: [
      '/images/realizace/krov-klatovy-01.jpg',
      '/images/realizace/krov-klatovy-02.jpg',
    ],
    thumbnail: '/images/realizace/krov-klatovy-01.jpg',
  },
  {
    id: 'pergola-rokycany',
    category: 'tesarstvi',
    year: 2025,
    images: [
      '/images/realizace/pergola-rokycany-01.jpg',
      '/images/realizace/pergola-rokycany-02.jpg',
    ],
    thumbnail: '/images/realizace/pergola-rokycany-01.jpg',
  },
  {
    id: 'tramovy-strop-susice',
    category: 'tesarstvi',
    year: 2022,
    images: ['/images/realizace/strop-tramovy-01.jpg'],
    thumbnail: '/images/realizace/strop-tramovy-01.jpg',
  },
  {
    id: 'strecha-palena-plzen',
    category: 'pokryvacstvi',
    year: 2024,
    images: [
      '/images/realizace/strecha-palena-plzen.jpg',
      '/images/realizace/strecha-palena-02.jpg',
    ],
    thumbnail: '/images/realizace/strecha-palena-plzen.jpg',
  },
  {
    id: 'plechova-strecha-domazlice',
    category: 'pokryvacstvi',
    year: 2023,
    images: ['/images/realizace/strecha-plech-falc.jpg'],
    thumbnail: '/images/realizace/strecha-plech-falc.jpg',
  },
  {
    id: 'bobrovka-stribro',
    category: 'pokryvacstvi',
    year: 2021,
    images: ['/images/realizace/strecha-bobrovka.jpg'],
    thumbnail: '/images/realizace/strecha-bobrovka.jpg',
  },
  {
    id: 'strecha-rekonstrukce-nepomuk',
    category: 'pokryvacstvi',
    year: 2025,
    images: ['/images/realizace/strecha-rekonstrukce.jpg'],
    thumbnail: '/images/realizace/strecha-rekonstrukce.jpg',
  },
  {
    id: 'medene-okapy-plzen',
    category: 'klempirstvi',
    year: 2024,
    images: [
      '/images/realizace/okap-med.jpg',
      '/images/realizace/okap-med-02.jpg',
    ],
    thumbnail: '/images/realizace/okap-med.jpg',
  },
  {
    id: 'oplechovani-komin-tachov',
    category: 'klempirstvi',
    year: 2023,
    images: ['/images/realizace/oplechovani-komin.jpg'],
    thumbnail: '/images/realizace/oplechovani-komin.jpg',
  },
  {
    id: 'titanzinek-okapy-horsovsky-tyn',
    category: 'klempirstvi',
    year: 2022,
    images: ['/images/realizace/okap-titanzinek.jpg'],
    thumbnail: '/images/realizace/okap-titanzinek.jpg',
  },
  {
    id: 'strecha-okapy-prestice',
    category: 'pokryvacstvi',
    year: 2025,
    images: ['/images/realizace/strecha-okapy-prestice.jpg'],
    thumbnail: '/images/realizace/strecha-okapy-prestice.jpg',
  },
]

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

/* -------------------------------------------------------------------------- */
/*  Navigace                                                                   */
/* -------------------------------------------------------------------------- */

export const navLinks: NavLink[] = [
  { href: '/sluzby/tesarstvi', textSource: { ns: 'service', slug: 'tesarstvi' } },
  { href: '/sluzby/pokryvacstvi', textSource: { ns: 'service', slug: 'pokryvacstvi' } },
  { href: '/sluzby/klempirstvi', textSource: { ns: 'service', slug: 'klempirstvi' } },
  { href: '/realizace', textSource: { ns: 'nav', key: 'projects' } },
  { href: '/o-nas', textSource: { ns: 'nav', key: 'about' } },
  { href: '/kontakt', textSource: { ns: 'nav', key: 'contact' } },
]
