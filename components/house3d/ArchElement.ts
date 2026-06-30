import * as THREE from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { COLORS, LINE, type MenuId } from './config'

/* -------------------------------------------------------------------------- */
/*  ArchElement — jedna highlightovatelná část domu                            */
/*                                                                             */
/*  Drží THREE.Group s výplňovými meshi (jemné stínování) + „fat line" obrysy   */
/*  (CAD hidden-line vzhled). Hover plynule lerpuje tloušťku čar, barvu a jas. */
/* -------------------------------------------------------------------------- */

interface SolidOptions {
  /** Práh úhlu pro EdgesGeometry (° — vyšší = méně čar). */
  edgeAngle?: number
  /** Tenčí tahy pro drobné prvky. */
  thin?: boolean
  /** Vykreslit výplň (některé prvky jsou jen čáry). */
  fill?: boolean
  /** Oboustranná výplň (např. štítové trojúhelníky). */
  doubleSide?: boolean
  castShadow?: boolean
  receiveShadow?: boolean
}

export class ArchElement {
  readonly menuId: MenuId | null
  readonly group = new THREE.Group()
  readonly anchor = new THREE.Vector3()

  private faceMats: THREE.MeshStandardMaterial[] = []
  private lineMats: LineMaterial[] = []
  private lineBaseW: number[] = []

  /** highlight: 0 = klid, 1 = aktivní. */
  private hl = 0
  private hlTarget = 0

  constructor(menuId: MenuId | null, anchor?: [number, number, number]) {
    this.menuId = menuId
    this.group.name = menuId ?? 'decor'
    if (anchor) this.anchor.set(...anchor)
    if (menuId) this.group.userData.menuId = menuId
  }

  /** Přidá těleso: výplňový mesh + obrysové fat-line hrany. */
  addSolid(geometry: THREE.BufferGeometry, opts: SolidOptions = {}): this {
    const {
      edgeAngle = 1,
      thin = false,
      fill = true,
      doubleSide = false,
      castShadow = true,
      receiveShadow = true,
    } = opts

    if (fill) {
      const faceMat = new THREE.MeshStandardMaterial({
        color: COLORS.face,
        roughness: 0.92,
        metalness: 0,
        emissive: new THREE.Color(COLORS.emissiveHover),
        emissiveIntensity: 0,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
        side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
        transparent: true,
        opacity: 0,
      })
      const mesh = new THREE.Mesh(geometry, faceMat)
      mesh.castShadow = castShadow
      mesh.receiveShadow = receiveShadow
      if (this.menuId) mesh.userData.menuId = this.menuId
      this.group.add(mesh)
      this.faceMats.push(faceMat)
    }

    const edges = new THREE.EdgesGeometry(geometry, edgeAngle)
    const lineGeo = new LineSegmentsGeometry().fromEdgesGeometry(edges)
    const baseW = thin ? LINE.widthThin : LINE.width
    const lineMat = new LineMaterial({
      color: COLORS.line,
      linewidth: baseW,
      worldUnits: false,
      alphaToCoverage: true,
      dashed: false,
      transparent: true,
      opacity: 0,
    })
    const seg = new LineSegments2(lineGeo, lineMat)
    seg.computeLineDistances()
    seg.renderOrder = 1
    this.group.add(seg)
    this.lineMats.push(lineMat)
    this.lineBaseW.push(baseW)
    edges.dispose()
    return this
  }

  /** Přidá hotový THREE.Object3D (např. InstancedMesh oken). */
  addObject(obj: THREE.Object3D, faceMat?: THREE.MeshStandardMaterial): this {
    if (this.menuId) obj.userData.menuId = this.menuId
    this.group.add(obj)
    if (faceMat) this.faceMats.push(faceMat)
    return this
  }

  /** Zaregistruje materiály fat-line pro update rozlišení (resize). */
  collectLineMaterials(out: LineMaterial[]): void {
    out.push(...this.lineMats)
  }

  setHighlight(active: boolean): void {
    this.hlTarget = active ? 1 : 0
  }

  /** Úvodní „vykreslení": obrysy vedou, výplň je dotahuje. p ∈ ⟨0,1⟩. */
  setReveal(p: number): void {
    const lp = Math.min(1, p * 1.25) // čáry mírně napřed
    const fp = Math.max(0, (p - 0.2) / 0.8) // výplň s drobným zpožděním
    for (const m of this.lineMats) m.opacity = lp
    for (const m of this.faceMats) m.opacity = fp
  }

  /** Dokončí intro: plná krytí + zpět na opaque (ostré čáry, žádné řazení). */
  revealComplete(): void {
    for (const m of this.lineMats) {
      m.opacity = 1
      m.transparent = false
      m.needsUpdate = true
    }
    for (const m of this.faceMats) {
      m.opacity = 1
      m.transparent = false
      m.needsUpdate = true
    }
  }

  /** Plynulé tlumení highlightu (volat v render-loopu). */
  update(dt: number): void {
    const speed = 8
    this.hl += (this.hlTarget - this.hl) * Math.min(1, dt * speed)
    if (Math.abs(this.hl - this.hlTarget) < 0.001) this.hl = this.hlTarget

    const t = this.hl
    const lineCol = _c1.setHex(COLORS.line).lerp(_c2.setHex(COLORS.lineHover), t)
    for (let i = 0; i < this.lineMats.length; i++) {
      const m = this.lineMats[i]
      m.linewidth = this.lineBaseW[i] + (LINE.widthHover - this.lineBaseW[i]) * t
      m.color.copy(lineCol)
    }
    const faceCol = _c3.setHex(COLORS.face).lerp(_c4.setHex(COLORS.faceHover), t)
    for (const m of this.faceMats) {
      m.color.copy(faceCol)
      m.emissiveIntensity = 0.32 * t
    }
  }

  /** Kotva v world-space (po aplikaci transformací rodiče). */
  worldAnchor(out: THREE.Vector3): THREE.Vector3 {
    return out.copy(this.anchor).applyMatrix4(this.group.matrixWorld)
  }

  dispose(): void {
    this.group.traverse((o) => {
      const any = o as unknown as { geometry?: THREE.BufferGeometry }
      any.geometry?.dispose?.()
    })
    this.faceMats.forEach((m) => m.dispose())
    this.lineMats.forEach((m) => m.dispose())
  }
}

const _c1 = new THREE.Color()
const _c2 = new THREE.Color()
const _c3 = new THREE.Color()
const _c4 = new THREE.Color()
