import type {
  Service,
  Project,
  HouseLabel,
  TimelineMilestone,
  CompanyValue,
} from './types'

export const SITE = {
  name: 'Jáchim & Kučera — Tesařství',
  shortName: 'Jáchim & Kučera',
  url: 'https://jachim-kucera-tesarstvi.cz',
  phone: '+420 777 123 456',
  phoneHref: '+420777123456',
  email: 'info@jachim-kucera-tesarstvi.cz',
  region: 'Plzeňský kraj a okolí',
  tagline: 'Poctivá řemeslná práce',
} as const

/* -------------------------------------------------------------------------- */
/*  Služby                                                                     */
/* -------------------------------------------------------------------------- */

export const services: Service[] = [
  {
    slug: 'tesarstvi',
    houseGroup: 'g-truss',
    title: 'Tesařství',
    tagline: 'Krovy, které drží generace',
    shortDescription:
      'Stavíme a rekonstruujeme krovy, dřevěné stropy a pergoly. Každý spoj řešíme tak, aby vydržel desítky let — od ručního opracování po moderní tesařské kování.',
    longDescription: [
      'Tesařina je řemeslo, u kterého jsme začínali a které nás drží dodnes. Stavíme nové krovy na rodinné domy i rekonstruujeme historické konstrukce, kde je potřeba cit pro původní práci a zároveň znalost dnešních norem. Než položíme první trám, projdeme s vámi projekt a navrhneme řešení, které sedí na váš dům i rozpočet.',
      'Dřevo vybíráme s rozmyslem — sušené, kvalitní řezivo s certifikátem, které se nekroutí a nepraská. Spoje navrhujeme tak, aby přenášely zatížení tam, kam mají, a aby konstrukce dýchala. U rekonstrukcí citlivě vyměníme jen to, co je opravdu napadené, a zbytek zachováme.',
      'Pracujeme s tesařským kováním i klasickými plátovanými spoji. U pohledových krovů a stropů dbáme na detail — hrany, fazety i povrchovou úpravu, protože takový strop pak v interiéru zůstává na očích roky.',
      'Postavíme vám i pergolu, carport nebo přístřešek na míru. Od jednoduchého zastřešení terasy po samostatně stojící konstrukci, která vydrží sníh i vítr a hezky zestárne.',
    ],
    workItems: [
      {
        number: '01',
        title: 'Krovové konstrukce',
        description:
          'Nové krovy i kompletní rekonstrukce. Vaznicové, hambálkové i složitější soustavy podle tvaru střechy a zatížení.',
      },
      {
        number: '02',
        title: 'Dřevěné a trámové stropy',
        description:
          'Pohledové trámové stropy, záklopy a podbití. Statika i estetika v jednom — strop, který zdobí interiér.',
      },
      {
        number: '03',
        title: 'Pergoly, carporty, přístřešky',
        description:
          'Zastřešení teras, stání pro auta i zahradní přístřešky na míru. Robustní konstrukce s čistým detailem.',
      },
      {
        number: '04',
        title: 'Bednění a fasádní dřevo',
        description:
          'Podstřešní bednění, palubkové podhledy a dřevěné fasády. Provětrávané systémy s dlouhou životností.',
      },
    ],
    heroImage: '/images/realizace/krov-detail-01.jpg',
    gallery: [
      { src: '/images/realizace/krov-plzen-01.jpg', alt: 'Nový krov rodinného domu v Plzni' },
      { src: '/images/realizace/krov-klatovy-01.jpg', alt: 'Rekonstrukce historického krovu v Klatovech' },
      { src: '/images/realizace/strop-tramovy-01.jpg', alt: 'Pohledový trámový strop' },
      { src: '/images/realizace/pergola-rokycany-01.jpg', alt: 'Dřevěná pergola u rodinného domu' },
      { src: '/images/realizace/carport-01.jpg', alt: 'Carport z masivního dřeva' },
      { src: '/images/realizace/krov-detail-spoj.jpg', alt: 'Detail tesařského spoje krovu' },
    ],
    seo: {
      title: 'Tesařství — Krovové konstrukce a dřevěné práce | Plzeňský kraj',
      description:
        'Stavíme a rekonstruujeme krovy, dřevěné stropy a pergoly v Plzeňském kraji. Přes 20 let zkušeností, poctivá práce, férová cena.',
    },
  },
  {
    slug: 'pokryvacstvi',
    houseGroup: 'g-roof',
    title: 'Pokrývačství',
    tagline: 'Střecha, která vás přečká',
    shortDescription:
      'Pokládáme pálenou i betonovou krytinu, plech i šindel. Postaráme se o hydroizolaci, parotěsné zábrany i čisté detaily hřebenů a úžlabí.',
    longDescription: [
      'Střecha je to, co dům chrání nejvíc — a taky to, na čem se nejvíc šetří špatně. My pokládáme krytinu tak, aby pod ní bylo sucho i za třicet let. Začínáme správně navrženou skladbou: pojistná hydroizolace, kontralatě, laťování a teprve potom krytina.',
      'Pracujeme se vším, co dnešní střechy potřebují — pálené tašky, betonová krytina, falcovaný plech i tradiční šindel. Poradíme, co se hodí na váš sklon střechy, lokalitu i styl domu, a řekneme férově, co dává smysl a co je zbytečný luxus.',
      'Velký důraz klademe na detaily, kde střechy nejčastěji zatékají — úžlabí, nároží, prostupy a napojení na komín. Tady se pozná rozdíl mezi rychlou prací a poctivým řemeslem. Parotěsné a difuzní fólie řešíme tak, aby konstrukce neplesnivěla a střecha dýchala.',
      'U rekonstrukcí nejdřív zjistíme stav bednění a laťování a vyměníme, co je potřeba. Nepokládáme novou krytinu na shnilé latě jen proto, aby to bylo rychle hotové.',
    ],
    workItems: [
      {
        number: '01',
        title: 'Pálená a betonová krytina',
        description:
          'Klasické skládané krytiny pro šikmé střechy. Přesná pokládka, správné překrytí a větrání hřebene.',
      },
      {
        number: '02',
        title: 'Bobrovka, šindel, plech',
        description:
          'Tradiční bobrovka, dřevěný i asfaltový šindel a falcovaný plech. Řešení pro památky i moderní domy.',
      },
      {
        number: '03',
        title: 'Hydroizolace a parotěsné zábrany',
        description:
          'Správná skladba střešního pláště — pojistná hydroizolace, difuzní a parotěsné fólie bez tepelných mostů.',
      },
      {
        number: '04',
        title: 'Hřebeny, nároží, úžlabí',
        description:
          'Detaily, kde střechy zatékají nejčastěji. Děláme je tak, aby držely vodu i za extrémního počasí.',
      },
    ],
    heroImage: '/images/realizace/strecha-palena-01.jpg',
    gallery: [
      { src: '/images/realizace/strecha-palena-plzen.jpg', alt: 'Pálená krytina na rodinném domě v Plzni' },
      { src: '/images/realizace/strecha-plech-falc.jpg', alt: 'Falcovaná plechová střecha' },
      { src: '/images/realizace/strecha-bobrovka.jpg', alt: 'Tradiční bobrovka na rekonstruované střeše' },
      { src: '/images/realizace/strecha-uzlabi.jpg', alt: 'Detail úžlabí střechy' },
      { src: '/images/realizace/strecha-hreben.jpg', alt: 'Větraný hřeben střechy' },
      { src: '/images/realizace/strecha-rekonstrukce.jpg', alt: 'Rekonstrukce střešního pláště' },
    ],
    seo: {
      title: 'Pokrývačství — Pokládka střešní krytiny | Plzeňský kraj',
      description:
        'Pokládáme pálenou a betonovou krytinu, plech i šindel v Plzeňském kraji. Hydroizolace, detaily hřebenů a úžlabí. Střecha, která vydrží.',
    },
  },
  {
    slug: 'klempirstvi',
    houseGroup: 'g-gutters',
    title: 'Klempířství',
    tagline: 'Detail, který odvede vodu',
    shortDescription:
      'Vyrábíme a montujeme okapové systémy, oplechování komínů, parapetů a říms. Pracujeme s pozinkem, titanzinkem i mědí.',
    longDescription: [
      'Klempířina je o detailech, které nejsou vidět, dokud nezačnou zlobit. My je děláme tak, aby zlobit nezačaly. Okapy, svody, oplechování a lemování jsou to, co střechu doplňuje a chrání zdivo i základy před vodou.',
      'Okapové systémy montujeme z pozinkovaného plechu, titanzinku i mědi — podle toho, co se hodí k domu a jak dlouho mají vydržet. Titanzinek i měď nabízíme i v provedení, které krásně stárne a získává patinu. Spády a dimenze žlabů navrhujeme podle plochy střechy, ne od oka.',
      'Oplechování komínů, atik, parapetů a říms vyrábíme na míru přímo na stavbě. Spoje falcujeme a lepíme tak, aby byly těsné a zároveň umožnily dilataci plechu při změnách teploty.',
      'Postaráme se i o klempířské detaily kolem střešních prostupů, ventilací a prostupů antén. Jsou to maličkosti, ale právě ony rozhodují o tom, jestli střecha těsní.',
    ],
    workItems: [
      {
        number: '01',
        title: 'Okapové systémy',
        description:
          'Žlaby a svody z pozinku, titanzinku i mědi. Správné spády, dimenze a kotvení pro bezúdržbový odvod vody.',
      },
      {
        number: '02',
        title: 'Oplechování říms, parapetů, komínů',
        description:
          'Lemování a oplechování na míru přímo na stavbě. Falcované spoje, které těsní a počítají s dilatací.',
      },
      {
        number: '03',
        title: 'Střešní prostupy a ventilace',
        description:
          'Těsné napojení komínů, ventilací a prostupů. Detaily, na kterých střechy nejčastěji selhávají.',
      },
      {
        number: '04',
        title: 'Klempířské detaily',
        description:
          'Lemování zdí, závětrné lišty, okapnice a další prvky, které drží vodu tam, kam patří.',
      },
    ],
    heroImage: '/images/realizace/okap-mer-01.jpg',
    gallery: [
      { src: '/images/realizace/okap-med.jpg', alt: 'Měděný okapový systém' },
      { src: '/images/realizace/okap-titanzinek.jpg', alt: 'Okapy z titanzinku' },
      { src: '/images/realizace/oplechovani-komin.jpg', alt: 'Oplechování komínu' },
      { src: '/images/realizace/oplechovani-parapet.jpg', alt: 'Oplechování parapetů' },
      { src: '/images/realizace/svod-detail.jpg', alt: 'Detail svodu okapu' },
      { src: '/images/realizace/lemovani-zed.jpg', alt: 'Lemování napojení střechy na zeď' },
    ],
    seo: {
      title: 'Klempířství — Okapy a oplechování | Plzeňský kraj',
      description:
        'Okapové systémy, oplechování komínů a parapetů z pozinku, titanzinku i mědi. Klempířské práce v Plzeňském kraji s důrazem na detail.',
    },
  },
  {
    slug: 'cisteni-strech',
    houseGroup: 'g-roof',
    title: 'Čištění střech',
    tagline: 'Vraťte střeše roky života',
    shortDescription:
      'Odstraníme mech, lišejníky a nečistoty, ošetříme krytinu a vyčistíme okapy. Údržba, která prodlouží životnost střechy bez nutnosti rekonstrukce.',
    longDescription: [
      'Ne každá zašlá střecha potřebuje vyměnit. Často stačí ji pořádně vyčistit a ošetřit — a získá tím klidně dalších deset let života. Mech a lišejníky zadržují vlhkost a postupně rozrušují povrch krytiny; čím dřív se odstraní, tím líp.',
      'Krytinu čistíme tlakovou vodou s ohledem na její typ a stáří, abychom povrch nepoškodili. Po vyčištění naneseme preventivní nátěr nebo impregnaci, která zpomalí opětovný růst mechu a obnoví barvu i hydrofobní vlastnosti tašek.',
      'Při čištění vždy zkontrolujeme stav krytiny, hřebenů a oplechování a upozorníme vás na místa, která by mohla v budoucnu dělat problém. Levnější je opravit detail včas než řešit zatékání.',
      'Nezapomínáme ani na okapy — zanesené žlaby přetékají a vlhko pak putuje do fasády a základů. Vyčištění okapů zařadíme rovnou do prohlídky střechy.',
    ],
    workItems: [
      {
        number: '01',
        title: 'Odstranění mechů a lišejníků',
        description:
          'Šetrné mechanické i tlakové odstranění porostu, který drží vlhkost a ničí povrch krytiny.',
      },
      {
        number: '02',
        title: 'Tlakové mytí krytiny',
        description:
          'Čištění přizpůsobené typu a stáří krytiny tak, aby se obnovil povrch a nepoškodil materiál.',
      },
      {
        number: '03',
        title: 'Preventivní nátěry a impregnace',
        description:
          'Ochranný nátěr, který zpomalí návrat mechu, obnoví barvu a vrátí taškám odpudivost vůči vodě.',
      },
      {
        number: '04',
        title: 'Čištění okapů',
        description:
          'Vyčištění žlabů a svodů, aby voda odtékala, kam má, a nezatékala do fasády a základů.',
      },
    ],
    heroImage: '/images/realizace/cisteni-strecha-01.jpg',
    gallery: [
      { src: '/images/realizace/cisteni-pred-po.jpg', alt: 'Střecha před a po vyčištění' },
      { src: '/images/realizace/cisteni-mech.jpg', alt: 'Odstranění mechu ze střešní krytiny' },
      { src: '/images/realizace/cisteni-tlak.jpg', alt: 'Tlakové mytí střešní krytiny' },
      { src: '/images/realizace/cisteni-nater.jpg', alt: 'Nanášení ochranného nátěru na krytinu' },
      { src: '/images/realizace/cisteni-okap.jpg', alt: 'Čištění okapů' },
      { src: '/images/realizace/cisteni-strecha-02.jpg', alt: 'Vyčištěná střecha rodinného domu' },
    ],
    seo: {
      title: 'Čištění střech — Mech, mytí a impregnace | Plzeňský kraj',
      description:
        'Odstraníme mech a lišejníky, vyčistíme krytinu i okapy a ošetříme střechu preventivním nátěrem. Údržba střech v Plzeňském kraji.',
    },
  },
]

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug)
}

/* -------------------------------------------------------------------------- */
/*  Realizace                                                                  */
/* -------------------------------------------------------------------------- */

export const projects: Project[] = [
  {
    id: 'krov-rodinny-dum-plzen',
    title: 'Nový krov rodinného domu',
    category: 'tesarstvi',
    location: 'Plzeň-sever',
    year: 2024,
    description:
      'Kompletní vaznicový krov novostavby rodinného domu. Sušené řezivo, tesařské kování a pohledové prvky nad terasou.',
    images: [
      '/images/realizace/krov-plzen-01.jpg',
      '/images/realizace/krov-plzen-02.jpg',
      '/images/realizace/krov-plzen-03.jpg',
    ],
    thumbnail: '/images/realizace/krov-plzen-01.jpg',
  },
  {
    id: 'rekonstrukce-krovu-klatovy',
    title: 'Rekonstrukce historického krovu',
    category: 'tesarstvi',
    location: 'Klatovy',
    year: 2023,
    description:
      'Záchrana původního krovu měšťanského domu. Výměna napadených částí, protézování a zpevnění při zachování historické konstrukce.',
    images: [
      '/images/realizace/krov-klatovy-01.jpg',
      '/images/realizace/krov-klatovy-02.jpg',
    ],
    thumbnail: '/images/realizace/krov-klatovy-01.jpg',
  },
  {
    id: 'pergola-rokycany',
    title: 'Pergola se zastřešením terasy',
    category: 'tesarstvi',
    location: 'Rokycany',
    year: 2025,
    description:
      'Samostatně stojící pergola z masivního dřeva s polykarbonátovým zastřešením a integrovaným osvětlením.',
    images: [
      '/images/realizace/pergola-rokycany-01.jpg',
      '/images/realizace/pergola-rokycany-02.jpg',
    ],
    thumbnail: '/images/realizace/pergola-rokycany-01.jpg',
  },
  {
    id: 'tramovy-strop-susice',
    title: 'Pohledový trámový strop',
    category: 'tesarstvi',
    location: 'Sušice',
    year: 2022,
    description:
      'Pohledový trámový strop v rekonstruovaném podkroví. Ručně opracované hrany a olejovaný povrch.',
    images: ['/images/realizace/strop-tramovy-01.jpg'],
    thumbnail: '/images/realizace/strop-tramovy-01.jpg',
  },
  {
    id: 'strecha-palena-plzen',
    title: 'Pálená krytina na novostavbě',
    category: 'pokryvacstvi',
    location: 'Plzeň-jih',
    year: 2024,
    description:
      'Kompletní střešní plášť novostavby — pojistná hydroizolace, laťování a pálená krytina včetně větraného hřebene.',
    images: [
      '/images/realizace/strecha-palena-plzen.jpg',
      '/images/realizace/strecha-palena-02.jpg',
    ],
    thumbnail: '/images/realizace/strecha-palena-plzen.jpg',
  },
  {
    id: 'plechova-strecha-domazlice',
    title: 'Falcovaná plechová střecha',
    category: 'pokryvacstvi',
    location: 'Domažlice',
    year: 2023,
    description:
      'Falcovaná střecha z titanzinku na zemědělské usedlosti. Dlouhé pásy bez příčných spojů a čisté detaily úžlabí.',
    images: ['/images/realizace/strecha-plech-falc.jpg'],
    thumbnail: '/images/realizace/strecha-plech-falc.jpg',
  },
  {
    id: 'bobrovka-stribro',
    title: 'Rekonstrukce střechy bobrovkou',
    category: 'pokryvacstvi',
    location: 'Stříbro',
    year: 2021,
    description:
      'Výměna krytiny historického domu za tradiční režnou bobrovku korunové kladení, včetně nového laťování.',
    images: ['/images/realizace/strecha-bobrovka.jpg'],
    thumbnail: '/images/realizace/strecha-bobrovka.jpg',
  },
  {
    id: 'strecha-rekonstrukce-nepomuk',
    title: 'Rekonstrukce střešního pláště',
    category: 'pokryvacstvi',
    location: 'Nepomuk',
    year: 2025,
    description:
      'Kompletní rekonstrukce střechy rodinného domu — nové bednění, fólie, laťování a betonová krytina.',
    images: ['/images/realizace/strecha-rekonstrukce.jpg'],
    thumbnail: '/images/realizace/strecha-rekonstrukce.jpg',
  },
  {
    id: 'medene-okapy-plzen',
    title: 'Měděný okapový systém',
    category: 'klempirstvi',
    location: 'Plzeň-město',
    year: 2024,
    description:
      'Kompletní měděné okapy a svody na vile v historické čtvrti. Pájené spoje a oplechování říms ze stejného materiálu.',
    images: [
      '/images/realizace/okap-med.jpg',
      '/images/realizace/okap-med-02.jpg',
    ],
    thumbnail: '/images/realizace/okap-med.jpg',
  },
  {
    id: 'oplechovani-komin-tachov',
    title: 'Oplechování komínu a atik',
    category: 'klempirstvi',
    location: 'Tachov',
    year: 2023,
    description:
      'Oplechování komínového tělesa a atik z titanzinku, vyrobené na míru přímo na stavbě s falcovanými spoji.',
    images: ['/images/realizace/oplechovani-komin.jpg'],
    thumbnail: '/images/realizace/oplechovani-komin.jpg',
  },
  {
    id: 'titanzinek-okapy-horsovsky-tyn',
    title: 'Okapy z titanzinku',
    category: 'klempirstvi',
    location: 'Horšovský Týn',
    year: 2022,
    description:
      'Nový okapový systém z titanzinku na rodinném domě, navržené spády a dimenze žlabů podle plochy střechy.',
    images: ['/images/realizace/okap-titanzinek.jpg'],
    thumbnail: '/images/realizace/okap-titanzinek.jpg',
  },
  {
    id: 'strecha-okapy-prestice',
    title: 'Střecha a klempířina v jednom',
    category: 'pokryvacstvi',
    location: 'Přeštice',
    year: 2025,
    description:
      'Zakázka od krovu po okapy — nová střecha s betonovou krytinou a kompletní klempířské prvky z pozinku.',
    images: ['/images/realizace/strecha-okapy-prestice.jpg'],
    thumbnail: '/images/realizace/strecha-okapy-prestice.jpg',
  },
]

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

/* -------------------------------------------------------------------------- */
/*  Labely na domě                                                             */
/* -------------------------------------------------------------------------- */

// Labely fungují jako hlavní navigace — každá položka menu odpovídá části domu.
// `side` určuje, na kterou stranu od kotvy text vyrůstá (kvůli spojnici a zarovnání).
export const houseLabels: HouseLabel[] = [
  {
    id: 'label-chimney',
    text: 'O nás',
    subtext: 'Komín — kdo jsme',
    position: { x: '40%', y: '13%' },
    groupId: 'g-chimney',
    href: '/o-nas',
  },
  {
    id: 'label-roof',
    text: 'Pokrývačství',
    subtext: 'Střecha',
    position: { x: '17%', y: '28%' },
    groupId: 'g-roof',
    href: '/sluzby/pokryvacstvi',
  },
  {
    id: 'label-truss',
    text: 'Tesařství',
    subtext: 'Krov',
    position: { x: '80%', y: '33%' },
    groupId: 'g-truss',
    href: '/sluzby/tesarstvi',
  },
  {
    id: 'label-gutters',
    text: 'Klempířství',
    subtext: 'Okapy a svody',
    position: { x: '13%', y: '52%' },
    groupId: 'g-gutters',
    href: '/sluzby/klempirstvi',
  },
  {
    id: 'label-windows',
    text: 'Realizace',
    subtext: 'Co jsme postavili',
    position: { x: '19%', y: '70%' },
    groupId: 'g-windows',
    href: '/realizace',
  },
  {
    id: 'label-door',
    text: 'Kontakt',
    subtext: 'Vstup — ozvěte se',
    position: { x: '53%', y: '82%' },
    groupId: 'g-door',
    href: '/kontakt',
  },
]

/* -------------------------------------------------------------------------- */
/*  O nás                                                                      */
/* -------------------------------------------------------------------------- */

export const aboutStory: string[] = [
  'Jmenujeme se Jáchim a Kučera a střechám se věnujeme přes dvacet let. Začínali jsme jako vyučení tesaři v Plzeňském kraji a dnes vedeme vlastní partu, na kterou se můžete spolehnout. Každou střechu stavíme tak, jako by byla naše vlastní.',
  'Postupem let jsme k tesařině přidali pokrývačství a klempířství, abychom mohli zákazníkovi předat hotovou střechu od krovu po poslední okap — bez toho, aby musel shánět tři různé firmy a hlídat, kdo za co odpovídá. Vše máme pod jednou střechou, doslova.',
  'Nejsme velká firma a nechceme být. Děláme tolik zakázek, kolik zvládneme udělat pořádně. Na stavbu chodíme my, ne anonymní poddodavatelé, a stojíme si za svou prací i po letech. Když něco slíbíme, platí to.',
]

export const aboutStats: { value: string; label: string }[] = [
  { value: '20+', label: 'let praxe' },
  { value: '150+', label: 'realizací' },
  { value: '100%', label: 'Plzeňský kraj a okolí' },
]

export const timeline: TimelineMilestone[] = [
  {
    year: '2003',
    title: 'Vyučeni jako tesaři',
    description:
      'Začínáme jako vyučení tesaři u zavedených mistrů v Plzeňském kraji. Učíme se řemeslo od základu — od ručního opracování dřeva po čtení statiky krovu.',
  },
  {
    year: '2008',
    title: 'Vlastní firma',
    description:
      'Zakládáme vlastní tesařskou partu. První velké zakázky na krovy rodinných domů a rekonstrukce historických střech v okolí Plzně.',
  },
  {
    year: '2015',
    title: 'Rozšíření o klempířství',
    description:
      'Přidáváme pokrývačství a klempířství, abychom mohli předávat kompletní střechu. Investujeme do vybavení i do lidí, kteří řemeslo umí.',
  },
  {
    year: '2024',
    title: '150+ realizací',
    description:
      'Za sebou máme přes sto padesát hotových střech po celém Plzeňském kraji. A pořád nás to baví stejně jako na začátku.',
  },
]

export const values: CompanyValue[] = [
  {
    title: 'Poctivost',
    description:
      'Říkáme férově, co dává smysl a co ne. Neúčtujeme zbytečnou práci a nepoužíváme materiál, kterému sami nevěříme. Co slíbíme, to platí.',
  },
  {
    title: 'Spolehlivost',
    description:
      'Přijdeme, kdy řekneme, a dokončíme, co začneme. Za svou prací si stojíme i po letech a vždy se k ní rádi vrátíme, kdyby bylo potřeba.',
  },
  {
    title: 'Lokální znalost',
    description:
      'Známe Plzeňský kraj, jeho počasí i typické domy. Víme, co na zdejší střechy sedí a co tu vydrží. Jsme od vás kousek, ne z druhého konce republiky.',
  },
]

/* -------------------------------------------------------------------------- */
/*  Navigace                                                                   */
/* -------------------------------------------------------------------------- */

export const navLinks: { href: string; label: string }[] = [
  { href: '/sluzby/tesarstvi', label: 'Tesařství' },
  { href: '/sluzby/pokryvacstvi', label: 'Pokrývačství' },
  { href: '/sluzby/klempirstvi', label: 'Klempířství' },
  { href: '/realizace', label: 'Realizace' },
  { href: '/o-nas', label: 'O nás' },
  { href: '/kontakt', label: 'Kontakt' },
]
