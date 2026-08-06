# Kompletní redesign webu — vizuální jazyk „Materiály řemesla"

**Datum:** 2026-08-06
**Rozsah:** Celý web (homepage, 4× služby, realizace, o nás, kontakt, `/nahled-3d`)
**Režim:** Redesign - overhaul (vizuál od nuly, obsah/struktura volně upravitelné, fakta a IA v jádru zachovány)
**Skilly použité při návrhu:** `design-taste-frontend` (brief inference, anti-slop pravidla), doplňkově `impeccable` a `high-end-visual-design` pro implementační fázi

---

## 1. Kontext a motivace

Současný web (Next.js 14 + Tailwind + GSAP, next-intl cs/en) má funkční architekturu a
silný unikátní prvek — interaktivní 3D dům jako navigaci (viz
[2026-06-28-3d-house-menu-design.md](2026-06-28-3d-house-menu-design.md)) — ale vizuálně
používá světlou krémovo-mosaznou paletu (`wood.dark #e9e6e0`, `wood.light #c49a4c`,
`charcoal #2d2b28`) odvozenou z loga. Tato kombinace (teplý krém + mosaz + charcoal) je
zároveň přesně ten výchozí vzorec, ke kterému defaultně sahá generický AI redesign
řemeslné/artisan značky — je funkční, ale nerozlišitelná od jiných "warm craft" webů.

Uživatel chce kompletní vizuální redesign s volnou rukou i pro obsah, strukturu a samotný
koncept hero sekce. Jediné pevné body:

- Zachovat fakta: telefon, e-mail, adresa.
- Zachovat cs/en přepínání přes next-intl.
- Zachovat URL strukturu a routing.
- Implementace jako jedna větev, celý web najednou (big-bang), ne fázovaně.

## 2. Design Read

> Redesign-overhaul lokálního trust-first řemeslného webu (tesařství/pokrývačství/
> klempířství) pro majitele domů v Plzeňském kraji, s materiálově-poctivým
> industriálně-technickým jazykem — vědomě odlišným od defaultní "warm artisan"
> (krém+mosaz+espresso) palety, kterou by AI zvolila automaticky.

**Dial hodnoty:**

| Dial | Hodnota | Zdůvodnění |
|---|---|---|
| `DESIGN_VARIANCE` | 7 | Redesign-overhaul, asymetrické kompozice, ale ne artsy chaos — trust-first publikum |
| `MOTION_INTENSITY` | 6 | Zachovává živost existujících GSAP scroll interakcí, bez cinematic přehlcení |
| `VISUAL_DENSITY` | 3 | Vzdušné, důvěryhodné, ne "cockpit" — lokální služba, ne SaaS dashboard |

## 3. Vizuální jazyk — „Materiály řemesla"

### 3.1 Paleta

Odvozená ze skutečných materiálů firmy (plech, břidlice, patina mědi) místo generické
teplé krémovo-mosazné kombinace. Studenější, technický, důvěryhodný dojem.

| Token (návrh, ladí se v implementaci) | Hex (výchozí bod) | Role |
|---|---|---|
| `steel` / zinková šeď | `#8a9296` | Základní neutrál, odkaz na klempířský plech |
| `slate` / břidlicová tmavá | `#1c2226` | Text, hluboké plochy, ne čistá černá |
| `patina` / patina mědi | `#5b8a72` | **Jediný akcent** — CTA, aktivní stavy, hover na domu |
| `paper` / světlý neutrál | `#eef0ef` | Světlé plochy, ne teplý krém |

Pravidlo konzistence: jeden akcent (`patina`) použitý identicky napříč celým webem, žádné
druhotné barvy pro CTA. Přesné hex hodnoty se doladí až v implementaci (kontrast WCAG AA,
tmavý režim) — tokeny lze měnit kdykoliv později beze změny struktury.

### 3.2 Typografie

- Bez serifu jako defaultu (serif by byl klišé "řemeslo = starosvětské písmo").
- Display/nadpisy: grotesk s charakterem (např. Cabinet Grotesk / Satoshi třída).
- Čísla, specifikace, kontaktní údaje: technický mono řez — odkaz na technický výkres.
- Emphasis v nadpisech: kurzíva/tučné stejného řezu, nikdy míchání rodin písma.

### 3.3 Materiálový motiv

Tenké konstrukční linky, kótovací značky, technické popisky — používané **funkčně** (kóty
rozměrů u realizací, specifikace materiálu), ne jako plošná dekorace navíc.

### 3.4 Placeholder obrázky

Reálné fotky nejsou k dispozici (stejně jako dnes). `ImageFrame` placeholder se
přepracovává tak, aby vypadal jako záměrný technický/materiálový vzor (ne "chybí
obrázek").

## 4. Hero — interaktivní 3D dům

Dům (`House3DScene`, viz existující spec) zůstává **technicky beze změny** — mění se jeho
vizuální podání a doplňuje se mobilní chování.

### 4.1 Desktop

- Vizuál domu se přeorientuje na "technický výkres ožitý ve 3D": tenké konstrukční linky,
  plochy v zinkové/břidlicové paletě, `patina` akcent na aktivní/hover části.
- Interakce (klik na část domu → navigace na službu, viz mapovací tabulka ve spec 2026-06-28)
  zůstává funkčně stejná.
- Hero layout je asymetrický (dům jako hlavní asset vlevo/vpravo), ne vycentrovaný text
  přes celou šířku. Nadpis max 2 řádky, podtext max 20 slov, jedno CTA.

### 4.2 Mobil (< 768px)

Klikání do malých částí 3D scény je na mobilu nespolehlivé (drobné hit-targety). Řešení:

- 3D dům zůstává vizuálně přítomný, zmenšený, buď statický pohled nebo pomalá idle
  auto-rotace — funguje jako značka/atmosféra, ne jako primární ovládací prvek.
- Pod domem se renderuje **explicitní seznam/mřížka služeb** jako tapovatelné karty
  (ikona + název, min. 44×44 px dotyková plocha) — to je na mobilu skutečná navigace.
- Mapování karet odpovídá stejné tabulce část domu → stránka ze spec 2026-06-28.
- Progressive enhancement: pokud tap přímo na část domu funguje spolehlivě, zůstává jako
  bonus, ale kartový seznam je jediná garantovaná cesta k navigaci na mobilu.
- Existující fallback `<nav>` (vždy v DOM pro SEO/a11y, viz spec 2026-06-28) se vizuálně
  sladí s kartovým seznamem na mobilu — nejde o duplicitní strukturu navíc.

## 5. Struktura stránek

IA, URL struktura a fakta se nemění. Kompozice a vizuál v novém jazyce:

- **Homepage** — hero s domem → služby jako asymetrický bento (1 větší dlaždice + zbytek
  menší podle priority, ne 3 identické karty) → výběr 3-4 nejlepších realizací → krátká
  důvěra/o firmě sekce (bez duplicity s `/o-nas`) → kontakt CTA.
- **4× služby** (`tesařství`, `pokrývačství`, `klempířství`, `čištění střech`) — sdílená
  `ServicePageTemplate` dostává nový vizuál: hero služby → obsah → specifikace/postup v
  mono-technickém stylu (ne odrážkový seznam) → realizace dané služby → CTA.
- **Realizace** — filtrovatelná galerie zůstává funkčně stejná, mřížka s různými poměry
  stran místo uniformního gridu.
- **O nás** — příběh + timeline jako koncept zůstává, timeline dostává grafické zpracování
  v technickém stylu (harmonogram/výkres místo civilního textového bloku).
- **Kontakt** — formulář a fakta beze změny obsahu, nový vizuál, validace/chybové stavy
  podle a11y pravidel (label nad inputem, chyba pod inputem, kontrast WCAG AA).

## 6. Pohyb a interakce

- GSAP zůstává pro scroll-vázané momenty (horizontální scroll služeb, parallax) — mechanika
  beze změny, jen nový vizuál.
- Jemné scroll-reveal animace při vstupu sekcí do viewportu.
- Hover/tap feedback na interaktivních prvcích, bez "magnetických" efektů (neodpovídá
  lokální řemeslné firmě).
- `prefers-reduced-motion` respektováno všude (současný stav se zachovává).
- Žádné scroll cues, verzovací pásky, sekční číslování ani jiné dekorace navíc (anti-slop
  pravidla z `design-taste-frontend`).

## 7. Přístupnost a i18n

- Zachovat současné a11y výhody: `role`/`aria-label`/keyboard ovládání na interaktivních
  částech domu, viditelný focus ring, skip-link, sémantický HTML.
- Kontrast nové palety ověřit na WCAG AA (text i CTA) v implementaci.
- cs/en přes next-intl beze změny, texty lze přepsat volně (zachovat fakta).

## 8. Rozsah implementace

- Stack beze změny: Next.js 14 (App Router) + TypeScript + Tailwind CSS v3 + GSAP.
  Žádný nový design systém (žádné shadcn/Radix/atd.) — vlastní komponenty v `components/ui`.
- **Big-bang**: jedna větev, design tokeny + sdílené komponenty (`Button`, `ServiceCard`,
  layout primitives) + všechny stránky přepracované najednou, nasazeno až po dokončení
  celku.
- Sdílené komponenty se přepracují jednou a použijí konzistentně na všech stránkách.
- Mimo rozsah: změna tech stacku, změna URL struktury, změna kontaktních údajů, ztráta
  existující a11y/SEO wiring 3D domu (viz spec 2026-06-28).

## 9. Otevřené otázky pro implementační plán

- Přesné hex hodnoty tokenů a jejich kontrastní ověření (WCAG AA/AAA).
- Konkrétní výběr fontů (licence, `next/font` dostupnost) pro grotesk display + mono.
- Detailní vizuál 3D materiálů domu (shading, textury) v `House3DScene`/`HouseModel`.
- Konkrétní obsah bento mřížky služeb na homepage (priorita služeb).
