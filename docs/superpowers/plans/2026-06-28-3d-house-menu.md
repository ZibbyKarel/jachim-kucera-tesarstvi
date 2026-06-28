# 3D House Interactive Menu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the SVG line-art house in `components/house/IsometricHouse.tsx` with a fully-shaded interactive Three.js / React Three Fiber model of a house with a pergola, whose parts are clickable links into the site's main navigation.

**Architecture:** A thin `'use client'` wrapper (`IsometricHouse.tsx`) renders an always-in-DOM crawlable fallback `<nav>` and `next/dynamic({ssr:false})`-loads the heavy `<HouseScene>` (R3F `<Canvas>`). Geometry is generated parametrically from one `dimensions.ts` config so walls, windows, roof and pergola align structurally. Rotation (drag/swipe/gyro/idle auto-rotate) is driven by a `useHouseRotation` hook that maintains a target angle in a ref; a `useFrame` loop inside the Canvas lerps the model group toward it.

**Tech Stack:** Next.js 14.2.15 (App Router), React 18.3.1, TypeScript, next-intl, `three`, `@react-three/fiber@^8`, `@react-three/drei@^9`, GSAP (existing).

## Global Constraints

- React 18.3.1 → MUST use `@react-three/fiber@^8` and `@react-three/drei@^9` (v9/v10 / drei v10 require React 19). After install, a React-19 peer-dep warning means a wrong major resolved — fix before continuing.
- R3F cannot SSR → the `<Canvas>` tree is only ever imported via `next/dynamic` with `{ ssr: false }`.
- The house is the site's primary navigation. The six real `<Link>` tags MUST exist in server-rendered HTML (the fallback nav), independent of WebGL. Verify with JS disabled / view-source.
- Navigation mapping (authoritative):
  - Okna `g-windows` → `/o-nas`
  - Dveře `g-door` → `/kontakt`
  - Střecha `g-roof` → `/sluzby/pokryvacstvi`
  - Okapy `g-gutters` → `/sluzby/klempirstvi`
  - Komín `g-chimney` → `/realizace`
  - Trámy/pergola `g-truss` → `/sluzby/tesarstvi`
- Respect `prefers-reduced-motion` (helper `prefersReducedMotion()` in `lib/gsap.ts`): no auto-rotate, no gyro, no scale-in intro.
- Per-task gate: `npm run typecheck` passes. Final gate: visual screenshots (desktop 1440×900 + mobile 390×844) show the house reads correctly. Do NOT mark the feature done on typecheck alone.
- Path alias: `@/*` → repo root. i18n `Link`/`useRouter` from `@/i18n/routing`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `components/house/dimensions.ts` | **New.** Single source of truth: all house measurements + derived helpers (eave X, ridge Y, roof slope angle, window/door placements). |
| `components/house/HouseModel.tsx` | **New.** Parametric R3F meshes for every part, grouped by `groupId`, with hover/click affordance. Pure scene-graph, no Canvas. |
| `components/house/HouseScene.tsx` | **New.** `<Canvas>`, lights, `<ContactShadows>`, rotation `useFrame` loop, intro scale-in, drei `<Html>` anchored labels. Default export (for dynamic import). |
| `components/house/useHouseRotation.ts` | **Rewrite.** Maintains target Y-rotation (radians) in a ref from mouse/touch/gyro; exposes `enableGyro`. No DOM transforms. |
| `components/house/IsometricHouse.tsx` | **Rewrite.** Thin wrapper: dynamic import of `HouseScene` + crawlable fallback `<nav>` + hint + gyro button. |
| `components/house/HouseSection.tsx` | **Delete.** SVG-specific; replaced by `InteractivePart` inside `HouseModel.tsx`. |
| `lib/constants.ts` | **Edit.** Fix `houseLabels` mapping (windows→`/o-nas`, chimney→`/realizace`). |
| `package.json` | **Edit.** Add three + R3F + drei deps. |

---

### Task 1: Install dependencies

**Files:** Modify `package.json` (via npm).

- [ ] **Step 1: Install**

```bash
npm install three @react-three/fiber@^8 @react-three/drei@^9
npm install -D @types/three
```

- [ ] **Step 2: Verify majors + no React-19 peer error**

```bash
npm ls @react-three/fiber @react-three/drei three react
```
Expected: `@react-three/fiber@8.x`, `@react-three/drei@9.x`, single `react@18.3.x`. No "invalid"/unmet-peer lines mentioning react@19. If three's version makes drei emit deep-import type errors in Task 6's build, pin `three@~0.169` + `@types/three@~0.169` and reinstall.

- [ ] **Step 3: Typecheck still clean**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add three.js + react-three-fiber deps"
```

---

### Task 2: Fix navigation mapping in constants

**Files:** Modify `lib/constants.ts:412-461` (`houseLabels`).

**Interfaces:**
- Produces: `houseLabels: HouseLabel[]` where `groupId` `g-windows` has `href: '/o-nas'` and `g-chimney` has `href: '/realizace'`. Consumed by `IsometricHouse.tsx` fallback nav and `HouseScene.tsx` labels.

- [ ] **Step 1: Swap windows + chimney targets**

In `g-chimney` label: `text: 'Realizace'`, `subtext: 'Komín'`, `href: '/realizace'`.
In `g-windows` label: `text: 'O nás'`, `subtext: 'Okna — kdo jsme'`, `href: '/o-nas'`.
Leave roof/truss/gutters/door unchanged. Keep existing `position` values (only used by fallback nav now; fine to leave).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add lib/constants.ts
git commit -m "fix: correct house menu mapping (windows→o-nas, chimney→realizace)"
```

---

### Task 3: Parametric dimensions config

**Files:** Create `components/house/dimensions.ts`.

**Interfaces:**
- Produces: `DIMS` object and derived helpers consumed by `HouseModel.tsx` and `HouseScene.tsx` (label anchors).

Ridge runs along **Z** (depth). Cross-section in X–Y is a triangle. Gable triangles face ±Z; the **front gable is +Z** (door + pergola). Long side walls are the ±X faces (windows). Units = meters, ground at y=0.

```ts
export const DIMS = {
  width: 6,        // X — wall span between eaves
  depth: 4.5,      // Z — gable-to-gable
  wallH: 3,        // wall height (foundation top → eave)
  foundH: 0.35,    // foundation/plinth height
  roofRise: 1.9,   // eave → ridge vertical
  eaveOver: 0.45,  // roof overhang past wall in ±X
  gableOver: 0.4,  // roof overhang past gable in ±Z
  roofThick: 0.18,
  wallThick: 0.2,
} as const

const halfW = DIMS.width / 2
const halfD = DIMS.depth / 2

// Derived (single source of truth so parts align):
export const GEO = {
  halfW,
  halfD,
  foundTopY: DIMS.foundH,
  eaveY: DIMS.foundH + DIMS.wallH,                 // top of walls
  ridgeY: DIMS.foundH + DIMS.wallH + DIMS.roofRise,
  eaveX: halfW + DIMS.eaveOver,                    // outer roof edge in X (gutters live here)
  wallCenterY: DIMS.foundH + DIMS.wallH / 2,
  // roof plane: base half-width incl. overhang, slope length + angle
  roofHalfBase: halfW + DIMS.eaveOver,
  get roofSlopeLen() { return Math.hypot(this.roofHalfBase, DIMS.roofRise) },
  get roofAngle() { return Math.atan2(DIMS.roofRise, this.roofHalfBase) }, // tilt about Z
  roofLenZ: DIMS.depth + 2 * DIMS.gableOver,
} as const

// Part metadata: groupId → site href (mirrors lib/constants houseLabels).
export const PART_HREF: Record<string, string> = {
  'g-roof': '/sluzby/pokryvacstvi',
  'g-truss': '/sluzby/tesarstvi',
  'g-gutters': '/sluzby/klempirstvi',
  'g-windows': '/o-nas',
  'g-chimney': '/realizace',
  'g-door': '/kontakt',
}
```

- [ ] **Step 1: Write the file** (code above).
- [ ] **Step 2: Typecheck** — `npm run typecheck` → exit 0.
- [ ] **Step 3: Commit** — `git add components/house/dimensions.ts && git commit -m "feat: parametric house dimensions config"`

---

### Task 4: HouseModel — parametric geometry

**Files:** Create `components/house/HouseModel.tsx`.

**Interfaces:**
- Consumes: `DIMS`, `GEO`, `PART_HREF` from `./dimensions`.
- Produces: `export function HouseModel({ active, onActivate, onHover })` where
  `active: string | null` (groupId), `onActivate: (href: string) => void`, `onHover: (groupId: string | null) => void`.
  Also `export const LABEL_ANCHORS: { groupId: string; pos: [number,number,number] }[]` for `HouseScene` labels.

**Design notes (no CSG):**
- Walls = one solid `boxGeometry` (cream plaster material). Windows/door = frame + panel meshes laid flush/slightly proud on the wall face — NOT boolean cutouts.
- Roof = two thin boxes (`roofSlopeLen` × `roofThick` × `roofLenZ`) each rotated about Z by `±roofAngle`, shifted to meet at the ridge; plus two triangular gable in-fills (`THREE.Shape`) at z = ±(halfD) to close the ends.
- Gutters = two thin long boxes along the eave outer edges (x = ±eaveX, y = eaveY) running in Z, + one vertical downspout box at the +X/+Z corner. Dark metal material.
- Chimney = vertical box on the +X roof plane, base embedded in roof, top above ridge. Brick-red material.
- Pergola = 4 posts (boxes, ground→ ~2.3m) in front of +Z gable, + 2 long rafters + 3–4 cross beams (trámy). Wood material.
- Each interactive part wrapped in `<InteractivePart groupId>` (a `<group name=groupId>` with `onPointerOver`/`onPointerOut`/`onClick`), applying emissive highlight to children when `active===groupId`.

Wrap raw materials/colors from brand palette: wood `#a06a2c`, plaster/cream `#e8dfca`, dark beam `#5a3d22`, metal gutter `#3a3a3c`, brick `#8c4a32`, glass `#9fc4d6` (emissive low). Use `meshStandardMaterial`.

`LABEL_ANCHORS` anchors (approx, in model space; will be fine-tuned visually):
`g-chimney` → `[halfW*0.4, ridgeY+0.6, 0]`, `g-roof` → `[0, ridgeY+0.1, 0]`,
`g-truss` → `[0, 2.3, halfD+1.3]`, `g-gutters` → `[-eaveX-0.2, eaveY, 0]`,
`g-windows` → `[-halfW-0.25, wallCenterY, 0]`, `g-door` → `[0, foundTopY+1.0, halfD+0.05]`.

- [ ] **Step 1:** Implement `InteractivePart` helper (group + pointer handlers + emissive highlight via traversing children or wrapping material). Cursor → `document.body.style.cursor` on hover.
- [ ] **Step 2:** Implement `Walls`, `Foundation` (non-interactive base).
- [ ] **Step 3:** Implement `Roof` (two tilted boxes + gable triangles) under `g-roof`.
- [ ] **Step 4:** Implement `Gutters` (`g-gutters`), `Chimney` (`g-chimney`).
- [ ] **Step 5:** Implement `Windows` (`g-windows`, 4–5 frame+glass units on ±X walls + front gable), `Door` (`g-door`, +Z gable).
- [ ] **Step 6:** Implement `Pergola` (`g-truss`, posts + beams in +Z).
- [ ] **Step 7:** Assemble `HouseModel` group; export `LABEL_ANCHORS`.
- [ ] **Step 8: Typecheck** — `npm run typecheck` → exit 0.
- [ ] **Step 9: Commit** — `git commit -m "feat: parametric 3D house model (R3F meshes)"`

---

### Task 5: Rewrite useHouseRotation for 3D

**Files:** Modify `components/house/useHouseRotation.ts` (full rewrite).

**Interfaces:**
- Produces: `useHouseRotation(): { rotationRef, enableGyro, markActivity }`
  - `rotationRef: MutableRefObject<{ targetY: number; lastActivity: number }>` — `targetY` in radians.
  - `enableGyro: () => void` — requests iOS DeviceOrientation permission, attaches listener.
  - `markActivity: () => void` — call on pointer interaction to suppress idle auto-rotate.
- Consumed by `HouseScene.tsx` (the `useFrame` loop reads `rotationRef`, applies lerp + idle auto-rotation when `now - lastActivity > IDLE_MS`).

**Notes:** No DOM element, no transform writes. Map `mousemove` / `touchmove` clientX ratio → `targetY` clamped to ±`MAX_RAD` (~0.5 rad). Gyro `gamma/90 * MAX_RAD`. Skip all listeners if `prefersReducedMotion()`. Use a module idle timestamp via `performance.now()` updated on each input.

- [ ] **Step 1:** Rewrite hook per interface above.
- [ ] **Step 2: Typecheck** — exit 0.
- [ ] **Step 3: Commit** — `git commit -m "refactor: useHouseRotation drives 3D group target angle"`

---

### Task 6: HouseScene — Canvas, lights, rotation, labels, intro

**Files:** Create `components/house/HouseScene.tsx` (default export).

**Interfaces:**
- Consumes: `HouseModel`, `LABEL_ANCHORS`, `useHouseRotation`, `houseLabels` (`@/lib/constants`), `Link`/`useRouter` (`@/i18n/routing`), drei `Html`, `ContactShadows`, `Environment`(optional), `prefersReducedMotion`.
- Produces: `export default function HouseScene()`.

**Notes:**
- `<Canvas shadows dpr={[1,2]} camera={{ position:[7,5,9], fov:38 }}>`.
- Lights: `ambientLight` ~0.5 + `directionalLight` (castShadow, position `[6,9,5]`) + `hemisphereLight`.
- `<group ref>` holds `<HouseModel>`; a `useFrame` lerps `group.rotation.y` toward `rotationRef.current.targetY`; idle auto-rotate adds small delta when not reduced-motion and idle.
- Intro: GSAP or drei — scale group from 0.9→1 + fade; skip if reduced motion. Keep simple (a spring or gsap.from on mount).
- `<ContactShadows position={[0,0.01,0]} opacity={0.4} blur={2.4} far={6}>`.
- Labels: for each `LABEL_ANCHORS` anchor, a drei `<Html occlude center>` containing a real `<Link href={matchingLabel.href}>` styled like the current labels (font-display italic + subtext), wired to `onHover`. These are the in-canvas anchored labels; the crawlable copy lives in the wrapper fallback nav.
- Hover/active state lifted here (`useState`), passed to `HouseModel` and labels so hovering either highlights both.
- Gyro button is in the wrapper (Task 7) and calls `enableGyro` — expose via a small context or move the button here. Simplest: render the gyro button inside this scene component (below canvas, `pointer-events-auto`).

- [ ] **Step 1:** Scaffold Canvas + lights + `<HouseModel>` + ContactShadows; static camera.
- [ ] **Step 2:** Add rotation `useFrame` (a child component inside Canvas reading `rotationRef`) + idle auto-rotate.
- [ ] **Step 3:** Add intro scale-in (reduced-motion guarded).
- [ ] **Step 4:** Add `<Html>` anchored labels with real `<Link>`s + hover wiring.
- [ ] **Step 5: Typecheck** — exit 0.
- [ ] **Step 6: Commit** — `git commit -m "feat: HouseScene canvas, lighting, rotation, anchored labels"`

---

### Task 7: Rewrite IsometricHouse wrapper + delete HouseSection

**Files:** Rewrite `components/house/IsometricHouse.tsx`; delete `components/house/HouseSection.tsx`.

**Interfaces:**
- Consumes: `houseLabels` (`@/lib/constants`), `Link` (`@/i18n/routing`), `useTranslations`, `next/dynamic`.
- Produces: `export function IsometricHouse()` (unchanged import path; `app/[locale]/page.tsx` keeps working).

**Notes:**
- `const HouseScene = dynamic(() => import('./HouseScene'), { ssr: false, loading: () => <Fallback /> })`.
- Always render a crawlable `<nav aria-label="Hlavní navigace">` with the six `houseLabels` `<Link>`s. For sighted WebGL users it can be visually hidden (`sr-only`) since the anchored labels show in-canvas; but it stays in DOM/SSR for crawlers + no-JS. Keep `home.hint` text.
- Container keeps `h-[100dvh] w-full` and `bg-wood-dark` context from the page.

- [ ] **Step 1:** Write wrapper (dynamic import + fallback nav + hint).
- [ ] **Step 2:** `git rm components/house/HouseSection.tsx`.
- [ ] **Step 3: Typecheck** — exit 0.
- [ ] **Step 4: Build** — `npm run build` → succeeds (proves SSR/dynamic boundary is correct).
- [ ] **Step 5: Verify SSR nav** — `grep -o '/o-nas\|/kontakt\|/realizace' ` in built/served HTML or confirm fallback `<nav>` renders without JS.
- [ ] **Step 6: Commit** — `git commit -m "feat: IsometricHouse dynamic R3F wrapper + crawlable fallback nav"`

---

### Task 8: Visual verification + geometry iteration (acceptance gate)

**Files:** Iterate `dimensions.ts` / `HouseModel.tsx` / `HouseScene.tsx` as needed.

- [ ] **Step 1:** `npm run dev` (background).
- [ ] **Step 2:** Playwright screenshot home at desktop 1440×900 and mobile 390×844, from default + rotated angles.
- [ ] **Step 3:** Check: walls/windows/roof/gutters align; reads as a house with pergola; labels legible, not overlapping model; mobile fits and renders.
- [ ] **Step 4:** Adjust `DIMS`/anchors; repeat until correct.
- [ ] **Step 5:** Show final screenshots to the user.
- [ ] **Step 6: Commit** any geometry tuning — `git commit -m "fix: tune house geometry from visual review"`

---

## Self-Review

- **Spec coverage:** deps (T1), mapping fix (T2), parametric geometry (T3–T4), SSR dynamic + crawlable nav (T7), rotation/gyro/idle (T5–T6), anchored labels (T6), shadows/materials/lighting (T4/T6), reduced-motion (T5/T6), mobile + visual verification (T8). All spec §3–§7 covered.
- **Placeholder scan:** geometry step-bodies describe exact parts + formulas; numbers come from `GEO`. Visual tuning is expected iteration, not a placeholder.
- **Type consistency:** `active: string|null`, `onActivate:(href)=>void`, `onHover:(groupId|null)=>void`, `rotationRef.current.targetY` used consistently across T4/T5/T6. `groupId` strings match `PART_HREF` keys and `houseLabels[].groupId`.
