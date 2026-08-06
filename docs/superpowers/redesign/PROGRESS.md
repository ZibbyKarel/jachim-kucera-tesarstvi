# Redesign — progress

Stav implementace task po tasku. Aktualizuje se po každém dokončeném tasku, ne až na konci.

**Legenda:** `[ ]` čeká · `[~]` rozpracováno · `[x]` hotovo a commitnuto · `[!]` blokováno

---

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
- [ ] Task 7 — ServicePageTemplate + 4 stránky služeb
- [ ] Task 8 — Realizace (galerie)
- [ ] Task 9 — O nás (timeline jako technický harmonogram)
- [ ] Task 10 — Kontakt (formulář, a11y, kontrast)
- [ ] Task 11 — Content sweep: em-dashe, zbylé hex literály, mrtvý kód
- [ ] Task 12 — Závěrečný pass: kontrast, reduced-motion, anti-slop, build

## Pre-launch checklist — MUSÍ se vyřešit před nasazením

- [ ] **Skutečné IČO** — v patičce je na každé stránce vymyšlené `000 00 000`
      (`messages/cs.json` → `companyIdLabel`, totéž v `en.json`). Ponecháno jako placeholder
      na rozhodnutí uživatele (D-019, ruší D-015). V repu není žádná skutečná hodnota.
      **Nesmí jít do produkce.** IČO je v ČR povinný údaj na webu firmy a vymyšlená hodnota
      působí hůř než žádná.
- [ ] **Reálné fotky** — web běží na placeholderech. `ImageFrame` má konstantu
      `hasRealAsset`; po dodání souborů do `public/images/` se přepne.

## Známé nedodělky ponechané mimo rozsah

- 3D dům má klikatelné 3 části z 6 (D-016). Komín, okna a dveře jsou dostupné jen přes
  hlavní navigaci.
