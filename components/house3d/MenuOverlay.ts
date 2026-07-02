import { COLORS, MENU, type MenuId, type MenuItem } from './config'

/* -------------------------------------------------------------------------- */
/*  MenuOverlay — plovoucí HTML labely + SVG spojnice                          */
/*                                                                             */
/*  Labely sedí v pevných sloupcích (vlevo/vpravo) mimo siluetu domu. Každý     */
/*  rámec se přepočítá konec spojnice na promítnutou 3D kotvu prvku. Hover      */
/*  jemně rozanimuje čáru i label a hlásí se ven (onHover) pro zvýraznění domu. */
/* -------------------------------------------------------------------------- */

export interface ProjectedAnchor {
  x: number
  y: number
  visible: boolean
}

export interface MenuLabelText {
  service: string
  element: string
}

interface OverlayHandlers {
  onHover: (id: MenuId | null) => void
  onSelect: (id: MenuId) => void
}

interface LabelEntry {
  item: MenuItem
  root: HTMLButtonElement
  line: SVGLineElement
  dot: SVGCircleElement
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/* Pevné pořadí chipů na mobilu (zleva doprava): Tesařství, Pokrývačství, Klempířství. */
const MOBILE_ORDER: Partial<Record<MenuId, number>> = {
  pergola: 0,
  roof: 1,
  gutters: 2,
}

export class MenuOverlay {
  private container: HTMLElement
  private layer: HTMLDivElement
  private svg: SVGSVGElement
  private labelsBox!: HTMLDivElement
  private entries = new Map<MenuId, LabelEntry>()
  private active: MenuId | null = null

  constructor(
    container: HTMLElement,
    private handlers: OverlayHandlers,
    private labels: Record<MenuId, MenuLabelText>
  ) {
    this.container = container

    this.layer = document.createElement('div')
    this.layer.className = 'h3d-overlay'

    // Styly žijí UVNITŘ vlastní vrstvy (ne v document.head). Cizí uzel v <head>
    // App Router při navigaci rekonciluje a způsobí removeChild NotFoundError.
    this.injectStyles()

    this.svg = document.createElementNS(SVG_NS, 'svg')
    this.svg.classList.add('h3d-svg')
    this.layer.appendChild(this.svg)

    // Labely v samostatném boxu: na desktopu absolutně v bočních sloupcích,
    // na mobilu (přes CSS) jako řádek „chipů" pod domem (spojnice se skryjí).
    this.labelsBox = document.createElement('div')
    this.labelsBox.className = 'h3d-labels'
    this.layer.appendChild(this.labelsBox)

    const leftCount = MENU.filter((m) => m.side === 'left').length
    const rightCount = MENU.filter((m) => m.side === 'right').length

    for (const item of MENU) {
      const count = item.side === 'left' ? leftCount : rightCount
      this.entries.set(item.id, this.buildLabel(item, count))
    }

    this.container.appendChild(this.layer)
  }

  private buildLabel(item: MenuItem, count: number): LabelEntry {
    // SVG spojnice + kotvící tečka
    const line = document.createElementNS(SVG_NS, 'line')
    line.classList.add('h3d-line')
    const dot = document.createElementNS(SVG_NS, 'circle')
    dot.classList.add('h3d-dot')
    dot.setAttribute('r', '2.6')
    this.svg.append(line, dot)

    // HTML label
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `h3d-label h3d-${item.side}`
    btn.setAttribute('data-id', item.id)
    const label = this.labels[item.id]
    btn.innerHTML = `<span class="h3d-service">${label.service}</span><span class="h3d-element">${label.element}</span>`

    // svislá pozice ve sloupci (rovnoměrné rozmístění)
    const top = ((item.slot + 0.5) / count) * 64 + 16 // 16 %..80 %
    btn.style.top = `${top}%`

    btn.addEventListener('pointerenter', () => this.handlers.onHover(item.id))
    btn.addEventListener('pointerleave', () => this.handlers.onHover(null))
    btn.addEventListener('focus', () => this.handlers.onHover(item.id))
    btn.addEventListener('blur', () => this.handlers.onHover(null))
    btn.addEventListener('click', () => this.handlers.onSelect(item.id))

    this.labelsBox.appendChild(btn)
    return { item, root: btn, line, dot }
  }

  /** Zobraz labely (volá se po dokončení úvodního vykreslení domu). */
  reveal(): void {
    this.layer.classList.add('is-ready')
  }

  /** Externí highlight (z raycastu domu) → promítnout do labelů. */
  setActive(id: MenuId | null): void {
    if (this.active === id) return
    this.active = id
    for (const [key, e] of this.entries) {
      const on = key === id
      e.root.classList.toggle('is-active', on)
      e.line.classList.toggle('is-active', on)
      e.dot.classList.toggle('is-active', on)
    }
  }

  /** Každý rámec: napoj konce spojnic na promítnuté kotvy. */
  layout(size: { w: number; h: number }, anchors: Map<MenuId, ProjectedAnchor>): void {
    this.svg.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`)
    const crect = this.container.getBoundingClientRect()
    // Kontejner může být CSS-scalovaný (hero scroll efekt zmenšuje dům). viewBox
    // i promítnuté kotvy jsou v nescalovaném prostoru (clientWidth/Height), ale
    // getBoundingClientRect() vrací scalované pixely. Podělíme měřítkem, jinak by
    // se startovní body spojnic při scrollu odpojily od labelů.
    const sf = crect.width / size.w || 1
    // Mobil: labely jsou „chipy" v řádku pod domem → čára vychází z horního středu
    // chipu nahoru ke kotvě. Desktop: z vnitřní (boční) hrany labelu ve sloupci.
    const mobile = size.w <= 768
    // Pořadí chipů zleva doprava odpovídá promítnutým kotvám při hero pohledu
    // (pergola je vlevo vpředu, střecha uprostřed, okapy vpravo) → spojnice se
    // nekříží. Pevné pořadí je stabilní (kotvy pergoly a střechy mají skoro
    // totožné X a dynamické řazení mezi nimi poblikávalo a křížilo čáry).
    if (mobile) {
      for (const e of this.entries.values()) {
        const v = String(MOBILE_ORDER[e.item.id] ?? e.item.slot)
        if (e.root.style.order !== v) e.root.style.order = v
      }
    }
    for (const [id, e] of this.entries) {
      const a = anchors.get(id)
      if (!a) continue
      // startovní bod (přepočtený do nescalovaných souřadnic)
      const r = e.root.getBoundingClientRect()
      let sx: number
      let sy: number
      if (mobile) {
        sx = (r.left + r.width / 2 - crect.left) / sf
        sy = (r.top - crect.top) / sf
      } else {
        const edge = e.item.side === 'left' ? r.right : r.left
        sx = (edge - crect.left) / sf
        sy = (r.top - crect.top + r.height / 2) / sf
      }

      e.line.setAttribute('x1', String(sx))
      e.line.setAttribute('y1', String(sy))
      e.line.setAttribute('x2', String(a.x))
      e.line.setAttribute('y2', String(a.y))
      e.dot.setAttribute('cx', String(a.x))
      e.dot.setAttribute('cy', String(a.y))
      const vis = a.visible ? '' : 'hidden'
      e.line.style.visibility = vis
      e.dot.style.visibility = vis
    }
  }

  private injectStyles(): void {
    const css = `
.h3d-overlay{position:absolute;inset:0;pointer-events:none;font-family:var(--font-body,system-ui,sans-serif);z-index:5;opacity:0;transition:opacity .7s ease;}
.h3d-overlay.is-ready{opacity:1;}
.h3d-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}
.h3d-labels{position:absolute;inset:0;}
.h3d-line{stroke:${COLORS.inkSoft};stroke-width:1.3;transition:stroke .3s ease,stroke-width .3s ease,opacity .3s ease;}
.h3d-line.is-active{stroke:${COLORS.accent};stroke-width:2;}
.h3d-dot{fill:${COLORS.inkSoft};transition:fill .3s ease,r .3s ease;}
.h3d-dot.is-active{fill:${COLORS.accent};r:4;}
.h3d-label{position:absolute;pointer-events:auto;background:none;border:0;cursor:pointer;display:flex;flex-direction:column;gap:.15rem;padding:.35rem .5rem;line-height:1;transition:transform .35s cubic-bezier(.22,1,.36,1),color .3s ease;color:${COLORS.ink};}
/* left/right: 3 % od okraje na běžných šířkách; na velkých monitorech by ale
   3 % ujíždělo od domu (ten se šířkou neroztahuje, drží se výšky viewportu),
   proto od jisté šířky zamrzne na pevné vzdálenosti od středu. */
.h3d-label.h3d-left{left:max(3%,calc(50% - 1180px));align-items:flex-start;text-align:left;transform:translateX(0);}
.h3d-label.h3d-right{right:max(3%,calc(50% - 1180px));align-items:flex-end;text-align:right;transform:translateX(0);}
.h3d-label:hover,.h3d-label.is-active{color:${COLORS.accent};}
.h3d-label.h3d-left:hover,.h3d-label.h3d-left.is-active{transform:translateX(6px);}
.h3d-label.h3d-right:hover,.h3d-label.h3d-right.is-active{transform:translateX(-6px);}
.h3d-service{font-family:var(--font-display,Georgia,serif);font-style:italic;font-weight:500;font-size:1.8rem;letter-spacing:.01em;}
.h3d-element{font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.2em;opacity:.7;}
.h3d-label:focus-visible{outline:2px solid ${COLORS.accent};outline-offset:3px;border-radius:3px;}
@media (max-width:1024px){.h3d-service{font-size:1.4rem;}.h3d-element{font-size:.6rem;}}
/* Mobil: dům vyplní šířku → labely jako řádek „chipů" pod domem, spojnice z horního
   středu chipu nahoru ke kotvě (viz layout()). */
@media (max-width:768px){
.h3d-service{font-size:1.05rem;}.h3d-element{font-size:.54rem;}
.h3d-labels{inset:auto 0 4.75rem 0;display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:.35rem 1rem;padding:0 1rem;}
.h3d-label{position:static;align-items:center;text-align:center;left:auto;right:auto;top:auto!important;transform:none!important;padding:.3rem .45rem;gap:.1rem;}
.h3d-label.h3d-left,.h3d-label.h3d-right{align-items:center;text-align:center;}
}
@media (prefers-reduced-motion:reduce){.h3d-overlay,.h3d-label,.h3d-line,.h3d-dot{transition:none;}}
`
    const style = document.createElement('style')
    style.textContent = css
    this.layer.appendChild(style)
  }

  dispose(): void {
    this.layer.remove()
    this.entries.clear()
  }
}
