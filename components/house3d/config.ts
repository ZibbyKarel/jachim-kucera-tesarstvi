/* -------------------------------------------------------------------------- */
/*  Konfigurace 3D domu — rozměry, paleta, menu                                */
/*                                                                             */
/*  Vše je deklarativní: geometrie (HouseModel) i menu (MenuOverlay) čtou      */
/*  z těchto konstant, takže scéna jde ladit z jednoho místa.                  */
/* -------------------------------------------------------------------------- */

/** Architektonický prvek = jedna položka menu napojená na část domu. */
export type MenuId =
  | 'roof'
  | 'gutters'
  | 'pergola'

export type LabelSide = 'left' | 'right'

export interface MenuItem {
  id: MenuId
  /** Slug služby — hlavní text labelu se bere z messages.services.<slug>.title. */
  serviceSlug: 'pokryvacstvi' | 'tesarstvi' | 'klempirstvi'
  /** Podtext (část domu) se bere z messages.house3dMenu.<id>. */
  side: LabelSide
  /** Pořadí ve sloupci (0 = nahoře). */
  slot: number
  /** Kotvící bod ve world-space domu, kam míří spojnice. */
  anchor: [number, number, number]
}

/** "Materiály řemesla" paleta - steel/zinek, břidlice, patina mědi.
 *  emissiveHover/accent = #486c5a, WCAG-AA doladěný `patina` token z
 *  tailwind.config.ts (Task 1) - tmavší než výchozí hex zadání #5b8a72. */
export const COLORS = {
  background: 0xeef0ef, // paper
  line: 0x2a3136, // slate-soft - obrysové linky
  lineHover: 0x1c2226, // slate - tmavší při hoveru pro kontrast
  face: 0xdfe2e1, // paper-dim/steel mix - plochy stěn/střechy
  faceHover: 0xeef0ef, // paper - zesvětlá při hoveru
  emissiveHover: 0x486c5a, // patina - jediný akcent, hover/aktivní stav
  ground: 0xeef0ef, // paper
  // Neutrální bílá pro Three.js světla (Hemisphere/Directional/Ambient) - drží
  // je mimo paletu domu, ať zůstanou skutečně bílá i po výměně palety za
  // "dřevěnou". Beze změny při ladění palety, proto zůstává samostatně od
  // face/background (i když má stejnou logiku "žádný raw hex mimo config.ts").
  white: 0xffffff,
  /* DOM/overlay (CSS) */
  ink: '#1c2226', // slate
  inkSoft: 'rgba(28, 34, 38, 0.55)',
  accent: '#486c5a', // patina - jediný akcent
} as const

export const LINE = {
  width: 1.7,
  widthHover: 3.2,
  /* jemnější tahy pro drobné prvky */
  widthThin: 1.2,
} as const

/** Rozměry domu (přibližně metry). Počátek = střed půdorysu, +Z = předek. */
export const DIM = {
  main: { w: 6, d: 6, h: 3 },     // hlavní hmota (x, z, y)
  roof: { rise: 1.5, overhang: 0.25, slab: 0.12 },
  garage: { w: 3.2, d: 2.8, h: 2.6 },
  pergola: { w: 2.6, d: 2.4, h: 2.6, post: 0.14, beams: 6 },
  eave: 3,                          // výška okapu = h hlavní hmoty
} as const

/** Menu — pořadí, strana a kotvy. Pořadí dle spec.
    Pozn.: Tesařství = pergola + dětská prolézačka, Klempířství = okapy/svody +
    oplechování komínu. Druhá část každé dvojice je geometrie sloučená do téhož
    ArchElementu (rozsvítí se společně a vede na stejnou stránku), takže nemá
    vlastní spojnici — kotva míří na hlavní část. */
export const MENU: MenuItem[] = [
  // Levý sloupec — řazeno shora dolů dle výšky kotvy.
  { id: 'roof', serviceSlug: 'pokryvacstvi', side: 'left', slot: 0, anchor: [-1.8, 4.35, 0.1] },
  { id: 'pergola', serviceSlug: 'tesarstvi', side: 'left', slot: 1, anchor: [-1.7, 2.62, 4.9] },
  // Pravý sloupec.
  { id: 'gutters', serviceSlug: 'klempirstvi', side: 'right', slot: 0, anchor: [3.3, 3.05, 3.42] },
]

/** Kam se dívá kamera + úhel (30° horizontálně, 20° vertikálně). */
export const CAMERA = {
  fov: 34,
  azimuthDeg: 30,
  elevationDeg: 20,
  distance: 17.5,
  target: [0, 1.9, 0] as [number, number, number],
  /* limity OrbitControls (radiány se dopočítají) */
  azimuthRangeDeg: 13,
  polarRangeDeg: 7,
  zoomRange: [0.88, 1.15] as [number, number],
} as const
