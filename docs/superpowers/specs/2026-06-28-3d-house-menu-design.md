# 3D dům jako interaktivní menu (Three.js / React Three Fiber)

**Datum:** 2026-06-28
**Komponenta:** `components/house/IsometricHouse.tsx` a okolí
**Cíl:** Nahradit současný SVG „skica" dům plně stínovaným, interaktivním 3D modelem domu
s pergolou, který slouží jako hlavní navigace homepage. Jednotlivé části domu vedou na
podstránky webu.

---

## 1. Kontext a motivace

Dnešní `IsometricHouse.tsx` vykresluje dům jako sadu SVG cest animovaných GSAP `drawSVG`.
HTML labely okolo plátna fungují jako hlavní menu webu (`<nav>` se `<Link>` tagy).

Uživatel chce přejít na **Three.js** a vykreslit **plně stínovaný 3D model domu** (stěny,
dřevěná pergola s trámy, směrové světlo + stíny), který lze otáčet a jehož části jsou
klikatelné odkazy do menu.

## 2. Rozhodnutí (potvrzená s uživatelem)

| Téma | Volba |
|------|-------|
| Vizuální styl | Plný stínovaný model (pevné stěny, dřevěné materiály, světlo + stíny) |
| Tech stack | React Three Fiber + drei (`@react-three/fiber`, `@react-three/drei`, `three`) |
| Ovládání | Drag/swipe + gyro (náklon telefonu) + jemná idle auto-rotace |
| Labely | Ukotvené k 3D částem přes drei `<Html>`, schované při zákrytu (occlude) |
| Mapování částí | viz tabulka níže (okno a komín oproti dnešku prohozené) |

### Mapování částí domu → stránky

| Část domu | Stránka |
|-----------|---------|
| Okna (`g-windows`) | `/o-nas` |
| Dveře (`g-door`) | `/kontakt` |
| Střecha (`g-roof`) | `/sluzby/pokryvacstvi` |
| Okapy (`g-gutters`) | `/sluzby/klempirstvi` |
| Komín (`g-chimney`) | `/realizace` |
| Trámy / pergola (`g-truss`) | `/sluzby/tesarstvi` |

`houseLabels` v `lib/constants.ts` se aktualizuje podle této tabulky (dnes má okno =
Realizace a komín = O nás, tedy prohozené).

## 3. Architektura

### 3.1 SSR a dynamický import
R3F nesmí běžet na serveru (Next.js App Router SSR). Proto:

- `IsometricHouse.tsx` zůstává tenký **wrapper** (`'use client'`), který přes
  `next/dynamic` s `ssr: false` načte těžkou 3D scénu.
- Během načítání se zobrazí lehký **fallback**: statická silueta/placeholder + plně funkční
  textové menu.

### 3.2 SEO a přístupnost (kritické — jde o hlavní navigaci webu)
Dnešní labely jsou skutečné `<Link>` v `<nav>` — crawlovatelné a focusovatelné. To se
**nesmí ztratit**:

- Labely v drei `<Html>` musí zůstat **skutečné `<a>`/`<Link>` tagy** s `href`, focusovatelné
  z klávesnice.
- Přidá se **fallback `<nav>`** (vždy v DOM, vizuálně skrytý / `<noscript>` varianta) se
  stejnými odkazy, aby navigace fungovala i bez WebGL / při selhání bundlu.

### 3.3 Parametrická geometrie (klíč k „vypadá to jako dům")
Jeden config `house/dimensions.ts` definuje rozměry domu, počátek vycentrovaný:

- šířka, hloubka, výška stěn
- sklon střechy, přesah okapu (eave overhang)
- rozměry a poloha pergoly (sloupky, příčné trámy)
- rozměry/rozmístění oken a dveří, komínu

**Každá část se odvozuje z těchto čísel** — hřeben střechy, okapní hrana (a na ní okapy),
výřezy oken, paty sloupků pergoly. Tím části **lícují konstrukčně**, ne ručním
dolaďováním magických čísel. To je předpoklad pro vizuální správnost i snadné ladění.

### 3.4 Části modelu
- **Základ** — nízký sokl pod stěnami
- **Stěny** — kvádr s panely / výřezy pro okna a dveře
- **Sedlová střecha** — dva nakloněné panely + dva štíty, přesah přes okapní hranu
- **Okapy** — žlab podél okapní hrany + svislý svod → klempířství
- **Komín** — hranol prorážející střechu → realizace
- **Okna** — rámy + zapuštěné sklo ve stěnách → o nás
- **Dveře** — ve štítové (vstupní) stěně → kontakt
- **Pergola s trámy** — sloupky + příčné trámy, přisazená k domu → tesařství

### 3.5 Materiály a osvětlení
- Dřevěné odstíny z brand palety (`--wood-amber`, `--cream`, tmavé tóny).
- Směrové světlo + ambientní/hemisférické dosvícení.
- Měkký kontaktní stín pod domem (drei `<ContactShadows>` nebo jeden stínový plane).
- `dpr={[1, 2]}` kvůli výkonu na mobilu.

## 4. Interakce

- **Rotace** celé skupiny domu:
  - myš drag, touch swipe,
  - gyro (náklon telefonu) — `useHouseRotation` se **přepíše**, aby rotoval 3D group/kameru
    místo CSS transformu DOM uzlu,
  - jemná **idle auto-rotace**, když uživatel neinteraguje.
- **Reduced motion:** při `prefers-reduced-motion` se auto-rotace i gyro vypnou (jako dnes).
- **Hover/klik na část:** zvýraznění části (emisivní nádech / změna materiálu) provázané
  s odpovídajícím labelem; klik naviguje na cílovou stránku.
- **Úvodní intro:** místo SVG „draw-on" jemné 3D intro (díly scale-in / dosednou), přes
  GSAP nebo drei. Respektuje reduced motion.

## 5. Labely (ukotvené k 3D + chování na mobilu)

- drei `<Html>` u kotvy každé části, `occlude` (label se schová, když je část za domem).
- Responzivní velikost: na úzkém displeji labely zmenšit a odsadit tak, aby nepřekrývaly
  dům.
- **Mobilní pojistka:** pokud screenshot v mobilním viewportu ukáže nečitelnost/překryv,
  fallback je sbalit labely do seznamu pod plátnem. Primárně se ale jde po ukotvené
  variantě dle volby uživatele.

## 6. Výkonová rozvaha

Plný stínovaný model + stíny + ukotvené `<Html>` labely je nejtěžší nabízená kombinace.
Mitigace:

- `dpr={[1, 2]}`, stíny jen jeden měkký kontaktní (ne plnohodnotné shadow-mapy všude),
- import drei komponent jednotlivě (tree-shaking),
- lazy-load celé scény (`ssr: false` + `Suspense`),
- v krajním případě na mobilu zjednodušit/vypnout stíny.

## 7. Verifikace (akceptační kritérium)

Vizuální správnost nelze ověřit čtením kódu — je to **explicitní požadavek zadání**
(„udělej vizuální kontrolu … jestli lícují stěny, okna").

Postup:
1. `next dev`
2. Screenshot přes Playwright (lokálně cachovaný chromium) v **desktop** (1440×900) i
   **mobil** (390×844) viewportu, z více úhlů rotace.
3. Vizuální kontrola: lícují stěny, okna, střecha; dům vypadá jako dům; labely čitelné a
   nepřekrývají model; na mobilu se scéna vejde a vykreslí správně.
4. Iterace na `dimensions.ts` / geometrii, dokud dům nesedí.
5. Výsledné screenshoty se ukážou uživateli.

## 8. Dotčené / nové soubory

| Soubor | Akce |
|--------|------|
| `package.json` | + `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` |
| `components/house/IsometricHouse.tsx` | Přepsat na tenký dynamic-import wrapper + fallback nav |
| `components/house/HouseScene.tsx` | **Nový** — `<Canvas>`, světla, rotace, intro, labely |
| `components/house/HouseModel.tsx` | **Nový** — parametrická geometrie všech částí |
| `components/house/dimensions.ts` | **Nový** — config rozměrů domu |
| `components/house/HouseSection.tsx` | Upravit/nahradit pro R3F mesh (hover/klik/aktivní stav) |
| `components/house/useHouseRotation.ts` | Přepsat na 3D rotaci (group/kamera) |
| `lib/constants.ts` | Opravit `houseLabels` podle nového mapování |

## 9. Mimo rozsah (YAGNI)

- Načítání externího GLTF modelu (geometrie se generuje parametricky v kódu).
- Realistické PBR textury / environment mapy (stačí brand dřevěné materiály).
- Fyzika, post-processing efekty.
- Změny obsahu cílových stránek.
