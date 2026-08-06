#!/usr/bin/env node
/**
 * Vygeneruje public/logo-paper.png — světlou (paper) variantu loga pro tmavá
 * pole (patička, mobilní menu). Zdrojový public/logo_2.png má inkoust v
 * tmavě antracitové barvě, která na bg-timber patičky prakticky mizí
 * (kontrast ~1,2:1). Zlatý akcent kolem "TESAŘSTVÍ" na timberu čitelný je
 * (~6:1), takže se nepřebarvuje.
 *
 * Princip: pixely rozlišujeme podle HSL saturace. Inkoust je téměř
 * neutrální šedá (saturace ~0), zlatá je sytě nasycená (saturace ~0,6) —
 * mezi nimi je velká mezera, takže jeden práh stačí. Alfa kanál (nese
 * antialiasing hran kresby) se nikdy nemění.
 *
 * Hex hodnota, na kterou se inkoust přebarvuje, se čte z lib/palette.ts
 * (jediný zdroj pravdy pro paletu, D-024) — nikdy se sem nepíše natvrdo.
 *
 * Kdy pustit znovu: při každé změně public/logo_2.png nebo palety
 * (`node scripts/generate-logo-paper.mjs`). Skript je idempotentní — čte
 * vždy ze zdrojového logo_2.png, ne ze svého vlastního výstupu.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const paletteFile = path.join(repoRoot, 'lib/palette.ts')
const sourceLogo = path.join(repoRoot, 'public/logo_2.png')
const outputLogo = path.join(repoRoot, 'public/logo-paper.png')

// Práh saturace (0–1) oddělující "inkoust" (neutrální/antracitová, ~0) od
// "zlaté" (sytá, ~0,6). Naměřeno na skutečném logu — viz ověření na konci
// skriptu, kde se vypisuje histogram vzorků. 0.2 nechává velkou rezervu na
// obě strany (dark greys jsou pod 0.05, zlatá je nad 0.5).
const SATURATION_THRESHOLD = 0.2

/**
 * Vytáhne hex hodnotu `PALETTE.<group>.<key>` z lib/palette.ts prostým
 * parsováním textu. lib/palette.ts je TypeScript (importovat ho přímo z
 * .mjs dev skriptu bez transpilace nejde), a duplikovat hex hodnoty by
 * porušilo D-024 — regex nad zdrojovým textem je jediná cesta, jak zůstat
 * u jednoho zdroje pravdy.
 */
function readPaletteHex(source, group, key) {
  const groupMatch = source.match(new RegExp(`${group}:\\s*{([^}]*)}`, 's'))
  if (!groupMatch) {
    throw new Error(`lib/palette.ts: skupina "${group}" nenalezena`)
  }
  const valueMatch = groupMatch[1].match(new RegExp(`${key}:\\s*'(#[0-9a-fA-F]{6})'`))
  if (!valueMatch) {
    throw new Error(`lib/palette.ts: PALETTE.${group}.${key} nenalezeno`)
  }
  return valueMatch[1]
}

function hexToRgb(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

/** Saturace v HSL (0–1), počítaná přímo z 0–255 RGB složek. */
function saturation(r, g, b) {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const lightness = (max + min) / 2
  if (max === min) return 0
  const delta = max - min
  return delta / (1 - Math.abs(2 * lightness - 1))
}

async function main() {
  const paletteSource = readFileSync(paletteFile, 'utf8')
  const paperHex = readPaletteHex(paletteSource, 'paper', 'DEFAULT')
  const paperRgb = hexToRgb(paperHex)

  const { data, info } = await sharp(sourceLogo)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // alfa (data[i + 3]) se nedotýká — nese antialiasing hran

    if (saturation(r, g, b) < SATURATION_THRESHOLD) {
      data[i] = paperRgb.r
      data[i + 1] = paperRgb.g
      data[i + 2] = paperRgb.b
    }
    // sytě zlaté pixely necháváme beze změny — na timberu jsou čitelné samy
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputLogo)

  console.log(`Vygenerováno: ${path.relative(repoRoot, outputLogo)}`)
  console.log(`Inkoust přebarven na paper.DEFAULT (${paperHex}), práh saturace ${SATURATION_THRESHOLD}.`)

  await verify(outputLogo, paperRgb)
}

/**
 * Načte vygenerovaný PNG zpátky a ukáže na vzorku pixelů, že přebarvení
 * sedí: nejčastější "inkoustové" pixely (dřív neutrální šedá) teď mají RGB
 * paper.DEFAULT, zatímco zlaté pixely zůstaly sytě zlaté. Bez tohohle
 * ověření by bylo jen „asi to vyšlo".
 */
async function verify(file, paperRgb) {
  const { data, info } = await sharp(file).raw().ensureAlpha().toBuffer({ resolveWithObject: true })
  const { channels } = info

  const buckets = new Map()
  for (let i = 0; i < data.length; i += channels) {
    const a = data[i + 3]
    if (a < 200) continue
    const key = [Math.round(data[i] / 8) * 8, Math.round(data[i + 1] / 8) * 8, Math.round(data[i + 2] / 8) * 8].join(
      ','
    )
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)

  console.log('\nVzorek nejčastějších barev po přebarvení (RGB bucket, počet pixelů):')
  for (const [key, count] of sorted) {
    console.log(`  ${key}  ×${count}`)
  }

  const dominantKey = sorted[0][0]
  const [dr, dg, db] = dominantKey.split(',').map(Number)
  const matchesPaper = Math.abs(dr - paperRgb.r) <= 8 && Math.abs(dg - paperRgb.g) <= 8 && Math.abs(db - paperRgb.b) <= 8
  const goldStillGold = sorted.some(([key]) => {
    const [r, g, b] = key.split(',').map(Number)
    return saturation(r, g, b) > 0.4
  })

  if (!matchesPaper) {
    throw new Error(
      `Ověření selhalo: nejčastější barva ${dominantKey} neodpovídá paper.DEFAULT (${paperRgb.r},${paperRgb.g},${paperRgb.b}).`
    )
  }
  if (!goldStillGold) {
    throw new Error('Ověření selhalo: mezi vzorky se nenašla žádná sytě zlatá barva — zlatá se přebarvila taky.')
  }

  console.log(
    `\nOK: dominantní inkoust odpovídá paper.DEFAULT a mezi vzorky je stále přítomná sytá zlatá (saturace > 0,4).`
  )
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
