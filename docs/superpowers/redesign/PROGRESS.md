# Redesign — progress

Stav implementace task po tasku. Aktualizuje se po každém dokončeném tasku, ne až na konci.

**Legenda:** `[ ]` čeká · `[~]` rozpracováno · `[x]` hotovo a commitnuto · `[!]` blokováno

---

## REDESIGN v2 — aktuální fáze

Verze 1 byla uživatelem odmítnuta jako reskin (D-030). Kostra homepage zůstala původní.
Nové zadání: dům pryč z landingu na skrytou URL, kompletně nový design, zachovat jen
faktické údaje. Řídící dokumenty:
`specs/2026-08-06-redesign-v2-drevo.md`, `plans/2026-08-06-redesign-v2.md`,
`redesign/PALETTE-WOOD.md`.

- [x] **v2/T0** — spec, plán, dřevěná paleta (14/14 kontrastních dvojic ověřeno
      výpočtem a nezávisle přepočítáno) · `af54b51`, `7b663ba`, `90e4fb3`
- [x] **v2/T1** — dřevěná paleta a písma napříč repem · `bf7523f`
      - tokeny přejmenovány `slate→timber`, `steel→oak`, `patina→ember`
      - Fraunces přidán jako display; česká diakritika ověřena cmap inspekcí (28/28 znaků)
      - review našel dvě věci, opraveno v `f123f36`:
        `--font-sans` utržený v `MenuOverlay.ts` (D-034) a plošné zvednutí
        dekorativních linek na `timber/50` (D-035, rozsah pravidla upřesněn ve specu)
- [x] **v2/T2+T3** — hlavička, patička, otvírák, rejstřík služeb, přepis `page.tsx`
      (sloučeno do jednoho tasku, je to jedna obrazovka) · `ea3c333`
      - review v prohlížeči našlo tři věci, opraveno v `4ceeed1`:
        mrtvá utilita `border-timber/12` (D-036), Fraunces s vlasovými tahy kvůli
        `font-optical-sizing: auto` (D-037), nečitelná značka v hlavičce (D-038)
- [x] **v2/T4** — homepage: realizace, postup (nová sekce), o nás, kontakt (split) · `34c1f67`
      - ověřeno v prohlížeči: všechny čtyři kroky postupu, split kontakt, faktické
        údaje v mono na tmavém poli
- [x] **v2/T5** — podstránky (služby, realizace, o nás, kontakt) · `a99b9f9`
      - `ContactSection` se stal sdílenou komponentou (volitelné `heading`,
        `description`, `showMap`); homepage ji volá bez props
      - `ServiceCard` smazán (nikdo neimportoval), `Timeline` přepsán do jazyka
        sekce Postup, filtr realizací z pilulek na textové odkazy
      - **k ověření:** že se výchozí render `ContactSection` na homepage nezměnil
- [x] **v2/T6+T7** — 404, `/nahled-3d`, úklid mrtvého kódu + závěrečný audit
      (kontrasty všech reálně použitých dvojic, mrtvé utility a proměnné, pomlčky,
      přístupnost, konzistence) · `7cf01d1` (A), viz report (B)
      - A1/A2: `app/[locale]/not-found.tsx`, `app/not-found.tsx` a `/nahled-3d`
        + `components/house3d/*` už byly v souladu, beze změny.
      - A3: smazán `Counter.tsx`, mrtvá komponenta `Button` z `Button.tsx`, prop
        `aged` z `ImageFrame`, nepoužívané exporty z `Reveal.tsx`/`lib/gsap.ts`,
        `HouseLabel`/`houseLabels`, `houseGroup`/`featured` ze `Service`, 9
        osiřelých i18n klíčů (mj. `about.heroAlt`, `about.teamAlt`) z obou jazyků.
      - B1: přeměřeny všechny reálně použité dvojice barev včetně průhledných
        variant, žádný nález nevyžadoval opravu.
      - B3: pomlčky beze změny (D-027/D-028 se nevrátily), jediné nalezené
        em/en-dashe byly v českých/jednom anglickém komentáři (D-021 výjimka).
      - B4: zobecněn focus ring na tmavém pozadí z `#mobile-menu` na
        `.bg-timber :focus-visible` (dřív 2,54:1, teď `ember-soft`), doplněny
        chybějící `aria-label` na landmarky (header, main, footer), opraveny tři
        dotykové cíle pod 44px (`LanguageSwitcher`, `ProjectGallery` zavírací
        tlačítko, `ContactForm` „odeslat další"), opraven i18n bug v
        `LanguageSwitcher` (aria-label byl natvrdo česky bez ohledu na locale).
      - B5: žádný hex mimo `lib/palette.ts`, žádné `slate`/`steel`/`patina`,
        sady klíčů `cs.json`/`en.json` identické, SEO/JSON-LD beze změny.
      - **Nalezeno, neopraveno (mimo rozsah):** vnořený `<main>` na `/nahled-3d`
        (`House3DPreview` má vlastní `<main>` uvnitř layoutového `<main>`) - mimo
        rozsah „jen barvy a písma" pro tuto stránku. `text-red-700` v
        `ContactForm.tsx` pro chybové stavy formuláře čerpá z Tailwind výchozí
        palety, ne z `lib/palette.ts` - kontrast ověřen (5,65:1 na `paper`), ale
        formálně mimo jediný zdroj pravdy; ponecháno, protože sémantická barva
        chyby by neměla splývat s dřevěnou paletou.

---

## ARCHIV — redesign v1 (hotový, ale nedostatečný)

## Fáze 0 — Příprava

- [x] Design spec napsaný a schválený → `docs/superpowers/specs/2026-08-06-website-redesign-design.md`
- [x] Recovery infrastruktura (DECISIONS.md, HANDOFF.md, PROGRESS.md)
- [x] Audit kódové báze (sonnet subagent)
- [x] Rozhodnutí k nálezům auditu → D-011 až D-018 v DECISIONS.md
- [x] Revize implementačního plánu podle rozhodnutí
- [x] Adversariální review plánu (nezávislý subagent) — 1 blokující vada + 5 oprav
- [x] Review a commit plánu (opus) → `6d3a0de`

## Fáze 1 — Implementace

Čísla tasků odpovídají `docs/superpowers/plans/2026-08-06-website-redesign.md`.
Seznam se doplní po finalizaci plánu.

- [x] Task 1 — Design tokeny, písma, kontrola kontrastu (viz D-012, D-014) → `d8499c9`
      Tokeny `paper`/`slate`/`steel`/`patina`, písma Archivo + IBM Plex Mono,
      `SITE.name` em-dash → spojovník. Všech 15 legálních dvojic prošlo AA, 4 zakázané
      dvojice ověřeny že opravdu padají. typecheck + lint čisté.
      **Pozn.:** web je od tohoto commitu vizuálně rozbitý (staré třídy `wood-*` už
      neexistují) — je to záměr, opraví se průběžně v Tascích 2-10.
- [x] Task 2 — Sdílené UI primitivy (Button, ImageFrame, Counter) → `6d0345e`
      `ImageFrame` placeholder přepsán na technický/materiálový vzor (kótovací značky +
      `tech-grid`), odstraněny 2 hex literály. `Counter` číslice na `font-mono`.
      Prop `aged` ponechán jako inertní no-op, call sites se ruší v Tascích 6/8/9.
      typecheck + lint čisté, žádný hex ani mrtvá třída v dotčených souborech.
- [x] Task 3 — Layout chrome (Header, Footer, Logo, LanguageSwitcher) → `304f08d`
      IČO placeholder ověřeně zachován i s markerem (D-019). Tmavé mobilní menu používá
      `*-soft` varianty podle párovací matice — ověřeno grepem, žádná ilegální dvojice.
      Em-dash v `aria-label` Loga opraven. typecheck + lint čisté.
- [x] Task 4 — 3D dům retheme desktop + oprava reduced-motion (viz D-018) → `d81572e`
      `MediaQueryList` se konstruuje jednou v konstruktoru, `tick()` čte jen cachovaný
      boolean, listener se odhlašuje v `dispose()` (ověřeno, že `dispose()` React opravdu
      volá při unmountu). **`npm run build` prošel** — 26 stránek vygenerováno.
      Hex literály z `HouseModel.ts` a `SceneManager.ts` pryč, kromě `setClearColor` —
      viz D-022, ten se tokenizovat nesmí.
- [x] Task 5 — Mobilní fallback domu: mřížka karet služeb → `7142c80`
      `MobileServiceGrid` (6 cílů, `min-h-[44px]`, 2 sloupce na 375px, `md:hidden`).
      Dva navigační landmarky mají různý `aria-label` (`houseNavAria` vs
      `mobileServicesNavAria`). Scroll cue odstraněn. `npm run build` prošel.
      Subagent odmítl spustit skript z plánu, který by přeformátoval celý JSON —
      diff je 1 řádek na soubor místo ~150 řádků whitespace churnu.
- [x] Task 6 — Homepage: bento grid služeb místo horizontálního scrollu (D-013) → `5b82824`
      `ServicesScroll.tsx` smazán (-172 řádků), `ServicesGrid.tsx` vytvořen. Ověřeno proti
      zdroji, že `StackCover` defaultuje `pin = true` a že `ServicesScroll` neměl jiné
      importéry. Bento: 1 featured buňka přes 3 řádky + 3 vedlejší, 0 prázdných buněk,
      1 sloupec pod 768px. `ServiceCard.tsx` zbaven hexů a legacy tříd.
      Realizace na homepage 6 → 4. `npm run build` prošel (26 stránek).
- [x] Task 7 — ServicePageTemplate + 4 stránky služeb → `c245cf6`
      „Co zahrnuje" přepsáno z ohraničených karet na `divide-y` řádky v mono registru
      (jeden dělič mezi řádky, ne hairline kolem každého). 4 route soubory ověřeny —
      nepotřebovaly změnu. 1 eyebrow na 5 sekcí. `npm run build` prošel.

- [x] **Oprava mimo plán** — natvrdo zapsané `rgba(28,34,38,…)` stíny ve 4 sekcích
      z Tasku 6 (`ServicesGrid`, `AboutSection`, `ContactSection`, `ProjectsPreview`) → `fdf5fc6`
      Je to hodnota tokenu `slate`, tedy paletová barva v komponentě → porušení D-003.
      Propásla to moje kontrola, viz D-023. Nahrazeno `.shadow-panel-{12,14,20}` nad
      `color-mix()`, tedy bez druhé kopie barvy. Ekvivalence doložena výpočtem
      (premultiplied alpha), ne odhadem.
- [x] Task 8 — Realizace (galerie) → `a5eabcb`
      Mřížka s proměnlivým poměrem stran (každá pátá karta na výšku), filtrovací taby,
      modal. Ověřeno: modal panel je **světlý** (`bg-paper`), tmavý je jen scrim — žádná
      past na párovací matici, jak jsem čekal. Sada i18n klíčů beze změny.
      `realizace/page.tsx` tím vypadl ze seznamu souborů s legacy třídami.
      **Nedodělek k rozhodnutí:** modal nemá focus trap ani návrat fokusu na spouštěč
      (stav před redesignem, subagent ho záměrně tiše nepřidával). Řeší se v Tasku 12.
- [x] **Oprava mimo plán** — jeden zdroj pravdy pro paletu (D-024) → `f4d0146`
      `lib/palette.ts` je jediný soubor s hex hodnotami palety. `tailwind.config.ts` a
      `house3d/config.ts` z něj importují, `:root` blok v `globals.css` zrušen a jeho
      konzumenti přešli na `theme()`. Ověřeno porovnáním vygenerovaného CSS před/po —
      vypočtené barvy identické. Výměna palety za „dřevěnou" je teď úprava jednoho souboru.
- [x] **Oprava mimo plán** — visící CSS proměnné (D-025, D-026) → `56e9e6b`
      `MenuOverlay.ts` sahal po `--font-body` i `--font-display`, ani jedna nikdy
      neexistovala. `--font-display` měl fallback `Georgia, serif`, takže názvy služeb
      v menu 3D domu renderovaly serifovou kurzívou na homepage. Provedeno i systematické
      ověření všech `var()` v repu proti definicím.
- [x] Task 9 — O nás (timeline jako technický harmonogram) → `d5b5444`
      Odstraněno falešné číslování hodnot (`01`, `02`…), dekorativní tečka Timeline
      nahrazena kótovací značkou. Obě stránky jsou celé na světlém pozadí, takže se
      `*-soft` varianty vůbec nepoužívají a párovací matici nelze porušit.
      Subagent správně nechal em-dashe v `messages/*.json` na Task 11, aby se diff
      nedělal dvakrát.
- [x] Task 10 — Kontakt (formulář, a11y, kontrast) → `c8c9f9e`
      Poslední soubory se starou „cream/gold" paletou přebarveny; SVG mapa přešla na
      `currentColor` + třídy místo `var()`, což se ukázalo jako správné, protože `:root`
      mezitím zaniklo (D-024). A11y doplněno nad rámec plánu: nativní `required`,
      `role="alert"` na chyby polí, `aria-busy` a ohlašovaný loading stav.
      Faktické údaje (telefon, e-mail, oblast) ověřeně beze změny.
      `text-red-700` pro validační chyby je legální výjimka, plán ji uvádí s kontrastem
      5,65:1 na `paper`. Sémantická barva chyby nemá jít s paletou.
- [~] Task 11 — Content sweep: pomlčky, zbylé hex literály, mrtvý kód
      Pozor na dva různé soubory: `app/[locale]/not-found.tsx` **i** `app/not-found.tsx`
      v kořeni. Oba mají vlastní legacy paletu, plán zmiňuje jen ten první.
- [x] Task 12 — Závěrečný pass → `f7223ae`, `fcba70e`, `c89523c`
      **Nejcennější nález celého redesignu:** přeměření kontrastu odhalilo ~20 padajících
      dvojic. Task 1 ověřoval jen plné tokeny, jenže Tasky 2-11 zavedly průhledné varianty
      (`text-slate/40`, `border-slate/25` …), které nikdy nikdo neměřil. Nejhorší případ
      1,65:1 při požadovaných 4,5:1. Opraveno zvýšením krytí, ne změnou tokenů.
      Dále: 8 mezerníkových spojovníků (D-028), focus trap a návrat fokusu v modalu galerie.
      Reduced-motion: všech 8 animací má guard, ověřeno jednotlivě.
- [x] **Oprava mimo plán** — název firmy ve strukturovaných datech → `07e528a`
      JSON-LD `LocalBusiness.name` používá `SITE.shortName` (`Jáchim & Kučera`) místo
      `SITE.name`, který za redesign prošel třemi úpravami interpunkce. Neznáme oficiální
      znění názvu, a vymyšlená interpunkce ve strukturovaných datech je horší než žádná —
      agregátoři a mapové služby ji porovnávají s rejstříkovými zápisy.
- [x] **Vizuální kontrola v prohlížeči (opus)** — viz „Nálezy z vizuální kontroly" níže

## Nálezy z vizuální kontroly v prohlížeči

Kontrolováno na `localhost:4317`, Chrome, skutečná GPU (Apple M5 přes Metal, 4× MSAA, DPR 2).

**Funguje podle návrhu:**
- Hero, typografie (Archivo kurzíva v nadpisu), akcent patiny na CTA.
- Header je na hero záměrně skrytý (`nav` má `opacity: 0`) a naskakuje při scrollu. Není to
  vada, je to chování `HeroScroll`.
- Bento grid služeb: 2 sloupce × 3 řádky, featured buňka `548 × 1135` přes tři řádky,
  tři vedlejší buňky ve druhém sloupci. Odpovídá D-013.
- Pět navigačních landmarků, každý s vlastním `aria-label`. Mobilní mřížka služeb má
  6 cílů s `min-height: 44px` ve dvou sloupcích (požadavek uživatele na mobilní navigaci).

**Vada (starší než redesign):** 3D dům se nevykresluje, viz D-029. Ověřeno proti stavu před
Taskem 1 v samostatném worktree — vykreslení je totožné.

**Co se v tomto prostředí ověřit NEPODAŘILO:** skutečná mobilní šířka. Prohlížeč má viewport
odpojený od velikosti okna (`outerWidth` 784, ale `innerWidth` zůstává 1920), takže se
media queries nepřepnou. Mobilní mřížka je ověřená strukturálně (DOM, třídy, `min-height`),
ne pohledem. **Zbývá zkontrolovat na skutečném telefonu nebo v device toolbaru.**

## Pre-launch checklist — MUSÍ se vyřešit před nasazením

- [x] ~~**Skutečné IČO**~~ — vyřešeno 2026-08-07. Klient dodal údaje obou OSVČ:
      Petr Jáchim (IČO 47748303) a Milan Kučera (IČO 29640113). Obě prošla kontrolní
      číslicí i ověřením v ARES (jména sedí, forma 101). Žijí v `lib/constants.ts`
      jako `people`, viz D-046 (ruší D-019). Zobrazuje je patička, kontaktní panel
      i `/o-nas`.
- [ ] **Skutečný e-mail a doména** — `SITE.email` (`info@jachim-kucera-tesarstvi.cz`)
      a `SITE.url` (`https://jachim-kucera-tesarstvi.cz`) jsou vymyšlené od prvního
      commitu. V kódu mají u sebe komentář „nesmí jít do produkce" (D-047).
      **Poslední vymyšlené údaje na webu.**
- [ ] **Rok založení** — `FOUNDED_YEAR = 2008` v `components/sections/Opener.tsx` je
      odvozený z `about.timeline`, není to dodané datum. ARES uvádí u Petra Jáchima
      vznik živnosti 2003, u Milana Kučery datum výrazně pozdější. Ani jedno neumíme
      vyložit jako „rok založení firmy". Souvisí s tvrzením „přes patnáct let"
      v `about.story` a s údaji v `about.stats`. **Potvrdit s klientem.**
- [ ] **Reálné fotky** — web běží na placeholderech. `ImageFrame` má konstantu
      `hasRealAsset`; po dodání souborů do `public/images/` se přepne.
- [x] ~~**3D dům se nevykresluje** (D-029)~~ — vyřešeno. Dům se vykresluje postupně,
      potvrdil uživatel. Z homepage odešel na `/nahled-3d` (redesign v2) a na titulní
      stránku se vrátil jen jako neinteraktivní dekorace vpravo dole (D-043, D-044).
- [ ] **Oficiální název firmy** — srovnáno s rejstříkem 2026-08-07: **žádný zapsaný
      subjekt „Jáchim & Kučera" neexistuje**, jsou to dvě fyzické osoby podnikající.
      `SITE.name` je tedy obchodní označení, ne zapsaný název, a interpunkce je pořád
      naše. Povinné identifikační údaje nese patička (obě jména + obě IČO), takže
      právní minimum je splněné, viz D-046. Zbývá jen potvrdit s klientem, že chce
      web prezentovat pod tímhle společným označením.
- [ ] **„Záruka 10 let"** v certifikátech na stránce O nás — neověřené tvrzení, může být
      pozůstatek staršího textu. Potvrdit s klientem, nebo odstranit.
- [x] ~~**Mobilní zobrazení pohledem**~~ — ověřeno na viewportu 281 px (užší než
      iPhone SE): žádné horizontální přetečení, rejstřík služeb funguje jako navigace,
      logo v hlavičce čitelné, dotykové cíle 44 px.

## Známé nedodělky ponechané mimo rozsah

- 3D dům má klikatelné 3 části z 6 (D-016). Komín, okna a dveře jsou dostupné jen přes
  hlavní navigaci.
- Modal galerie realizací nemá focus trap (Tab uteče na stránku pod ním) ani návrat fokusu
  na spouštěcí tlačítko po zavření. Je to stav zděděný z původního kódu, ne regrese
  redesignu. `role="dialog"`, `aria-modal`, `aria-label`, Escape a zamčený scroll fungují.
  K dořešení v Tasku 12.


---

## Doladění po redesignu v2 (2026-08-06, po zpětné vazbě uživatele)

Uživatel nahlásil dvě věci: (1) logo v patičce není dobře čitelné, (2) hero sekce má
prázdný pravý dolní kvadrant, kam by šel dát zmenšený neinteraktivní 3D dům
(„na mobilu asi nepřidávat").

- [x] **Logo** — dvě nezávislé vady: špatný poměr stran (širokoúhlý lockup renderovaný
      jako kulatý odznak, D-041) a tmavý inkoust na tmavém poli (D-042). Opraveno
      sizingem podle výšky + vygenerovanou světlou variantou `public/logo-paper.png`.
      Commity `4503c4a`, `e3f5535`.
- [x] **Dekorativní 3D dům v hero** — `interactive={false}` režim scény, mount jen na
      desktopu přes `matchMedia`, vlastní `FIT_MARGIN_DECOR` (D-043), vazba na textový
      sloupec (D-044). Commity `3df85a8`, `9e2b1ec`, `6644d3f`.
- [x] **Produkční build** — prošel, 26 stránek, nula warningů.

## Doladění 2 (2026-08-07, po druhé zpětné vazbě)

Uživatel nahlásil: (1) dům je oříznutý, (2) může být trochu větší, (3) hero nadpis
klidně menší. Navíc dodal skutečné údaje o lidech ve firmě.

- [x] **Skutečné údaje obou OSVČ** — Petr Jáchim a Milan Kučera, obě IČO i telefony.
      Data žijí v `lib/constants.ts` (`people`), zobrazuje je patička, kontaktní panel,
      JSON-LD i nová sekce na `/o-nas`. Obě IČO ověřena kontrolní číslicí a v ARES.
      Vymyšlené `+420 777 123 456` z repa zmizelo. D-046, D-047. Commit `ac7a9e6`.
- [x] **Neplatné HTML v `<dl>`** — nalezeno při code review, D-048. Commit `947aadd`.
- [x] **Ořez domu** — tři nezávislé příčiny (ruční odhad rozměrů, fit na skrytý plot,
      fantomové rohy AABB), viz D-049. Commity `52b4b7f`, `366506c`.
- [x] **Větší dům** — výplň rámu z 45 %/57 % na 64 %/85 %, okraje vyrovnané.
      Ověřeno měřením inkoustu ve screenshotech, ne pohledem.
- [x] **Menší hero nadpis** — `clamp(2.75rem,7vw,6.5rem)` → `clamp(2.5rem,5.5vw,5rem)`.
- [x] **Vrstva domu** — `w-[clamp(260px,24vw,345px)]`, `bottom-28` (dřívější `bottom-24`
      nechávalo plátno překrývat řádek CTA o ~8 px, starší vada).
- [ ] **Popisky vs. dům na `/nahled-3d` při 1024 px** — nedořešeno, viz D-050. Řešitelné
      jen změnou rozvržení v `MenuOverlay`, ne kamerou. Skrytá URL, netýká se hero.

**Zbývá potvrdit klientovi:** e-mail a doména (poslední vymyšlené údaje), rok založení
(web tvrdí 2008, ARES uvádí u Petra Jáchima 2003), tvrzení „15+ let praxe" a
„150+ realizací", „Záruka 10 let" na `/o-nas`.
