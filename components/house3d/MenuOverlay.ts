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

export class MenuOverlay {
  private container: HTMLElement
  private layer: HTMLDivElement
  private svg: SVGSVGElement
  private entries = new Map<MenuId, LabelEntry>()
  private active: MenuId | null = null

  constructor(container: HTMLElement, private handlers: OverlayHandlers) {
    this.container = container

    this.layer = document.createElement('div')
    this.layer.className = 'h3d-overlay'

    // Styly žijí UVNITŘ vlastní vrstvy (ne v document.head). Cizí uzel v <head>
    // App Router při navigaci rekonciluje a způsobí removeChild NotFoundError.
    this.injectStyles()

    this.svg = document.createElementNS(SVG_NS, 'svg')
    this.svg.classList.add('h3d-svg')
    this.layer.appendChild(this.svg)

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
    btn.innerHTML = `<span class="h3d-service">${item.service}</span><span class="h3d-element">${item.element}</span>`

    // svislá pozice ve sloupci (rovnoměrné rozmístění)
    const top = ((item.slot + 0.5) / count) * 64 + 16 // 16 %..80 %
    btn.style.top = `${top}%`

    btn.addEventListener('pointerenter', () => this.handlers.onHover(item.id))
    btn.addEventListener('pointerleave', () => this.handlers.onHover(null))
    btn.addEventListener('focus', () => this.handlers.onHover(item.id))
    btn.addEventListener('blur', () => this.handlers.onHover(null))
    btn.addEventListener('click', () => this.handlers.onSelect(item.id))

    this.layer.appendChild(btn)
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
    for (const [id, e] of this.entries) {
      const a = anchors.get(id)
      if (!a) continue
      // startovní bod = vnitřní hrana labelu (přepočtený do nescalovaných souřadnic)
      const r = e.root.getBoundingClientRect()
      const edge = e.item.side === 'left' ? r.right : r.left
      const sx = (edge - crect.left) / sf
      const sy = (r.top - crect.top + r.height / 2) / sf

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
.h3d-line{stroke:${COLORS.inkSoft};stroke-width:1.3;transition:stroke .3s ease,stroke-width .3s ease,opacity .3s ease;}
.h3d-line.is-active{stroke:${COLORS.accent};stroke-width:2;}
.h3d-dot{fill:${COLORS.inkSoft};transition:fill .3s ease,r .3s ease;}
.h3d-dot.is-active{fill:${COLORS.accent};r:4;}
.h3d-label{position:absolute;pointer-events:auto;background:none;border:0;cursor:pointer;display:flex;flex-direction:column;gap:.15rem;padding:.35rem .5rem;line-height:1;transition:transform .35s cubic-bezier(.22,1,.36,1),color .3s ease;color:${COLORS.ink};}
.h3d-label.h3d-left{left:3%;align-items:flex-start;text-align:left;transform:translateX(0);}
.h3d-label.h3d-right{right:3%;align-items:flex-end;text-align:right;transform:translateX(0);}
.h3d-label:hover,.h3d-label.is-active{color:${COLORS.accent};}
.h3d-label.h3d-left:hover,.h3d-label.h3d-left.is-active{transform:translateX(6px);}
.h3d-label.h3d-right:hover,.h3d-label.h3d-right.is-active{transform:translateX(-6px);}
.h3d-service{font-family:var(--font-display,Georgia,serif);font-style:italic;font-weight:500;font-size:1.8rem;letter-spacing:.01em;}
.h3d-element{font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.2em;opacity:.7;}
.h3d-label:focus-visible{outline:2px solid ${COLORS.accent};outline-offset:3px;border-radius:3px;}
@media (max-width:1024px){.h3d-service{font-size:1.4rem;}.h3d-element{font-size:.6rem;}}
@media (max-width:768px){.h3d-service{font-size:1.2rem;}.h3d-element{font-size:.56rem;}}
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
