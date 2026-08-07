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
/*                                                                              */
/*  Konvence cest k obrázkům: `/images/realizace/...` jsou skutečné fotky      */
/*  naimportované z původního webu (viz komentář nad `projects` níže).         */
/*  `/images/placeholder/...` jsou cesty, pod kterými soubory ZÁMĚRNĚ neexis-  */
/*  tují - u tesařství a pokrývačství máme reálné fotky, u klempířství a       */
/*  čištění střech ne. Jméno souboru v placeholder cestě jen popisuje, co tam  */
/*  jednou má být; `ImageFrame` podle prefixu `/images/placeholder/` pozná, že */
/*  má vykreslit technický rámeček místo <Image>.                              */
/* -------------------------------------------------------------------------- */

export const services: Service[] = [
  {
    slug: 'tesarstvi',
    heroImage: '/images/realizace/pergola-spoje.jpg',
    gallery: [
      { src: '/images/realizace/krov-latovani-01.jpg' },
      { src: '/images/realizace/pristresek-hotovy.jpg' },
      { src: '/images/realizace/venkovni-kuchyne-exterier.jpg' },
      { src: '/images/realizace/roubenka-02.jpg' },
      { src: '/images/realizace/hriste-domek-houpacky.jpg' },
      { src: '/images/realizace/studna-02.jpg' },
    ],
    workItemNumbers: ['01', '02', '03', '04'],
  },
  {
    slug: 'pokryvacstvi',
    heroImage: '/images/realizace/strechy-novostavby.jpg',
    gallery: [
      { src: '/images/realizace/krytina-01.jpg' },
      { src: '/images/realizace/krytina-02.jpg' },
      { src: '/images/realizace/pristresek-hotovy.jpg' },
      { src: '/images/realizace/krov-latovani-01.jpg' },
      { src: '/images/realizace/krov-latovani-02.jpg' },
      { src: '/images/realizace/roubenka-01.jpg' },
    ],
    workItemNumbers: ['01', '02', '03', '04'],
  },
  {
    slug: 'klempirstvi',
    heroImage: '/images/placeholder/okap-mer-01.jpg',
    gallery: [
      { src: '/images/placeholder/okap-med.jpg' },
      { src: '/images/placeholder/okap-titanzinek.jpg' },
      { src: '/images/placeholder/oplechovani-komin.jpg' },
      { src: '/images/placeholder/oplechovani-parapet.jpg' },
      { src: '/images/placeholder/svod-detail.jpg' },
      { src: '/images/placeholder/lemovani-zed.jpg' },
    ],
    workItemNumbers: ['01', '02', '03', '04'],
  },
  {
    slug: 'cisteni-strech',
    heroImage: '/images/placeholder/cisteni-strecha-01.jpg',
    gallery: [
      { src: '/images/placeholder/cisteni-pred-po.jpg' },
      { src: '/images/placeholder/cisteni-mech.jpg' },
      { src: '/images/placeholder/cisteni-tlak.jpg' },
      { src: '/images/placeholder/cisteni-nater.jpg' },
      { src: '/images/placeholder/cisteni-okap.jpg' },
      { src: '/images/placeholder/cisteni-strecha-02.jpg' },
    ],
    workItemNumbers: ['01', '02', '03', '04'],
  },
]

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug)
}

/* -------------------------------------------------------------------------- */
/*  Realizace — texty žijí v messages/{locale}.json pod projectsData.<id>     */
/*                                                                              */
/*  Fotky jsou skutečné, naimportované z původního webu firmy                 */
/*  (sikovnytesar.cz). `year` pochází z EXIF metadat originálních souborů -    */
/*  je to tedy reálný údaj, ne odhad. Lokalitu (v EXIF nebyla GPS) neznáme,    */
/*  proto `location` v datovém modelu vůbec neexistuje a v UI se nikde         */
/*  nezobrazuje. U dvou realizací (`detska-hriste`, `zastreseni-studni`) je    */
/*  `year` vynechaný úplně - jde o sadu fotek z více let bez jednoznačného     */
/*  data. Nic z tohohle pole se nesmí domýšlet: žádná města, žádné obce,       */
/*  žádné m², žádné značky materiálu, žádná jména zákazníků.                  */
/* -------------------------------------------------------------------------- */

export const projects: Project[] = [
  {
    id: 'krov-a-latovani',
    category: 'tesarstvi',
    year: 2022,
    images: [
      '/images/realizace/krov-latovani-01.jpg',
      '/images/realizace/krov-latovani-02.jpg',
    ],
    thumbnail: '/images/realizace/krov-latovani-01.jpg',
  },
  {
    id: 'betonova-krytina',
    category: 'pokryvacstvi',
    year: 2022,
    images: [
      '/images/realizace/krytina-01.jpg',
      '/images/realizace/krytina-02.jpg',
    ],
    thumbnail: '/images/realizace/krytina-01.jpg',
  },
  {
    id: 'krytina-rekonstrukce',
    category: 'pokryvacstvi',
    year: 2023,
    images: ['/images/realizace/krytina-rekonstrukce.jpg'],
    thumbnail: '/images/realizace/krytina-rekonstrukce.jpg',
  },
  {
    id: 'pristresek-pro-auta',
    category: 'tesarstvi',
    year: 2016,
    images: [
      '/images/realizace/pristresek-krov.jpg',
      '/images/realizace/pristresek-hotovy.jpg',
    ],
    thumbnail: '/images/realizace/pristresek-hotovy.jpg',
  },
  {
    id: 'pergola-tesarske-spoje',
    category: 'tesarstvi',
    year: 2016,
    images: ['/images/realizace/pergola-spoje.jpg'],
    thumbnail: '/images/realizace/pergola-spoje.jpg',
  },
  {
    id: 'venkovni-kuchyne',
    category: 'tesarstvi',
    year: 2015,
    images: [
      '/images/realizace/venkovni-kuchyne-exterier.jpg',
      '/images/realizace/venkovni-kuchyne-interier.jpg',
    ],
    thumbnail: '/images/realizace/venkovni-kuchyne-exterier.jpg',
  },
  {
    id: 'zastreseni-vstupu',
    category: 'tesarstvi',
    year: 2022,
    images: ['/images/realizace/zastreseni-vstupu.jpg'],
    thumbnail: '/images/realizace/zastreseni-vstupu.jpg',
  },
  {
    id: 'zastresena-tribuna',
    category: 'tesarstvi',
    year: 2015,
    images: ['/images/realizace/tribuna-zastreseni.jpg'],
    thumbnail: '/images/realizace/tribuna-zastreseni.jpg',
  },
  {
    id: 'roubena-stavba',
    category: 'tesarstvi',
    year: 2022,
    images: [
      '/images/realizace/roubenka-01.jpg',
      '/images/realizace/roubenka-02.jpg',
      '/images/realizace/roubenka-03.jpg',
      '/images/realizace/roubenka-04.jpg',
    ],
    thumbnail: '/images/realizace/roubenka-02.jpg',
  },
  {
    id: 'strechy-novostaveb',
    category: 'pokryvacstvi',
    year: 2024,
    images: ['/images/realizace/strechy-novostavby.jpg'],
    thumbnail: '/images/realizace/strechy-novostavby.jpg',
  },
  {
    id: 'detska-hriste',
    category: 'tesarstvi',
    images: [
      '/images/realizace/hriste-domek-houpacky.jpg',
      '/images/realizace/hriste-vez-most.jpg',
      '/images/realizace/hriste-verejne.jpg',
      '/images/realizace/hriste-skluzavky.jpg',
      '/images/realizace/hriste-lezecka-stena.jpg',
      '/images/realizace/hriste-vez-rampa.jpg',
    ],
    thumbnail: '/images/realizace/hriste-domek-houpacky.jpg',
  },
  {
    id: 'zastreseni-studni',
    category: 'tesarstvi',
    images: [
      '/images/realizace/studna-02.jpg',
      '/images/realizace/studna-03.jpg',
      '/images/realizace/studna-01.jpg',
      '/images/realizace/studna-05.jpg',
      '/images/realizace/studna-04.jpg',
    ],
    thumbnail: '/images/realizace/studna-02.jpg',
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
