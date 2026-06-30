import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ArchElement } from './ArchElement'
import { HouseModel } from './HouseModel'
import { MenuOverlay, type ProjectedAnchor } from './MenuOverlay'
import { CAMERA, COLORS, MENU, type MenuId } from './config'

/* -------------------------------------------------------------------------- */
/*  SceneManager — renderer, kamera, světla, smyčka, interakce                 */
/*                                                                             */
/*  Vlastní celý životní cyklus 3D scény: postaví dům, nasvítí ho měkkým        */
/*  stínem, omezí OrbitControls do „skoro statického" rozsahu, drží pomalou     */
/*  idle animaci a každý rámec promítá kotvy prvků pro MenuOverlay.             */
/* -------------------------------------------------------------------------- */

const DEG = Math.PI / 180

export interface SceneOptions {
  onMenuSelect: (id: MenuId) => void
  /** Průhledné pozadí (scéna „leží" na papírovém panelu za canvasem). */
  transparent?: boolean
  /** Přehrát úvodní „vykreslení"? Při false se dům rovnou plně vykreslí. */
  playIntro?: boolean
  /** Zavolá se po dokončení úvodního vykreslení (intro „spotřebováno"). */
  onIntroDone?: () => void
}

export class SceneManager {
  private container: HTMLElement
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private house = new HouseModel()
  private overlay: MenuOverlay
  private onSelect: (id: MenuId) => void
  private dirLight!: THREE.DirectionalLight
  private groundMat!: THREE.ShadowMaterial
  private clock = new THREE.Clock()

  // úvodní „vykreslení" domu (čáry se rozkreslí zdola nahoru, pak naskočí labely)
  private introActive = true
  private introT = 0
  private readonly introDur = 1.7
  private readonly introSpan = 0.5 // jak dlouho se rozkresluje jeden prvek
  private introSteps: { el: ArchElement; start: number }[] = []
  private onIntroDone?: () => void

  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2(-2, -2)
  private pointerOnCanvas = false
  private hovered: MenuId | null = null
  private distance: number = CAMERA.distance
  private transparent = false
  // amplitudy idle animace (na papíru tlumené, ať „kresba" nepoletuje)
  private floatAmp = 0.05
  private fovAmp = 0.4

  private lineMats = this.house.lineMaterials()
  private baseFov = CAMERA.fov
  private dirBase = new THREE.Vector3(6.5, 12, 7.5)
  private raf = 0
  private resizeObs: ResizeObserver
  private disposed = false

  // reusable temporaries
  private _v = new THREE.Vector3()
  private _anchors = new Map<MenuId, ProjectedAnchor>()

  constructor(container: HTMLElement, opts: SceneOptions) {
    this.container = container
    this.onSelect = opts.onMenuSelect
    this.transparent = opts.transparent ?? false
    this.introActive = opts.playIntro !== false
    this.onIntroDone = opts.onIntroDone
    if (this.transparent) {
      this.floatAmp = 0.012
      this.fovAmp = 0.12
    } else {
      this.scene.background = new THREE.Color(COLORS.background)
    }

    // ---- renderer ----
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: this.transparent })
    if (this.transparent) this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.domElement.style.display = 'block'
    this.container.appendChild(this.renderer.domElement)

    // ---- camera ----
    this.camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 100)
    this.placeCamera()

    // ---- controls (silně omezené) ----
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(...CAMERA.target)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.enablePan = false
    this.controls.rotateSpeed = 0.4
    this.controls.zoomSpeed = 0.5
    const polar = (90 - CAMERA.elevationDeg) * DEG
    this.controls.minPolarAngle = polar - CAMERA.polarRangeDeg * DEG
    this.controls.maxPolarAngle = polar + CAMERA.polarRangeDeg * DEG
    const az = CAMERA.azimuthDeg * DEG
    this.controls.minAzimuthAngle = az - CAMERA.azimuthRangeDeg * DEG
    this.controls.maxAzimuthAngle = az + CAMERA.azimuthRangeDeg * DEG
    this.controls.minDistance = CAMERA.distance * CAMERA.zoomRange[0]
    this.controls.maxDistance = CAMERA.distance * CAMERA.zoomRange[1]
    this.controls.update()

    // Hero varianta je řízená scrollem: OrbitControls nesmí pohltit wheel ani
    // touch (jinak zoom sní scroll stránky a po dojetí na maxDistance scroll
    // „umře"). Hover labelů i klik-navigace jedou přes vlastní raycast, takže
    // o interaktivitu nepřijdeme. V samostatném /nahled-3d controls zůstávají.
    if (this.transparent) {
      this.controls.enabled = false
      // OrbitControls v konstruktoru nastaví touchAction:'none' → i s enabled=false
      // by to na mobilu blokovalo svislý scroll po plátně. Vrátíme default.
      this.renderer.domElement.style.touchAction = 'auto'
    }

    this.setupLights()
    this.setupGround()
    this.scene.add(this.house.root)

    // ---- overlay ----
    this.overlay = new MenuOverlay(this.container, {
      onHover: (id) => this.setHover(id),
      onSelect: opts.onMenuSelect,
    })

    this.prepareIntro()

    // ---- events ----
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove)
    this.renderer.domElement.addEventListener('pointerleave', this.onPointerLeave)
    this.renderer.domElement.addEventListener('click', this.onClick)
    this.resizeObs = new ResizeObserver(() => this.resize())
    this.resizeObs.observe(this.container)

    this.resize()
    this.raf = requestAnimationFrame(this.tick)
  }

  /** Vzdálenost kamery tak, aby se celý dům vešel i na úzký (portrét) viewport.
      PerspectiveCamera.fov je VERTIKÁLNÍ → na úzké obrazovce se horizontální FOV
      zmenší, proto musíme couvnout. */
  private fitDistance(aspect: number): number {
    const tanV = Math.tan((this.baseFov * DEG) / 2)
    const halfW = 5.4 // poloviční šířka domu (vč. garáže/přesahů)
    const halfH = 3.3 // poloviční výška (od země po hřeben + rezerva)
    const dW = halfW / (tanV * aspect)
    const dH = halfH / tanV
    return Math.max(dW, dH) * 1.5 // rezerva na labely kolem domu
  }

  private placeCamera(): void {
    const az = CAMERA.azimuthDeg * DEG
    const el = CAMERA.elevationDeg * DEG
    const d = this.distance
    const t = new THREE.Vector3(...CAMERA.target)
    this.camera.position.set(
      t.x + d * Math.cos(el) * Math.sin(az),
      t.y + d * Math.sin(el),
      t.z + d * Math.cos(el) * Math.cos(az)
    )
    this.camera.lookAt(t)
  }

  private setupLights(): void {
    const hemi = new THREE.HemisphereLight(0xffffff, 0xe6e4de, 2.1)
    this.scene.add(hemi)

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
    this.dirLight.position.copy(this.dirBase)
    this.dirLight.castShadow = true
    this.dirLight.shadow.mapSize.set(2048, 2048)
    this.dirLight.shadow.camera.near = 0.5
    this.dirLight.shadow.camera.far = 45
    const s = 11
    const cam = this.dirLight.shadow.camera
    cam.left = -s
    cam.right = s
    cam.top = s
    cam.bottom = -s
    cam.updateProjectionMatrix()
    this.dirLight.shadow.bias = -0.0004
    this.dirLight.shadow.normalBias = 0.02
    this.dirLight.shadow.radius = 6
    this.scene.add(this.dirLight)
    this.scene.add(this.dirLight.target)

    const amb = new THREE.AmbientLight(0xffffff, 1.1)
    this.scene.add(amb)
  }

  private setupGround(): void {
    const geo = new THREE.PlaneGeometry(80, 80)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.ShadowMaterial({ opacity: 0.09 })
    this.groundMat = mat
    const ground = new THREE.Mesh(geo, mat)
    ground.receiveShadow = true
    ground.position.y = 0
    this.scene.add(ground)
  }

  /* ---- interakce ---------------------------------------------------------- */
  private onPointerMove = (e: PointerEvent): void => {
    const r = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    )
    this.pointerOnCanvas = true
  }

  // Kurzor opustil plátno (typicky najel na label) → vypni raycast a nech
  // highlight na labelu. Pořadí DOM eventů: canvas pointerleave → label
  // pointerenter, takže label hover přežije.
  private onPointerLeave = (): void => {
    this.pointer.set(-2, -2)
    this.pointerOnCanvas = false
    this.setHover(null)
  }

  // Klik přímo na část domu → stejná akce jako klik na label.
  private onClick = (e: MouseEvent): void => {
    const r = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    )
    const id = this.pickHover()
    if (id) this.onSelect(id)
  }

  private pickHover(): MenuId | null {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObject(this.house.root, true)
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object
      while (o) {
        const id = o.userData?.menuId as MenuId | undefined
        if (id) return id
        o = o.parent
      }
    }
    return null
  }

  setHover(id: MenuId | null): void {
    if (this.hovered === id) return
    this.hovered = id
    // POZOR: id===null nesmí rozsvítit dekor (menuId===null) — fasáda, okna,
    // garáž. Highlight jen když je id konkrétní a sedí na prvek.
    for (const el of this.house.all) el.setHighlight(id !== null && el.menuId === id)
    this.overlay.setActive(id)
    this.container.style.cursor = id ? 'pointer' : ''
  }

  /* ---- úvodní vykreslení -------------------------------------------------- */
  // Seřadí prvky zdola nahoru (dle výšky) a každému přidělí start v časové ose,
  // takže se dům „rozkreslí" od základů ke hřebenu. Respektuje reduced-motion.
  private prepareIntro(): void {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // Přeskočit intro: reduced-motion, nebo už bylo přehráno (playIntro=false
    // při návratu na landing). Dům rovnou plně vykreslíme.
    if (reduced || !this.introActive) {
      for (const el of this.house.all) el.revealComplete()
      this.groundMat.opacity = 0.09
      this.overlay.reveal()
      this.introActive = false
      return
    }

    const box = new THREE.Box3()
    const rows = this.house.all.map((el) => {
      box.setFromObject(el.group)
      return { el, cy: (box.min.y + box.max.y) / 2 }
    })
    const ys = rows.map((r) => r.cy)
    const minY = Math.min(...ys)
    const span = Math.max(0.001, Math.max(...ys) - minY)
    this.introSteps = rows.map((r) => ({
      el: r.el,
      start: ((r.cy - minY) / span) * (1 - this.introSpan), // start ∈ ⟨0, 0.5⟩
    }))

    for (const el of this.house.all) el.setReveal(0)
    this.groundMat.opacity = 0
  }

  private updateIntro(dt: number): void {
    this.introT = Math.min(1, this.introT + dt / this.introDur)
    const t = this.introT
    for (const s of this.introSteps) {
      const p = Math.min(1, Math.max(0, (t - s.start) / this.introSpan))
      s.el.setReveal(1 - Math.pow(1 - p, 3)) // easeOutCubic
    }
    // stín naskočí až s dokreslenou hmotou
    this.groundMat.opacity = 0.09 * Math.min(1, Math.max(0, (t - 0.45) / 0.55))

    if (t >= 1) {
      for (const el of this.house.all) el.revealComplete()
      this.groundMat.opacity = 0.09
      this.overlay.reveal()
      this.introActive = false
      // Intro „spotřebováno" — návrat na landing už dům vykreslí rovnou.
      this.onIntroDone?.()
    }
  }

  /* ---- smyčka ------------------------------------------------------------- */
  private tick = (): void => {
    if (this.disposed) return
    const dt = Math.min(this.clock.getDelta(), 0.05)
    const t = this.clock.elapsedTime

    if (this.introActive) this.updateIntro(dt)

    // raycast hover jen když je kurzor nad plátnem — jinak by každý rámec
    // přepsal highlight nastavený hoverem labelu (canvas→prvek vs label→prvek)
    if (this.pointerOnCanvas) this.setHover(this.pickHover())

    // idle: jemné vznášení domu
    this.house.root.position.y = this.floatAmp * Math.sin(t * 0.6)

    // idle: dýchání kamery (fov)
    this.camera.fov = this.baseFov + this.fovAmp * Math.sin(t * 0.25)
    this.camera.updateProjectionMatrix()

    // idle: pohyb světla → měkký posun stínu
    this.dirLight.position.set(
      this.dirBase.x + 1.3 * Math.sin(t * 0.13),
      this.dirBase.y,
      this.dirBase.z + 1.1 * Math.cos(t * 0.11)
    )

    this.house.update(dt)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.projectAnchors()
    this.raf = requestAnimationFrame(this.tick)
  }

  private projectAnchors(): void {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    for (const item of MENU) {
      const el = this.house.elements.get(item.id)
      if (!el) continue
      el.worldAnchor(this._v)
      this._v.project(this.camera)
      const visible = this._v.z < 1
      this._anchors.set(item.id, {
        x: (this._v.x * 0.5 + 0.5) * w,
        y: (-this._v.y * 0.5 + 0.5) * h,
        visible,
      })
    }
    this.overlay.layout({ w, h }, this._anchors)
  }

  /* ---- resize ------------------------------------------------------------- */
  private resize(): void {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    // POZOR: bez updateStyle (3. arg) by se na retina (dpr>1) plátno
    // vykreslilo v intrinsic px → ~2× větší než kontejner a dům „uteče" z výřezu.
    this.renderer.setSize(w, h)
    const dpr = Math.min(window.devicePixelRatio, 2)
    this.renderer.setPixelRatio(dpr)
    for (const m of this.lineMats) m.resolution.set(w, h)

    // přepočítej fit-vzdálenost a limity zoomu pro nový poměr stran
    this.distance = this.fitDistance(w / h)
    this.controls.minDistance = this.distance * CAMERA.zoomRange[0]
    this.controls.maxDistance = this.distance * CAMERA.zoomRange[1]
    this.placeCamera()
    this.controls.update()
  }

  /* ---- úklid -------------------------------------------------------------- */
  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.resizeObs.disconnect()
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.renderer.domElement.removeEventListener('pointerleave', this.onPointerLeave)
    this.renderer.domElement.removeEventListener('click', this.onClick)
    this.controls.dispose()
    this.overlay.dispose()
    this.house.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
