import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ArchElement } from './ArchElement'
import { HouseModel } from './HouseModel'
import { MenuOverlay, type ProjectedAnchor, type MenuLabelText } from './MenuOverlay'
import { CAMERA, COLORS, MENU, type MenuId } from './config'

/* -------------------------------------------------------------------------- */
/*  SceneManager — renderer, kamera, světla, smyčka, interakce                 */
/*                                                                             */
/*  Vlastní celý životní cyklus 3D scény: postaví dům, nasvítí ho měkkým        */
/*  stínem, omezí OrbitControls do „skoro statického" rozsahu, drží pomalou     */
/*  idle animaci a každý rámec promítá kotvy prvků pro MenuOverlay.             */
/* -------------------------------------------------------------------------- */

const DEG = Math.PI / 180
const WORLD_UP = new THREE.Vector3(0, 1, 0)

/** Vrátí všech 8 rohů Box3 jako Vector3 (pro `fitDistance` - viz tam). Sdílená
    pomocná funkce, protože `measureHouse` teď měří DVĚ verze boxu (s plotem
    i bez něj), ne jednu. */
function boxCorners(box: THREE.Box3): THREE.Vector3[] {
  const { min, max } = box
  return [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ]
}

/* Rezerva kolem domu při „fitu" do viewportu. `fitDistance` teď počítá PŘESNOU
   vzdálenost, na kterou se dům celý (všech 8 rohů jeho skutečného Box3) vejde
   do frustumu - viz níže. Tahle konstanta je proto čistý násobitel „vzduchu
   kolem kresby": 1.0 = Box3 přesně na hraně rámu (edge-to-edge, nic navíc),
   1.3 = kolem BOXU je navíc ~30 % vzdálenosti prostoru. Není to už (jako dřív)
   kompenzace za podhodnocený odhad rozměrů - odhad je pryč, fit je exaktní.

   POZOR na rozdíl mezi „box na hraně rámu" a „kresba vyplňuje rám": Box3 je
   osově zarovnaný (world-space X/Y/Z), ale kamera je natočená šikmo (azimuth/
   elevation v CAMERA) - jeho 8 rohů jsou matematické kombinace min/max, skoro
   nikdy ne skutečné body domu. Při pohledu zešikma proto i margin=1.0 (box
   přesně na hraně) nechá kolem SKUTEČNÉ kresby čitelnou mezeru - u tohohle
   domu (viz `measureHouse`) naměřeno cca 55-57 % šířky/výšky vrstvy při
   margin=1.0 u dekorace, ne 100 %. Menší margin sice kresbu zvětší, ale POD
   1.0 garantovaně ořízne (viz komentář u `fitDistance`) - proto se margin pro
   DECOR ladí NAD 1.0, empiricky proti naměřenému ink-fill (Playwright +
   ořez pozadí), ne proti nominálnímu významu „1.0 = 100 % rámu".

   Tři různé hodnoty podle toho, co ten vzduch spotřebuje:
   - FIT_MARGIN_SOLO: samostatný /nahled-3d, jen tenký okraj, ať dům zabírá
     co nejvíc rámu.
   - FIT_MARGIN_HERO: transparentní A interaktivní varianta (menu labely by
     bydlely v pevných sloupcích u kraje - dnes nepoužito, ale rezervováno).
   - FIT_MARGIN_DECOR: dekorativní hero dům (`interactive === false`,
     OpenerHouse) - žádné labely, žádný overlay. Stejná hodnota jako SOLO -
     bez plotu v boxu (viz `selectHouseGeometry`) je „o kousek víc než SOLO"
     zbytečné, dům smí zabrat rámu stejně tolik. Menší než 1.08 (zkoušeno
     1.03/0.68 při ladění) buď ořízlo pergolu/vstup, nebo nedalo žádnou
     rezervu na antialiasing tlustých čar (`LineMaterial`) při změně velikosti
     canvasu mezi šířkami.
   Pořadí konstant je: interaktivita (SOLO/HERO) > co je vlastně dekorace
   (DECOR) - viz `this.fitMargin` v konstruktoru. */
const FIT_MARGIN_HERO = 1.55
const FIT_MARGIN_SOLO = 1.08
const FIT_MARGIN_DECOR = 1.08

export interface SceneOptions {
  onMenuSelect: (id: MenuId) => void
  /** Přeložené texty menu labelů (service/element) — přichází z React vrstvy. */
  labels: Record<MenuId, MenuLabelText>
  /** Průhledné pozadí (scéna „leží" na papírovém panelu za canvasem). */
  transparent?: boolean
  /** Přehrát úvodní „vykreslení"? Při false se dům rovnou plně vykreslí. */
  playIntro?: boolean
  /** Zavolá se po dokončení úvodního vykreslení (intro „spotřebováno"). */
  onIntroDone?: () => void
  /** Interaktivní menu (hover/klik/OrbitControls)? Default true - /nahled-3d.
      false = čistě dekorativní dům (hero): žádný overlay, žádné pointer
      listenery, žádný raycast v render smyčce, OrbitControls vypnuté. */
  interactive?: boolean
}

export class SceneManager {
  private container: HTMLElement
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private house = new HouseModel()
  // Overlay existuje jen v interaktivním režimu (viz `interactive`) - dekorativní
  // hero dům žádné menu nezobrazuje, takže se ani nevytváří. Všechna volání
  // proto jdou přes `?.` - NE prázdnou atrapou overlaye.
  private overlay?: MenuOverlay
  private interactive = true
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

  private fitMargin = FIT_MARGIN_SOLO

  // Skutečné hranice domu (world-space Box3 z `house.root`) — měřené DVAKRÁT
  // v konstruktoru (viz `measureHouse`), ne každý frame: jednou VČETNĚ plotu,
  // jednou BEZ něj. Plot totiž bývá skrytý (`house.fence.group.visible`,
  // viz `resize()`, `w > 768`) a `Box3.setFromObject` viditelnost IGNORUJE
  // (ověřeno testem na three 0.185.0 - schovaný objekt box stejně nafoukne,
  // zdroj `expandByObject` netestuje `object.visible` vůbec) - fit na skrytou
  // geometrii je přesně to, co dělalo dekorativní hero dům malým a mimo
  // střed. `houseCenter`/`houseCorners` = AKTUÁLNÍ výběr z dvojice níž,
  // přepočítá ho `selectHouseGeometry()` podle právě nastavené viditelnosti
  // plotu - `fitDistance` i cíl OrbitControls tak vždy čtou ZE STEJNÉHO boxu.
  private houseBoxFull = new THREE.Box3()
  private houseCenterFull = new THREE.Vector3()
  private houseCornersFull: THREE.Vector3[] = []
  private houseBoxNoFence = new THREE.Box3()
  private houseCenterNoFence = new THREE.Vector3()
  private houseCornersNoFence: THREE.Vector3[] = []

  private houseCenter = new THREE.Vector3()
  private houseCorners: THREE.Vector3[] = []

  private lineMats = this.house.lineMaterials()
  private baseFov = CAMERA.fov
  private dirBase = new THREE.Vector3(6.5, 12, 7.5)
  private raf = 0
  private resizeObs: ResizeObserver
  private disposed = false
  private reducedMotionMQ: MediaQueryList | null = null
  private reducedMotion = false

  // reusable temporaries
  private _v = new THREE.Vector3()
  private _anchors = new Map<MenuId, ProjectedAnchor>()

  constructor(container: HTMLElement, opts: SceneOptions) {
    // `this.house` je postavený už jako inicializátor pole (běží před tělem
    // konstruktoru), takže jeho geometrie tu už existuje - měř hned, než
    // cokoliv dalšího (kamera, controls) potřebuje střed/rozměry domu.
    this.measureHouse()

    this.container = container
    this.onSelect = opts.onMenuSelect
    this.transparent = opts.transparent ?? false
    this.introActive = opts.playIntro !== false
    this.onIntroDone = opts.onIntroDone
    this.interactive = opts.interactive ?? true
    // Dekorativní dům (žádné menu, žádný overlay) má vlastní - menší - rezervu
    // (FIT_MARGIN_DECOR), protože rezerva HERO je propočítaná na labely,
    // které tu nejsou. Zbylé dvě větve beze změny: transparentní+interaktivní
    // (dnes nepoužito) chce menší dům + víc papíru na labely; samostatný
    // náhled (/nahled-3d) chce dům co největší.
    this.fitMargin = !this.interactive
      ? FIT_MARGIN_DECOR
      : this.transparent
        ? FIT_MARGIN_HERO
        : FIT_MARGIN_SOLO
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
    // Dekorativní režim: canvas nesmí chytat pointer eventy vůbec (dům je jen
    // kresba za textem, ne klikací plocha) - viz i pointer listenery níž.
    if (!this.interactive) this.renderer.domElement.style.pointerEvents = 'none'
    this.container.appendChild(this.renderer.domElement)

    // ---- camera ----
    this.camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 100)
    this.placeCamera()

    // ---- controls (silně omezené) ----
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // Cíl kamery = skutečný střed domu (houseCenter), ne pevný CAMERA.target -
    // fixní bod byl jednou z příčin ořízlého domu (viz fitDistance výš).
    this.controls.target.copy(this.houseCenter)
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
    // Dekorativní (!interactive) dům ze stejného důvodu OrbitControls taky
    // nechce - a navíc na něm žádný raycast/klik vůbec neběží (viz níž).
    if (this.transparent || !this.interactive) {
      this.controls.enabled = false
      // OrbitControls v konstruktoru nastaví touchAction:'none' → i s enabled=false
      // by to na mobilu blokovalo svislý scroll po plátně. Vrátíme default.
      this.renderer.domElement.style.touchAction = 'auto'
    }

    this.setupLights()
    this.setupGround()
    this.scene.add(this.house.root)

    // ---- overlay ---- (jen v interaktivním režimu - dekorativní hero dům
    // žádné menu labely nemá, takže se overlay ani nezakládá)
    if (this.interactive) {
      this.overlay = new MenuOverlay(
        this.container,
        {
          onHover: (id) => this.setHover(id),
          onSelect: opts.onMenuSelect,
        },
        opts.labels
      )
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      this.reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)')
      this.reducedMotion = this.reducedMotionMQ.matches
      this.reducedMotionMQ.addEventListener('change', this.onReducedMotionChange)
    }

    this.prepareIntro()

    // ---- events ---- (dekorativní dům nereaguje na pointer vůbec - žádný
    // hover/klik/raycast, viz taky pointerEvents:'none' na canvasu výš)
    if (this.interactive) {
      this.renderer.domElement.addEventListener('pointermove', this.onPointerMove)
      this.renderer.domElement.addEventListener('pointerleave', this.onPointerLeave)
      this.renderer.domElement.addEventListener('click', this.onClick)
    }
    this.resizeObs = new ResizeObserver(() => this.resize())
    this.resizeObs.observe(this.container)

    this.resize()
    this.raf = requestAnimationFrame(this.tick)
  }

  /** Spočítá skutečné hranice domu (world-space Box3 z `house.root` - BEZ
      zemní roviny, ta žije samostatně přímo ve `scene`, ne pod `house.root`,
      viz `setupGround`) DVAKRÁT: jednou celý dům (plot obepíná CELÝ pozemek,
      viz komentář u `buildFence` v HouseModelu), jednou bez plotu. Voláno
      JEDNOU (konstruktor) - dům je po sestavení statická geometrie (intro
      mění jen opacity materiálů, ne vertexy), takže se cache nikdy
      neinvaliduje.

      Plot NEJDE vyloučit nastavením `visible = false` a pak změřit -
      `Box3.setFromObject` viditelnost ignoruje (ověřeno testem, three
      0.185.0: schovaný objekt daleko od zbytku geometrie box i tak nafoukl -
      zdroj `expandByObject` nikde netestuje `object.visible`). Plot proto na
      chvíli fyzicky vyjmeme ze stromu (`root.remove`/`root.add`), ne
      schováme - a vrátíme přesně na konec, jako při stavbě v HouseModelu
      (`buildFence` je poslední `this.all.push`, takže `root.add` pořadí
      dětí/render order nezmění). */
  private measureHouse(): void {
    this.houseBoxFull.setFromObject(this.house.root)
    this.houseBoxFull.getCenter(this.houseCenterFull)
    this.houseCornersFull = boxCorners(this.houseBoxFull)

    this.house.root.remove(this.house.fence.group)
    this.houseBoxNoFence.setFromObject(this.house.root)
    this.houseBoxNoFence.getCenter(this.houseCenterNoFence)
    this.houseCornersNoFence = boxCorners(this.houseBoxNoFence)
    this.house.root.add(this.house.fence.group)

    this.selectHouseGeometry()
  }

  /** Vybere z dvojice boxů předpočítaných v `measureHouse` ten, který
      odpovídá PRÁVĚ NASTAVENÉ viditelnosti plotu (`house.fence.group.visible`
      - `resize()` ji nastavuje TĚSNĚ PŘED voláním této metody, viz tam).
      `houseCenter`/`houseCorners` pak čtou `fitDistance` i cíl OrbitControls
      (`controls.target`), takže fit distance a cíl kamery vždycky sedí na
      STEJNOU geometrii - míchání dvou různých boxů mezi distance a targetem
      byla původní příčina malého/mimostředého domu v hero. */
  private selectHouseGeometry(): void {
    const withFence = this.house.fence.group.visible
    this.houseCenter.copy(withFence ? this.houseCenterFull : this.houseCenterNoFence)
    this.houseCorners = withFence ? this.houseCornersFull : this.houseCornersNoFence
  }

  /** Přesná vzdálenost kamery, na kterou se celý dům (všech 8 rohů jeho
      Box3) vejde do frustumu - žádný odhad poloviční šířky/výšky domu.

      Pro směr od středu domu ke kameře `e` (dopočítaný z azimuthDeg/
      elevationDeg) a jeho pravo/nahoru bázi `right`/`up` rozložíme offset
      každého rohu od středu na `f = v·e` (hloubka), `r = v·right`
      (vodorovně), `u = v·up` (svisle). Roh je uvnitř frustumu ve vzdálenosti
      `d`, když `|r| <= tanH·(d-f)` a `|u| <= tanV·(d-f)` (definice
      perspektivního frustumu), tj. `d >= f + |r|/tanH` a `d >= f + |u|/tanV`.
      `dW`/`dH` jsou maxima přes všechny rohy odděleně pro šířku/výšku -
      protože `f` je společné, `max(f+|r|/tanH, f+|u|/tanV) = f + max(...)`,
      takže `max(dW, dH)` je matematicky shodné s "jedním průchodem" přes obě
      podmínky najednou (algebraická identita, ne aproximace).
      PerspectiveCamera.fov je VERTIKÁLNÍ → tanH se dopočítá z aspectu. */
  private fitDistance(aspect: number): number {
    const tanV = Math.tan((this.baseFov * DEG) / 2)
    const tanH = tanV * aspect

    const az = CAMERA.azimuthDeg * DEG
    const el = CAMERA.elevationDeg * DEG
    const e = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az))
    const right = new THREE.Vector3().crossVectors(WORLD_UP, e).normalize()
    const up = new THREE.Vector3().crossVectors(e, right)

    let dW = 0
    let dH = 0
    const v = new THREE.Vector3()
    for (const corner of this.houseCorners) {
      v.subVectors(corner, this.houseCenter)
      const f = v.dot(e)
      const r = Math.abs(v.dot(right))
      const u = Math.abs(v.dot(up))
      dW = Math.max(dW, f + r / tanH)
      dH = Math.max(dH, f + u / tanV)
    }

    // Hero na úzkém (portrét/mobil) viewportu: labely jdou pod dům (viz overlay),
    // takže dům smí vyplnit ~90 % šířky → couvni jen podle šířky s malou rezervou.
    if (this.transparent && aspect < 0.85) {
      return Math.max(dW * 1.12, dH * 1.02)
    }
    return Math.max(dW, dH) * this.fitMargin // rezerva na labely + vzduch kolem
  }

  private placeCamera(): void {
    const az = CAMERA.azimuthDeg * DEG
    const el = CAMERA.elevationDeg * DEG
    const d = this.distance
    const t = this.houseCenter
    this.camera.position.set(
      t.x + d * Math.cos(el) * Math.sin(az),
      t.y + d * Math.sin(el),
      t.z + d * Math.cos(el) * Math.cos(az)
    )
    this.camera.lookAt(t)
  }

  private setupLights(): void {
    const hemi = new THREE.HemisphereLight(COLORS.white, COLORS.face, 2.1)
    this.scene.add(hemi)

    this.dirLight = new THREE.DirectionalLight(COLORS.white, 1.5)
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

    const amb = new THREE.AmbientLight(COLORS.white, 1.1)
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

  // Živá změna OS nastavení prefers-reduced-motion → jen přepíše cached hodnotu,
  // kterou tick() čte (žádné volání matchMedia v hot path).
  private onReducedMotionChange = (e: MediaQueryListEvent): void => {
    this.reducedMotion = e.matches
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
      // Raycaster netestuje `visible` → skrytý plot (mobil) by jinak byl klikací.
      let vis: THREE.Object3D | null = h.object
      let hidden = false
      while (vis) {
        if (vis.visible === false) {
          hidden = true
          break
        }
        vis = vis.parent
      }
      if (hidden) continue

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
    this.overlay?.setActive(id)
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
      this.overlay?.reveal()
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
      this.overlay?.reveal()
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

    // raycast hover jen v interaktivním režimu a když je kurzor nad plátnem —
    // jinak by každý rámec přepsal highlight nastavený hoverem labelu
    // (canvas→prvek vs label→prvek). Dekorativní dům raycast neplatí vůbec.
    if (this.interactive && this.pointerOnCanvas) this.setHover(this.pickHover())

    // idle: jemné vznášení domu / dýchání kamery / posun světla - jen bez reduced-motion.
    // this.reducedMotion je čtený z MediaQueryList vytvořeného JEDNOU v konstruktoru
    // (ne window.matchMedia() volaného každý frame - to by v hot path 60x/s zbytečně
    // alokovalo nový MediaQueryList). Živá změna OS nastavení se promítne přes
    // onReducedMotionChange (addEventListener('change', ...)), bez reloadu.
    if (!this.reducedMotion) {
      this.house.root.position.y = this.floatAmp * Math.sin(t * 0.6)
      this.camera.fov = this.baseFov + this.fovAmp * Math.sin(t * 0.25)
      this.camera.updateProjectionMatrix()
      this.dirLight.position.set(
        this.dirBase.x + 1.3 * Math.sin(t * 0.13),
        this.dirBase.y,
        this.dirBase.z + 1.1 * Math.cos(t * 0.11)
      )
    } else {
      this.house.root.position.y = 0
      this.camera.fov = this.baseFov
      this.camera.updateProjectionMatrix()
      this.dirLight.position.set(this.dirBase.x, this.dirBase.y, this.dirBase.z)
    }

    this.house.update(dt)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.projectAnchors()
    this.raf = requestAnimationFrame(this.tick)
  }

  private projectAnchors(): void {
    // Bez overlaye není co promítat (dekorativní dům nemá labely) - ušetři
    // projekci kotev každý rámec.
    if (!this.overlay) return
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

    // Plot se zobrazí, jen když je CANVAS (kontejner, `w` výš) širší než
    // 768px - POZOR, to je šířka canvasu, ne `window.innerWidth`/viewportu.
    // U interaktivního /nahled-3d se to prakticky kryje s "desktop": canvas
    // tam běží na celou šířku layoutu. Dekorativní hero canvas (OpenerHouse,
    // ~260-345px i na velkém monitoru, viz `clamp(260px,24vw,345px)`) je ale
    // VŽDY pod tímhle prahem bez ohledu na viewport - plot je tam tedy vždy
    // skrytý, a to je žádoucí (na 345px by byl vizuální šum). Scéna se staví
    // jednou, resize běží i při startu i při rotaci/změně velikosti → tady
    // je správné místo.
    this.house.fence.group.visible = w > 768

    // Box (a tedy i cíl kamery) MUSÍ odpovídat PRÁVĚ nastavené viditelnosti
    // plotu (viz `selectHouseGeometry`) - jinak by fit distance počítala s
    // jinou geometrií, než kam míří `controls.target`, a dům by byl malý
    // a/nebo mimo střed. Proto se volá TADY (po řádku výš), ne jen jednou
    // v konstruktoru - i canvas, který během života přejde přes 768px práh
    // (resize okna, ne jen initial mount), se tak přerámuje správně.
    this.selectHouseGeometry()
    this.controls.target.copy(this.houseCenter)

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
    if (this.interactive) {
      this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove)
      this.renderer.domElement.removeEventListener('pointerleave', this.onPointerLeave)
      this.renderer.domElement.removeEventListener('click', this.onClick)
    }
    this.reducedMotionMQ?.removeEventListener('change', this.onReducedMotionChange)
    this.controls.dispose()
    this.overlay?.dispose()
    this.house.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
