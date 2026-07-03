import * as THREE from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { ArchElement } from './ArchElement'
import { COLORS, DIM, MENU, type MenuId } from './config'

/* -------------------------------------------------------------------------- */
/*  HouseModel — parametrický moderní rodinný dům                              */
/*                                                                             */
/*  Každá část (střecha, okapy, pergola, fasáda, okna, garáž, vstup) je        */
/*  samostatný ArchElement = výplň + CAD obrysy + highlight. Komín je dekor.    */
/*  Geometrie je jednoduchá masová — žádné textury, žádné tašky/cihly.          */
/* -------------------------------------------------------------------------- */

export class HouseModel {
  readonly root = new THREE.Group()
  readonly elements = new Map<MenuId, ArchElement>()
  readonly all: ArchElement[] = []
  /** Plaňkový plot — svítí s Tesařstvím, jen na desktopu (viz SceneManager.resize). */
  readonly fence: ArchElement

  constructor() {
    this.root.name = 'house'
    this.buildFacade()
    this.buildRoof()
    this.buildGutters() // okapy/svody + oplechování komínu (Klempířství)
    this.buildPergola() // pergola + dětská prolézačka (Tesařství)
    this.buildWindows()
    this.buildEntrance() // vstupní dveře (dekor — Kontakt řeší CTA tlačítko)
    this.fence = this.buildFence() // plot — tesařská práce, jen desktop
    for (const el of this.all) this.root.add(el.group)
  }

  private register(el: ArchElement): ArchElement {
    this.all.push(el)
    if (el.menuId) this.elements.set(el.menuId, el)
    return el
  }

  private anchorOf(id: MenuId): [number, number, number] {
    return MENU.find((m) => m.id === id)!.anchor
  }

  /* ---- Fasáda: hlavní hmota + garážová hmota + štítové trojúhelníky -------- */
  private buildFacade(): void {
    const el = new ArchElement(null)
    const { w, d, h } = DIM.main

    // hlavní hmota
    el.addSolid(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0))

    // štíty (trojúhelníky) na koncích x = ±w/2
    const apexY = h + DIM.roof.rise
    const hx = w / 2
    const hz = d / 2
    for (const sx of [-hx, hx]) {
      el.addSolid(triangle([sx, h, -hz], [sx, h, hz], [sx, apexY, 0]), {
        doubleSide: true,
      })
    }
    this.register(el)
  }

  /* ---- Střecha: dvě roviny (slaby) ---------------------------------------- */
  private buildRoof(): void {
    const el = new ArchElement('roof', this.anchorOf('roof'))
    const { rise, overhang: oh, slab } = DIM.roof
    const { w, d, h } = DIM.main
    const eaveZ = d / 2 + oh
    const slopeLen = Math.hypot(eaveZ, rise)
    const angle = Math.atan2(rise, eaveZ)
    const slabW = w + 2 * oh
    const midY = h + rise / 2

    for (const sign of [1, -1]) {
      const geo = new THREE.BoxGeometry(slabW, slab, slopeLen)
      geo.rotateX(sign * angle)
      geo.translate(0, midY, (sign * eaveZ) / 2)
      el.addSolid(geo, { edgeAngle: 20 })
    }

    // Firemní značka „namalovaná" na přední (k divákovi obrácené) rovině střechy.
    // Nátěr leží PŘESNĚ v rovině slaby: vlastní skupina zdědí sklon i posun slaby
    // (rotateX(angle) + posun na střed přední roviny), texturovaný list se pak už
    // jen položí naplocho (rotateX(-90°)) těsně nad povrch. Díky tomu značka drží
    // sklon i orientaci střechy a čte se vzhůru ke hřebeni.
    this.addRoofDecal(el, angle, midY, eaveZ, slabW, slopeLen, slab)

    this.register(el)
  }

  private addRoofDecal(
    el: ArchElement,
    angle: number,
    midY: number,
    eaveZ: number,
    slabW: number,
    slopeLen: number,
    slab: number
  ): void {
    const tex = new THREE.TextureLoader().load('/logo_2.png')
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8 // čitelnost pod ostrým úhlem pohledu na střechu

    const LOGO_AR = 867 / 463 // poměr stran zdrojového PNG
    const planeW = slabW * 0.72 // ~72 % šířky střešní roviny (vzduch po stranách)
    const planeH = planeW / LOGO_AR
    // pojistka, ať se výška vejde do délky slaby (od okapu ke hřebeni)
    const h = Math.min(planeH, slopeLen * 0.82)
    const w = h * LOGO_AR

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      opacity: 1,
      roughness: 1,
      metalness: 0,
      depthWrite: false, // nezapisuje hloubku → žádné řazení proti slabě
      polygonOffset: true, // a ještě drobný offset, ať vždy vyhraje nad povrchem
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    mesh.rotation.x = -Math.PI / 2 // list položený naplocho (normála vzhůru)
    mesh.position.y = slab / 2 + 0.015 // těsně nad horní líc slaby
    mesh.renderOrder = 2
    mesh.receiveShadow = true // stín komínu/stromu dopadne i na malbu

    // Skupina = přesná transformace přední slaby (sklon + posun na střed roviny).
    const paint = new THREE.Group()
    paint.rotation.x = angle
    paint.position.set(0, midY, eaveZ / 2)
    paint.add(mesh)

    // prvek střechy drží celou obalovou skupinu (intro/idle/klik jdou s ním)
    el.addDecal(mesh, paint)
  }

  /* ---- Okapy a svody ------------------------------------------------------ */
  private buildGutters(): void {
    const el = new ArchElement('gutters', this.anchorOf('gutters'))
    const { d, h } = DIM.main
    const oh = DIM.roof.overhang
    const eaveZ = d / 2 + oh
    const len = DIM.main.w + 2 * oh + 0.1

    // přední okap podél hřebene okapu
    el.addSolid(new THREE.BoxGeometry(len, 0.16, 0.16).translate(0, h - 0.04, eaveZ), {
      thin: true,
    })
    // svod v pravém rohu
    el.addSolid(
      new THREE.BoxGeometry(0.14, h, 0.14).translate(len / 2 - 0.2, h / 2, eaveZ),
      { thin: true }
    )
    // komín s oplechováním (klempířská práce → patří pod Klempířství, rozsvítí se
    // společně s okapy). Hmota komínu + tenký „límec" oplechování u paty.
    el.addSolid(new THREE.BoxGeometry(0.5, 1.7, 0.5).translate(1.65, 4.95, -0.4))
    el.addSolid(new THREE.BoxGeometry(0.66, 0.08, 0.66).translate(1.65, 4.16, -0.4), {
      thin: true,
    })
    this.register(el)
  }

  /* ---- Pergola: sloupky + obvodové trámy + příčné latě -------------------- */
  private buildPergola(): void {
    const el = new ArchElement('pergola', this.anchorOf('pergola'))
    const { post, h: ph } = DIM.pergola
    const x0 = -DIM.main.w / 2
    const x1 = x0 + DIM.pergola.w
    const z0 = DIM.main.d / 2 + 0.1
    const z1 = z0 + DIM.pergola.d

    // 4 sloupky
    for (const px of [x0 + 0.1, x1 - 0.1]) {
      for (const pz of [z0 + 0.1, z1 - 0.1]) {
        el.addSolid(new THREE.BoxGeometry(post, ph, post).translate(px, ph / 2, pz), {
          thin: true,
        })
      }
    }
    // dva podélné trámy
    for (const px of [x0 + 0.1, x1 - 0.1]) {
      el.addSolid(
        new THREE.BoxGeometry(0.12, 0.18, DIM.pergola.d).translate(px, ph - 0.05, (z0 + z1) / 2),
        { thin: true }
      )
    }
    // příčné latě
    const n = DIM.pergola.beams
    for (let i = 0; i < n; i++) {
      const pz = z0 + 0.25 + (i / (n - 1)) * (DIM.pergola.d - 0.5)
      el.addSolid(
        new THREE.BoxGeometry(DIM.pergola.w - 0.2, 0.1, 0.1).translate((x0 + x1) / 2, ph + 0.04, pz),
        { thin: true }
      )
    }
    // dětská prolézačka v pravém předzahradí (tesařská práce → také Tesařství)
    this.buildPlayground(el)
    this.register(el)
  }

  /* ---- Dětská prolézačka: skluzavka + houpačka --------------------------- */
  /*  Sloučená do pergolového ArchElementu — rozsvítí se i klikne jako Tesařství.
      Dvě jednoznačně dětské hmoty: otevřená plošina se žebříkem a skluzem, vedle  */
  /*  A-rám houpačky se sedátkem. Žádná stříška (ať to nečte jako bouda).          */
  private buildPlayground(el: ArchElement): void {
    this.buildSlide(el)
    this.buildSwing(el)
  }

  /* Skluzavka: otevřená plošina na 4 sloupcích, zábradlí, žebřík vzadu, skluz vpřed. */
  private buildSlide(el: ArchElement): void {
    const px = 4.05 // střed plošiny (pravé předzahradí)
    const pz = 4.2
    const fw = 0.95
    const fd = 0.95
    const post = 0.09
    const deckY = 1.0
    const railY = deckY + 0.5
    const x0 = px - fw / 2
    const x1 = px + fw / 2
    const z0 = pz - fd / 2 // zadní strana (žebřík)
    const z1 = pz + fd / 2 // přední strana (skluz)

    // 4 sloupky (až po zábradlí)
    for (const cx of [x0, x1]) {
      for (const cz of [z0, z1]) {
        el.addSolid(new THREE.BoxGeometry(post, railY, post).translate(cx, railY / 2, cz), {
          thin: true,
        })
      }
    }
    // plošina
    el.addSolid(new THREE.BoxGeometry(fw + post, 0.08, fd + post).translate(px, deckY, pz), {
      thin: true,
    })
    // zábradlí — zadní příčka + boční tyče (předek otevřený pro skluz)
    el.addSolid(new THREE.BoxGeometry(fw + post, 0.05, 0.05).translate(px, railY, z0), {
      thin: true,
    })
    for (const cx of [x0, x1]) {
      el.addSolid(new THREE.BoxGeometry(0.05, 0.05, fd + post).translate(cx, railY, pz), {
        thin: true,
      })
    }
    // žebřík: 3 příčle vzadu mezi sloupky
    for (let i = 1; i <= 3; i++) {
      el.addSolid(
        new THREE.BoxGeometry(fw - 0.06, 0.045, 0.045).translate(px, (i / 4) * deckY, z0),
        { thin: true }
      )
    }
    // skluz: koryto + dvě boční lišty, šikmo z plošiny vpřed k zemi
    const run = 1.4
    const ang = Math.atan2(deckY - 0.05, run * 0.9)
    const cz = z1 + run * 0.42
    const cy = deckY * 0.42
    const chute = new THREE.BoxGeometry(0.44, 0.05, run)
    chute.rotateX(ang)
    chute.translate(px, cy, cz)
    el.addSolid(chute, { thin: true })
    for (const sx of [-0.23, 0.23]) {
      const rail = new THREE.BoxGeometry(0.04, 0.13, run)
      rail.rotateX(ang)
      rail.translate(px + sx, cy + 0.07, cz)
      el.addSolid(rail, { thin: true })
    }
  }

  /* Houpačka: A-rámy po stranách, horní nosník, jedno sedátko na tyčkách. */
  private buildSwing(el: ArchElement): void {
    const px = 2.55 // vlevo od skluzavky (blíž k pergole)
    const pz = 4.35
    const h = 1.3
    const halfW = 0.55 // rozpětí nosníku (z)
    const legSpread = 0.42 // rozkročení A-rámu (x)
    const z0 = pz - halfW
    const z1 = pz + halfW

    // dva A-rámy (každý = dvě šikmé nohy sbíhající se k vrcholu)
    for (const cz of [z0, z1]) {
      for (const sx of [-legSpread, legSpread]) {
        const leg = new THREE.BoxGeometry(0.07, h + 0.12, 0.07)
        leg.rotateZ(Math.atan2(sx, h))
        leg.translate(px + sx / 2, h / 2, cz)
        el.addSolid(leg, { thin: true })
      }
    }
    // horní nosník
    el.addSolid(new THREE.BoxGeometry(0.08, 0.08, halfW * 2 + 0.1).translate(px, h, pz), {
      thin: true,
    })
    // sedátko + dvě závěsné tyčky
    const seatY = 0.5
    el.addSolid(new THREE.BoxGeometry(0.34, 0.05, 0.22).translate(px, seatY, pz), { thin: true })
    for (const cz of [pz - 0.16, pz + 0.16]) {
      el.addSolid(
        new THREE.BoxGeometry(0.03, h - seatY, 0.03).translate(px, (h + seatY) / 2, cz),
        { thin: true }
      )
    }
  }

  /* ---- Okna: InstancedMesh tabulí + obrysové rámy ------------------------- */
  private buildWindows(): void {
    const el = new ArchElement(null)
    const zFront = DIM.main.d / 2
    const positions: [number, number, number][] = [
      [-2.05, 1.65, zFront],
      [-0.6, 1.65, zFront],
      [2.0, 1.65, zFront],
    ]
    const winGeo = new THREE.BoxGeometry(1.0, 1.15, 0.09)
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xe9eaeb,
      roughness: 0.6,
      metalness: 0,
      emissive: new THREE.Color(COLORS.emissiveHover),
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0,
    })
    const inst = new THREE.InstancedMesh(winGeo, winMat, positions.length)
    inst.castShadow = true
    inst.receiveShadow = true
    const m = new THREE.Matrix4()
    positions.forEach((p, i) => {
      m.makeTranslation(p[0], p[1], p[2])
      inst.setMatrixAt(i, m)
    })
    inst.instanceMatrix.needsUpdate = true
    el.addObject(inst, winMat)

    // rámy jako fat-line obrysy (jeden box na okno)
    for (const p of positions) {
      el.addSolid(new THREE.BoxGeometry(1.0, 1.15, 0.09).translate(...p), {
        fill: false,
        thin: true,
      })
    }
    this.register(el)
  }

  /* ---- Vstup: dveře + jednoduchá stříška (dekor, mimo menu) --------------- */
  private buildEntrance(): void {
    const el = new ArchElement(null)
    const zFront = DIM.main.d / 2 + 0.02
    const cx = 0.95
    // dveře (dvě křídla → svislé dělení přes dva boxy)
    el.addSolid(new THREE.BoxGeometry(0.5, 2.2, 0.08).translate(cx - 0.27, 1.1, zFront), {
      thin: true,
    })
    el.addSolid(new THREE.BoxGeometry(0.5, 2.2, 0.08).translate(cx + 0.27, 1.1, zFront), {
      thin: true,
    })
    // stříška nad vstupem
    el.addSolid(
      new THREE.BoxGeometry(1.6, 0.12, 0.7).translate(cx, 2.45, zFront + 0.25)
    )
    this.register(el)
  }

  /* ---- Plaňkový plot okolo předzahrádky (tesařská práce) ------------------ */
  /*  Svislé plaňky + dvě vodorovné příčle po obvodu, s brankou vpředu u vstupu.
      Celý plot sloučíme do JEDNÉ geometrie (jeden mesh + jedny obrysy) — desítky
      planěk jinak zbytečně násobí draw-cally. menuId 'pergola' → rozsvítí se
      společně s Tesařstvím. Do `elements` ho ale NEregistrujeme, aby nepřepsal
      kotvu/spojnici pergoly. Viditelnost řídí SceneManager (jen desktop).        */
  private buildFence(): ArchElement {
    const el = new ArchElement('pergola', this.anchorOf('pergola'))
    const parts: THREE.BufferGeometry[] = []

    const H = 1.0 // výška plaňky
    const pw = 0.09 // šířka plaňky (podél plotu)
    const pt = 0.03 // tloušťka plaňky
    const pitch = 0.28 // rozteč planěk
    const railY = [0.34, 0.8] // výšky příčlí
    const railH = 0.06
    const railT = 0.05

    // Plot obepíná CELÝ pozemek — musí ležet VNĚ všeho ostatního: dům + přesah
    // střechy (±3.25), pergola (vlevo vpředu, z až 5.5) i dětská prolézačka
    // (vpravo vpředu, x až ~4.6, skluz z až ~5.8). Volíme obálku s rezervou ~0.65,
    // takže do žádného prvku nezasahuje.
    const xMin = -3.9
    const xMax = 5.3
    const zMin = -3.9
    const zMax = 6.5
    const gate: [number, number] = [0.1, 1.9] // branka vpředu (na ose vstupu)

    const picket = (x: number, z: number, along: 'x' | 'z') => {
      const g =
        along === 'x'
          ? new THREE.BoxGeometry(pw, H, pt)
          : new THREE.BoxGeometry(pt, H, pw)
      g.translate(x, H / 2, z)
      parts.push(g)
    }
    const run = (
      from: number,
      to: number,
      fixed: number,
      axis: 'x' | 'z',
      skip?: [number, number],
      stepOverride?: number
    ) => {
      const step = stepOverride ?? pitch
      for (let p = from; p <= to + 1e-6; p += step) {
        if (skip && p > skip[0] - 1e-6 && p < skip[1] + 1e-6) continue
        axis === 'x' ? picket(p, fixed, 'x') : picket(fixed, p, 'z')
      }
    }
    const rail = (x0: number, z0: number, x1: number, z1: number) => {
      const len = Math.hypot(x1 - x0, z1 - z0)
      const horizontal = Math.abs(x1 - x0) > Math.abs(z1 - z0)
      for (const y of railY) {
        const g = horizontal
          ? new THREE.BoxGeometry(len, railH, railT)
          : new THREE.BoxGeometry(railT, railH, len)
        g.translate((x0 + x1) / 2, y, (z0 + z1) / 2)
        parts.push(g)
      }
    }

    // Pravá strana je z výchozí kamery skoro čelem k pohledu (jde téměř podél
    // paprsku kamery) → planěk se opticky nakupí mnohem hustěji než na levé
    // straně, ač je rozteč stejná. Dáváme jí širší rozteč, aby po zvýraznění
    // (Tesařství) obě strany vypadaly opticky stejně husté.
    const pitchRight = pitch * 1.9

    run(xMin, xMax, zMax, 'x', gate) // přední (s brankou)
    run(xMin, xMax, zMin, 'x') // zadní
    run(zMin, zMax, xMin, 'z') // levá
    run(zMin, zMax, xMax, 'z', undefined, pitchRight) // pravá

    rail(xMin, zMax, gate[0], zMax) // přední vlevo od branky
    rail(gate[1], zMax, xMax, zMax) // přední vpravo od branky
    rail(xMin, zMin, xMax, zMin) // zadní
    rail(xMin, zMin, xMin, zMax) // levá
    rail(xMax, zMin, xMax, zMax) // pravá

    const merged = mergeGeometries(parts, false)
    parts.forEach((g) => g.dispose())
    el.addSolid(merged, { thin: true })

    this.all.push(el) // do render/hover/intro seznamu, ale NE do `elements`
    return el
  }

  /* ------------------------------------------------------------------------ */
  lineMaterials(): LineMaterial[] {
    const out: LineMaterial[] = []
    for (const el of this.all) el.collectLineMaterials(out)
    return out
  }

  update(dt: number): void {
    for (const el of this.all) el.update(dt)
  }

  dispose(): void {
    for (const el of this.all) el.dispose()
  }
}

/* Jediný trojúhelník jako BufferGeometry (štít). */
function triangle(
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number]
): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([...a, ...b, ...c], 3)
  )
  geo.setIndex([0, 1, 2])
  geo.computeVertexNormals()
  return geo
}
