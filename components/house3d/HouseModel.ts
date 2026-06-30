import * as THREE from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
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

  constructor() {
    this.root.name = 'house'
    this.buildFacade()
    this.buildRoof()
    this.buildGutters()
    this.buildPergola()
    this.buildWindows()
    this.buildGarage()
    this.buildEntrance()
    this.buildChimney()
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

    // garážové křídlo (zdi)
    const g = DIM.garage
    el.addSolid(
      new THREE.BoxGeometry(g.w, g.h, g.d).translate(w / 2 + g.w / 2, g.h / 2, d / 2 - g.d / 2)
    )

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
    this.register(el)
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
    this.register(el)
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

  /* ---- Garáž: vrata jako stoh panelů (vodorovné dělení) ------------------- */
  private buildGarage(): void {
    const el = new ArchElement(null)
    const g = DIM.garage
    const cx = DIM.main.w / 2 + g.w / 2
    const zFront = DIM.main.d / 2 + 0.02
    const doorW = g.w - 0.5
    const doorH = 2.2
    const panels = 4
    const ph = doorH / panels
    for (let i = 0; i < panels; i++) {
      el.addSolid(
        new THREE.BoxGeometry(doorW, ph - 0.02, 0.08).translate(cx, ph / 2 + i * ph, zFront),
        { thin: true }
      )
    }
    this.register(el)
  }

  /* ---- Vstup: dveře + jednoduchá stříška ---------------------------------- */
  private buildEntrance(): void {
    const el = new ArchElement('entrance', this.anchorOf('entrance'))
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

  /* ---- Komín (dekor, mimo menu) ------------------------------------------ */
  private buildChimney(): void {
    const el = new ArchElement(null)
    el.addSolid(new THREE.BoxGeometry(0.5, 1.7, 0.5).translate(1.65, 4.95, -0.4))
    this.register(el)
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
