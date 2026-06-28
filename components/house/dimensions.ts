/**
 * Parametrické rozměry domu — jediný zdroj pravdy.
 *
 * Souřadný systém: Y nahoru, jednotky ≈ metry, terén v y = 0.
 * Hřeben střechy běží podél osy Z (hloubka); příčný řez v rovině X–Y je
 * trojúhelník. Štíty míří na ±Z, **přední štít je +Z** (dveře + pergola).
 * Boční (okenní) stěny jsou plochy ±X.
 *
 * Každá část modelu se odvozuje z těchto čísel, takže stěny, okna, střecha
 * a okapy lícují konstrukčně, ne ručním dolaďováním.
 */
export const DIMS = {
  width: 6, // X — rozpětí mezi okapy
  depth: 4.5, // Z — od štítu ke štítu
  wallH: 3, // výška stěny (líc základu → okap)
  foundH: 0.35, // výška soklu / základu
  roofRise: 1.9, // okap → hřeben (svisle)
  eaveOver: 0.45, // přesah střechy přes stěnu v ±X
  gableOver: 0.4, // přesah střechy přes štít v ±Z
  roofThick: 0.18, // tloušťka střešní roviny
  wallThick: 0.2, // tloušťka stěny (pro rámy/výklenky)
} as const

const halfW = DIMS.width / 2
const halfD = DIMS.depth / 2

const eaveY = DIMS.foundH + DIMS.wallH
const ridgeY = eaveY + DIMS.roofRise
const roofHalfBase = halfW + DIMS.eaveOver

/** Odvozené hodnoty — sdílené napříč částmi modelu i kotvami labelů. */
export const GEO = {
  halfW,
  halfD,
  foundTopY: DIMS.foundH,
  eaveY, // vrchol stěn
  ridgeY, // hřeben
  eaveX: roofHalfBase, // vnější hrana střechy v X (na ní okapy)
  wallCenterY: DIMS.foundH + DIMS.wallH / 2,
  roofHalfBase,
  roofSlopeLen: Math.hypot(roofHalfBase, DIMS.roofRise), // délka střešní roviny
  roofAngle: Math.atan2(DIMS.roofRise, roofHalfBase), // sklon (rotace kolem Z)
  roofLenZ: DIMS.depth + 2 * DIMS.gableOver, // délka střechy podél Z (s přesahem)
} as const

/** Skupina (groupId) → cílová stránka. Zrcadlí `houseLabels` v lib/constants. */
export const PART_HREF: Record<string, string> = {
  'g-roof': '/sluzby/pokryvacstvi',
  'g-truss': '/sluzby/tesarstvi',
  'g-gutters': '/sluzby/klempirstvi',
  'g-windows': '/o-nas',
  'g-chimney': '/realizace',
  'g-door': '/kontakt',
}

/** Barvy materiálů z brand palety. */
export const MAT = {
  foundation: '#6f6356',
  wall: '#e8dfca',
  roof: '#7a4a2b',
  beam: '#5a3d22',
  wood: '#a06a2c',
  metal: '#3a3a3c',
  brick: '#8c4a32',
  glass: '#9fc4d6',
  frame: '#4a3322',
  highlight: '#d99a3a',
} as const
