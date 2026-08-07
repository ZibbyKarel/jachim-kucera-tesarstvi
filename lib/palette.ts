/**
 * "Dřevo a čas" paleta — paper (papírová), timber (velmi tmavá dřevěná),
 * oak (střední dřevěná), ember (jediný akcent, pálená terakota/rez).
 *
 * Jediný zdroj pravdy pro paletové hex hodnoty v projektu. Čtou z něj:
 *  - tailwind.config.ts (Tailwind theme tokeny → utility třídy jako bg-paper, text-ember)
 *  - app/globals.css (přes Tailwind theme() funkci, ne přímý import)
 *  - components/house3d/config.ts (Three.js scéna, hex převedený na 0xRRGGBB)
 *
 * Výměna palety je díky tomu úprava jednoho souboru — hodnoty se nikde jinde
 * neopisují.
 *
 * Hex hodnoty a WCAG kontrasty jsou naměřené a zdokumentované v
 * docs/superpowers/redesign/PALETTE-WOOD.md (skript contrast.py, sRGB
 * relativní luminance). Všech 14 povinných dvojic PASS. Ember bylo
 * ztmaveno oproti první iteraci (#a34a26 → #9a4220), protože akcent na
 * paper.dim je nejpřísnější vazba v celé sadě.
 */
export const PALETTE = {
  paper: {
    DEFAULT: '#f1ebdb', // teplé ovesné pozadí — primární světlá plocha
    dim: '#e6dcc4', // o odstín tmavší plocha, střídání sekcí (14.10:1 / 12.31:1 s timber)
  },
  timber: {
    DEFAULT: '#241c14', // velmi tmavá teplá hnědá — hlavní text a tmavé pásy (14.10:1 na paper, ≥7:1 práh)
    soft: '#362a1c', // sekundární tmavé pozadí / overlaye (11.73:1 na paper jako text)
  },
  oak: {
    DEFAULT: '#6b5738', // střední teplá hnědá — sekundární text na SVĚTLÉM pozadí (5.79:1 na paper, 5.06:1 na paper-dim) — nepoužívat na tmavém
    soft: '#cbb693', // světlá varianta — text/linky na TMAVÉM pozadí (8.51:1 na timber, 7.08:1 na timber-soft) — nepoužívat na světlém pozadí
  },
  ember: {
    DEFAULT: '#9a4220', // JEDINÝ akcent na SVĚTLÉM pozadí — CTA, odkazy, aktivní/hover stav, nadpisy, focus ring (5.56:1 na paper, 4.85:1 na paper-dim)
    dim: '#7c3719', // ztmavený akcent pro hover/pressed stavy akcentu samotného, na světlém pozadí (7.30:1 jako výplň tlačítka při hoveru)
    soft: '#e0966a', // stejný odstín akcentu, zesvětlený, pro text/hover/aktivní stav/focus ring na TMAVÉM pozadí (6.99:1 na timber) — nepoužívat na světlém pozadí
  },
} as const

/**
 * Odvozená barva jen pro 3D dům (components/house3d/config.ts), plochy
 * stěn/střechy — teplý světlý odstín odvozený od paper (90 % paper.DEFAULT
 * + 10 % oak.DEFAULT po složkách v sRGB), ať dům na /nahled-3d sedí do nové
 * dřevěné palety místo do studeného mixu z předchozí palety. Není to
 * samostatný designový token použitý jinde ve webu (nejde o textovou/UI
 * kontrastní dvojici, je to plocha 3D meshe), ale přesto patří sem, ne jako
 * raw hex v config.ts — jinak by výměna palety musela počítat i s tímhle
 * místem ručně.
 */
export const HOUSE3D_FACE = '#e4dccb' // paper/oak mix (90/10) — plochy stěn/střechy domu
