import type { HouseLabel, NavLink, Project, Service } from './types'

export const SITE = {
  name: 'Jáchim & Kučera — Tesařství',
  shortName: 'Jáchim & Kučera',
  url: 'https://jachim-kucera-tesarstvi.cz',
  phone: '+420 777 123 456',
  phoneHref: '+420777123456',
  email: 'info@jachim-kucera-tesarstvi.cz',
} as const

/* -------------------------------------------------------------------------- */
/*  Služby — texty žijí v messages/{locale}.json pod services.<slug>          */
/* -------------------------------------------------------------------------- */

export const services: Service[] = [
  {
    slug: 'tesarstvi',
    houseGroup: 'g-truss',
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
    houseGroup: 'g-roof',
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
    houseGroup: 'g-gutters',
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
    houseGroup: 'g-roof',
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
/*  Labely na domě — hlavní navigace. Text/subtext přichází z messages.        */
/*  `side` určuje, na kterou stranu od kotvy text vyrůstá (kvůli spojnici       */
/*  a zarovnání) — řeší IsometricHouse přímo přes LAYOUT, tady jen data.        */
/* -------------------------------------------------------------------------- */

export const houseLabels: HouseLabel[] = [
  {
    id: 'label-chimney',
    key: 'chimney',
    textSource: { ns: 'nav', key: 'projects' },
    position: { x: '40%', y: '13%' },
    groupId: 'g-chimney',
    href: '/realizace',
  },
  {
    id: 'label-roof',
    key: 'roof',
    textSource: { ns: 'service', slug: 'pokryvacstvi' },
    position: { x: '17%', y: '28%' },
    groupId: 'g-roof',
    href: '/sluzby/pokryvacstvi',
  },
  {
    id: 'label-truss',
    key: 'truss',
    textSource: { ns: 'service', slug: 'tesarstvi' },
    position: { x: '80%', y: '33%' },
    groupId: 'g-truss',
    href: '/sluzby/tesarstvi',
  },
  {
    id: 'label-gutters',
    key: 'gutters',
    textSource: { ns: 'service', slug: 'klempirstvi' },
    position: { x: '13%', y: '52%' },
    groupId: 'g-gutters',
    href: '/sluzby/klempirstvi',
  },
  {
    id: 'label-windows',
    key: 'windows',
    textSource: { ns: 'nav', key: 'about' },
    position: { x: '19%', y: '70%' },
    groupId: 'g-windows',
    href: '/o-nas',
  },
  {
    id: 'label-door',
    key: 'door',
    textSource: { ns: 'nav', key: 'contact' },
    position: { x: '53%', y: '82%' },
    groupId: 'g-door',
    href: '/kontakt',
  },
]

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
