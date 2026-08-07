import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
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

/** Offset jednoho vrcholu od (rekentrovaného) středu siluety, v kamerové bázi
    (viz `cameraBasis`): `f` = hloubka podél `e` (směr od středu ke kameře),
    `r`/`u` = vodorovně/svisle. `fitDistance` z nich čte přímo, žádné dot
    producty za běhu resize - viz `measureSilhouette`. */
interface AxisOffset {
  f: number
  r: number
  u: number
}

/** Pevná kamerová báze - `e` (směr od domu ke kameře), `right`, `up`. Závisí
    jen na `CAMERA.azimuthDeg`/`elevationDeg` (konstanty), ne na rozměrech
    domu ani poměru stran canvasu, takže se počítá jednou v `measureHouse`
    a sdílí mezi FULL/NO_FENCE měřením - ne přepočítávat při každém `resize()`
    (jako to dělal starý `fitDistance` s AABB rohy). */
function cameraBasis(): { e: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 } {
  const az = CAMERA.azimuthDeg * DEG
  const el = CAMERA.elevationDeg * DEG
  const e = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az))
  const right = new THREE.Vector3().crossVectors(WORLD_UP, e).normalize()
  const up = new THREE.Vector3().crossVectors(e, right)
  return { e, right, up }
}

/** Posbírá SKUTEČNÉ world-space koncové body všech fat-line obrysů
    (`LineSegments2`) pod `root` - to je vizuálně přesně to, co se kreslí
    (viz komentář u FIT_MARGIN níž, proč to NENÍ totéž co Box3 8 rohů).
    Každé `ArchElement.addSolid()` staví `LineSegments2` z `EdgesGeometry`
    PŮVODNÍHO tělesa (`fromEdgesGeometry` kopíruje `position.array` 1:1 -
    žádná interpolace), takže hrany nesou přesně rohy původních těles. Prvky
    bez výplně (rámy oken, `fill:false` v `HouseModel.buildWindows`) mají JEN
    `LineSegments2`, žádný Mesh - kdybychom sbírali vrcholy jen z Meshů,
    o tyhle rámy (a tím o kus skutečného obrysu domu) bychom přišli.
    `instanceStart`/`instanceEnd` jsou surové LOKÁLNÍ xyz
    (`LineSegmentsGeometry.setPositions`), proto `matrixWorld` (a
    `updateWorldMatrix(true, true)` PŘED čtením - `true` u druhého argumentu,
    ať se aktualizují i potomci, ne jen `root` sám). */
function collectLineVertices(root: THREE.Object3D): THREE.Vector3[] {
  root.updateWorldMatrix(true, true)
  const out: THREE.Vector3[] = []
  const v = new THREE.Vector3()
  root.traverse((obj) => {
    if (!(obj instanceof LineSegments2)) return
    const geo = obj.geometry
    const start = geo.attributes.instanceStart
    const end = geo.attributes.instanceEnd
    if (!start || !end) return
    for (let i = 0; i < start.count; i++) {
      out.push(v.fromBufferAttribute(start, i).applyMatrix4(obj.matrixWorld).clone())
      out.push(v.fromBufferAttribute(end, i).applyMatrix4(obj.matrixWorld).clone())
    }
  })
  return out
}

/** Najde `mid`, pro které je „nejhorší" bod VLEVO od `mid` (v posunuté ose
    `x`) stejně daleko (v jednotkách couvnuté vzdálenosti) jako „nejhorší" bod
    VPRAVO - tj. řeší `left(mid) == right(mid)`, kde `left`/`right` jsou
    maxima `f + |x-mid|/scale` přes body na dané straně. `left(mid)` roste
    s `mid` (body vlevo jsou „dál"), `right(mid)` s `mid` klesá → rozdíl je
    ryze monotónní, bisekce má jediný kořen. Proč tohle NENÍ jen prostý
    `(min+max)/2` (viz `measureSilhouette`): `f` (hloubka) se liší bod od
    bodu, a bod blíž kameře (větší `f`) „dosáhne" na obrazovce dál za stejné
    `|x-mid|` než vzdálenější bod - prostý midpoint syrového rozsahu `x` proto
    obrazovkové okraje nevyrovná, pokud jsou levé/pravé (nebo horní/dolní)
    extrémy v různé hloubce (u tohohle domu např. dětské hřiště vpředu-blízko
    vs. hřeben střechy vzadu-dál). */
function balanceMidpoint(
  points: { f: number; x: number }[],
  scale: number,
  lo: number,
  hi: number
): number {
  const reach = (mid: number, side: 'left' | 'right') => {
    let m = -Infinity
    for (const p of points) {
      const onLeft = p.x <= mid
      if ((side === 'left') !== onLeft) continue
      m = Math.max(m, p.f + Math.abs(p.x - mid) / scale)
    }
    return m
  }
  let a = lo
  let b = hi
  for (let i = 0; i < 40; i++) {
    const mid = (a + b) / 2
    const balance = reach(mid, 'left') - reach(mid, 'right')
    if (balance < 0) a = mid
    else b = mid
  }
  return (a + b) / 2
}

/** Z world-space vrcholů (`collectLineVertices`) spočítá střed SILUETY (ne
    AABB roh) a offset každého vrcholu vůči němu v kamerové bázi.

    Střed = vyvážený midpoint rozsahu `f`/`r`/`u` přes všechny vrcholy (viz
    `balanceMidpoint` - u `u` vždy, u `r` jen když je zadaný `refAspect`,
    jinak prostý `(min+max)/2`): `{e,right,up}` je ortonormální báze, takže
    `fMid·e + rMid·right + uMid·up` je PŘESNÁ (ne aproximovaná) rekonstrukce
    3D bodu se zadanými souřadnicemi v týhle bázi. Volba hloubky (`fMid`) na
    výsledný obraz ve skutečnosti vůbec nemá vliv - posun cíle o Δ podél `e`
    posune i couvnutou vzdálenost o Δ (viz `fitDistance`), takže world-space
    pozice kamery (`cíl + vzdálenost·e`) vyjde stejně; volíme `fMid` prostě
    proto, aby `houseCenter` byl konzistentní bod „uprostřed" ve všech třech
    osách, ne mix dvou různých konvencí.

    `refAspect`: když je zadaný, vodorovná osa (`r`) se vyváží (viz
    `balanceMidpoint`) proti FIXNÍMU poměru stran - má smysl jen tam, kde je
    poměr stran canvasu vždycky stejný (dekorativní hero, `aspect-[7/5]` v
    OpenerHouse.tsx - viz `DECOR_ASPECT` u volání níž). Bez něj se `r`
    centruje prostým `(min+max)/2` - u /nahled-3d se poměr stran mění podle
    okna, natvrdo zvolený referenční aspect by tam sedl jen náhodou. Svislá
    osa (`u`) se VŽDY vyvažuje pořádně (`balanceMidpoint`), protože na
    `tanV` - jen z `CAMERA.fov`, ne z aspectu - takže je vždy korektní bez
    ohledu na poměr stran canvasu. */
function measureSilhouette(
  vertices: THREE.Vector3[],
  basis: { e: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 },
  refAspect?: number
): { center: THREE.Vector3; offsets: AxisOffset[] } {
  const { e, right, up } = basis
  let fMin = Infinity
  let fMax = -Infinity
  let rMin = Infinity
  let rMax = -Infinity
  let uMin = Infinity
  let uMax = -Infinity
  const proj = vertices.map((vert) => {
    const f = vert.dot(e)
    const r = vert.dot(right)
    const u = vert.dot(up)
    if (f < fMin) fMin = f
    if (f > fMax) fMax = f
    if (r < rMin) rMin = r
    if (r > rMax) rMax = r
    if (u < uMin) uMin = u
    if (u > uMax) uMax = u
    return { f, r, u }
  })
  const fMid = (fMin + fMax) / 2

  const tanV = Math.tan((CAMERA.fov * DEG) / 2)
  const uMid = balanceMidpoint(
    proj.map((p) => ({ f: p.f, x: p.u })),
    tanV,
    uMin,
    uMax
  )
  const rMid =
    refAspect !== undefined
      ? balanceMidpoint(
          proj.map((p) => ({ f: p.f, x: p.r })),
          tanV * refAspect,
          rMin,
          rMax
        )
      : (rMin + rMax) / 2

  const center = e
    .clone()
    .multiplyScalar(fMid)
    .addScaledVector(right, rMid)
    .addScaledVector(up, uMid)
  const offsets = proj.map((p) => ({ f: p.f - fMid, r: p.r - rMid, u: p.u - uMid }))
  return { center, offsets }
}

/* Rezerva kolem domu při „fitu" do viewportu. `fitDistance` počítá PŘESNOU
   vzdálenost, na kterou se dům celý vejde do frustumu - viz níže. Tahle
   konstanta je proto čistý násobitel „vzduchu kolem kresby": 1.0 = kresba
   přesně na hraně rámu (edge-to-edge, nic navíc), 1.3 = navíc ~30 %
   vzdálenosti prostoru. Není to kompenzace za podhodnocený odhad rozměrů -
   žádný odhad, fit je exaktní.

   PŮVODNĚ se fitovalo na 8 rohů Box3 (AABB) - ty jsou ale matematické
   kombinace min/max, skoro nikdy skutečné body domu, a při pohledu zešikma
   (azimuth/elevation v CAMERA) trčí citelně dál než skutečná kresba: i
   margin=1.0 (box přesně na hraně) nechávalo kolem SKUTEČNÉ kresby mezeru
   (naměřeno ~55-57 % šířky/výšky vrstvy u dekorace, ne 100 %). `fitDistance`
   teď fituje na SKUTEČNÉ vrcholy obrysů (`collectLineVertices` +
   `measureSilhouette`), takže margin=1.0 už znamená to, co má - kresba na
   hraně rámu - a hodnoty níž jsou zas smysluplně blízko svého nominálního
   významu.

   Tři různé hodnoty podle toho, co ten vzduch spotřebuje:
   - FIT_MARGIN_SOLO = 1.42: samostatný /nahled-3d. Přesný vrcholový fit je
     o dost těsnější než starý AABB fit (starý margin 1.08 měřil na nafouklé
     rohy Box3) - 1.42 je dokalibrováno tak, aby VÝSLEDNÁ vzdálenost kamery
     (a tím i velikost domu v obraze) na běžných desktopových šířkách
     (aspect ≳ 1.3, tj. ~1280 px a víc) odpovídala PŮVODNÍMU vzhledu (ověřeno
     vizuálním porovnáním screenshotů, ne ink-fill boxem - viz níž proč).
     Zbývá zdravá rezerva na rotaci/zoom OrbitControls (ověřeno na všech 4
     rozích azimuth/polar × nejbližší zoom, viz report úlohy) - `fitDistance`
     počítá jen pro VÝCHOZÍ azimuth/elevation, ne pro krajní polohy, takže
     rezerva musí vzniknout tady, ne v `fitDistance` samotném.
     POZOR: ink-fill (ořez pozadí na screenshotu) NENÍ na /nahled-3d spolehlivý
     ukazatel velikosti domu - `MenuOverlay` kreslí labely v PEVNÝCH % pozicích
     od kraje canvasu (`.h3d-label` v MenuOverlay.ts), takže změřený „inkoust"
     je prakticky vždy label chip, ne obrys domu - margin 1.0 i 1.42 dají
     bit-identický ink bbox. Validace proto šla přes shodu vzdálenosti kamery
     (`fitDistance` dW/dH) + vizuální porovnání, ne přes automatický ink-fill.
     Při užším poměru stran (~1024 px, aspect ~1.14) vychází dům o něco menší
     než PŮVODNĚ (starý AABB fit tam byl vázaný na jinak nafouklou šířku než
     nový vrcholový fit) - žádné oříznutí, jen o trochu menší dům; jednu
     hodnotu marginu nejde dokalibrovat na shodu v OBOU režimech (width-bound
     i height-bound) najednou, viz report.
   - FIT_MARGIN_HERO: transparentní A interaktivní varianta (menu labely by
     bydlely v pevných sloupcích u kraje - dnes nepoužito, ale rezervováno).
   - FIT_MARGIN_DECOR = 1.15: dekorativní hero dům (`interactive === false`,
     OpenerHouse) - žádné labely, žádný overlay, OrbitControls vypnuté (jen
     drobný idle float, žádná rotace) - nepotřebuje SOLO rezervu na rotaci,
     ale přesto NENÍ 1.0: cíl je „ať má dům trochu vzduchu proti textu", ne
     „edge-to-edge". Naladěno na ~85 % vyplnění vázané osy (výška, viz
     `DECOR_ASPECT`/`balanceMidpoint` - u tohohle poměru stran vždy váže H)
     s okraji vyváženými na pár px - naměřeno v `measureHouse`/testech
     (fillH ≈ 0.846-0.849 při 1024-1920 px).
   Pořadí konstant je: interaktivita (SOLO/HERO) > co je vlastně dekorace
   (DECOR) - viz `this.fitMargin` v konstruktoru. */
const FIT_MARGIN_HERO = 1.55
const FIT_MARGIN_SOLO = 1.42
const FIT_MARGIN_DECOR = 1.15

/** Poměr stran dekorativního hero canvasu - musí sedět s `aspect-[7/5]` v
    OpenerHouse.tsx. Používá se JEN k vyvážení vodorovné osy (`r`) NO_FENCE
    siluety (viz `measureSilhouette`/`balanceMidpoint`) - /nahled-3d má
    proměnlivý poměr stran okna, takže tam natvrdo zvolená hodnota nedává
    smysl a horizontální osa se necentruje takhle. */
const DECOR_ASPECT = 7 / 5

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

  // Skutečná silueta domu (world-space vrcholy obrysů z `house.root`, viz
  // `collectLineVertices`/`measureSilhouette`) — měřená DVAKRÁT v konstruktoru
  // (viz `measureHouse`), ne každý frame: jednou VČETNĚ plotu, jednou BEZ něj.
  // Plot totiž bývá skrytý (`house.fence.group.visible`, viz `resize()`,
  // `w > 768`) a `Box3.setFromObject` (staré řešení, viz git historie)
  // viditelnost IGNOROVALO (ověřeno testem na three 0.185.0 - schovaný objekt
  // box stejně nafoukl, zdroj `expandByObject` netestuje `object.visible`
  // vůbec) - fit na skrytou geometrii je přesně to, co dělalo dekorativní
  // hero dům malým a mimo střed. `houseCenter`/`houseOffsets` = AKTUÁLNÍ
  // výběr z dvojice níž, přepočítá ho `selectHouseGeometry()` podle právě
  // nastavené viditelnosti plotu - `fitDistance` i cíl OrbitControls tak
  // vždy čtou ZE STEJNÉ siluety.
  private houseCenterFull = new THREE.Vector3()
  private houseOffsetsFull: AxisOffset[] = []
  private houseCenterNoFence = new THREE.Vector3()
  private houseOffsetsNoFence: AxisOffset[] = []

  private houseCenter = new THREE.Vector3()
  private houseOffsets: AxisOffset[] = []

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

  /** Spočítá skutečnou siluetu domu (world-space vrcholy fat-line obrysů z
      `house.root` - BEZ zemní roviny, ta žije samostatně přímo ve `scene`,
      ne pod `house.root`, viz `setupGround` - viz `collectLineVertices`)
      DVAKRÁT: jednou celý dům (plot obepíná CELÝ pozemek, viz komentář u
      `buildFence` v HouseModelu), jednou bez plotu. Voláno JEDNOU
      (konstruktor) - dům je po sestavení statická geometrie (intro mění jen
      opacity materiálů, ne vertexy), takže se cache nikdy neinvaliduje.

      Plot NEJDE vyloučit nastavením `visible = false` a pak změřit -
      `Box3.setFromObject` (a tedy nejspíš i ruční traverzování) viditelnost
      ignoruje (ověřeno testem, three 0.185.0: schovaný objekt daleko od
      zbytku geometrie box i tak nafoukl - zdroj `expandByObject` nikde
      netestuje `object.visible`). Plot proto na chvíli fyzicky vyjmeme ze
      stromu (`root.remove`/`root.add`), ne schováme - a vrátíme přesně na
      konec, jako při stavbě v HouseModelu (`buildFence` je poslední
      `this.all.push`, takže `root.add` pořadí dětí/render order nezmění). */
  private measureHouse(): void {
    const basis = cameraBasis()

    const full = measureSilhouette(collectLineVertices(this.house.root), basis)
    this.houseCenterFull.copy(full.center)
    this.houseOffsetsFull = full.offsets

    this.house.root.remove(this.house.fence.group)
    const noFence = measureSilhouette(collectLineVertices(this.house.root), basis, DECOR_ASPECT)
    this.houseCenterNoFence.copy(noFence.center)
    this.houseOffsetsNoFence = noFence.offsets
    this.house.root.add(this.house.fence.group)

    this.selectHouseGeometry()
  }

  /** Vybere z dvojice siluet předpočítaných v `measureHouse` tu, která
      odpovídá PRÁVĚ NASTAVENÉ viditelnosti plotu (`house.fence.group.visible`
      - `resize()` ji nastavuje TĚSNĚ PŘED voláním této metody, viz tam).
      `houseCenter`/`houseOffsets` pak čtou `fitDistance` i cíl OrbitControls
      (`controls.target`), takže fit distance a cíl kamery vždycky sedí na
      STEJNOU siluetu - míchání dvou různých měření mezi distance a targetem
      byla původní příčina malého/mimostředého domu v hero. */
  private selectHouseGeometry(): void {
    const withFence = this.house.fence.group.visible
    this.houseCenter.copy(withFence ? this.houseCenterFull : this.houseCenterNoFence)
    this.houseOffsets = withFence ? this.houseOffsetsFull : this.houseOffsetsNoFence
  }

  /** Přesná vzdálenost kamery, na kterou se celá silueta domu (všechny
      vrcholy obrysů, viz `measureHouse`) vejde do frustumu - žádný odhad,
      žádná Box3 aproximace (ta při pohledu zešikma trčí za skutečnou kresbu,
      viz komentář u FIT_MARGIN).

      Vrcholy jsou už `measureSilhouette` rozložené do kamerové báze a
      posunuté vůči (rekentrovanému) středu siluety: `f` = hloubka, `r`/`u` =
      vodorovně/svisle. Vrchol je uvnitř frustumu ve vzdálenosti `d`, když
      `|r| <= tanH·(d-f)` a `|u| <= tanV·(d-f)` (definice perspektivního
      frustumu), tj. `d >= f + |r|/tanH` a `d >= f + |u|/tanV`. `dW`/`dH` jsou
      maxima přes všechny vrcholy odděleně pro šířku/výšku - protože `f` je
      pro daný vrchol společné oběma podmínkám, `max(f+|r|/tanH, f+|u|/tanV)
      = f + max(...)`, takže `max(dW, dH)` je matematicky shodné s "jedním
      průchodem" přes obě podmínky najednou (algebraická identita, ne
      aproximace). PerspectiveCamera.fov je VERTIKÁLNÍ → tanH se dopočítá
      z aspectu. */
  private fitDistance(aspect: number): number {
    const tanV = Math.tan((this.baseFov * DEG) / 2)
    const tanH = tanV * aspect

    let dW = 0
    let dH = 0
    for (const o of this.houseOffsets) {
      dW = Math.max(dW, o.f + Math.abs(o.r) / tanH)
      dH = Math.max(dH, o.f + Math.abs(o.u) / tanV)
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
