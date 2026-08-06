# Redesign — progress

Stav implementace task po tasku. Aktualizuje se po každém dokončeném tasku, ne až na konci.

**Legenda:** `[ ]` čeká · `[~]` rozpracováno · `[x]` hotovo a commitnuto · `[!]` blokováno

---

## Fáze 0 — Příprava

- [x] Design spec napsaný a schválený → `docs/superpowers/specs/2026-08-06-website-redesign-design.md`
- [x] Recovery infrastruktura (DECISIONS.md, HANDOFF.md, PROGRESS.md)
- [x] Audit kódové báze (sonnet subagent)
- [x] Rozhodnutí k nálezům auditu → D-011 až D-018 v DECISIONS.md
- [~] Revize implementačního plánu podle rozhodnutí
- [ ] Review a commit plánu (opus)

## Fáze 1 — Implementace

Čísla tasků odpovídají `docs/superpowers/plans/2026-08-06-website-redesign.md`.
Seznam se doplní po finalizaci plánu.

- [ ] Task 1 — Design tokeny, písma, kontrola kontrastu (viz D-012, D-014)
- [ ] Task 2 — Sdílené UI primitivy (Button, ImageFrame, Counter)
- [ ] Task 3 — Layout chrome (Header, Footer, Logo, LanguageSwitcher)
- [ ] Task 4 — 3D dům retheme desktop + oprava reduced-motion (viz D-018)
- [ ] Task 5 — Mobilní fallback domu: mřížka karet služeb
- [ ] Task 6 — Homepage: bento grid služeb místo horizontálního scrollu (viz D-013)
- [ ] Task 7 — ServicePageTemplate + 4 stránky služeb
- [ ] Task 8 — Realizace (galerie)
- [ ] Task 9 — O nás (timeline jako technický harmonogram)
- [ ] Task 10 — Kontakt (formulář, a11y, kontrast)
- [ ] Task 11 — Content sweep: em-dashe, zbylé hex literály, mrtvý kód
- [ ] Task 12 — Závěrečný pass: kontrast, reduced-motion, anti-slop, build

## Otevřené vůči klientovi

- [ ] **Skutečné IČO** — v patičce bylo vymyšlené `000 00 000`, odstraněno (D-015).
      Bez dodané hodnoty zůstane vynechané.
- [ ] **Reálné fotky** — web běží na placeholderech. `ImageFrame` má konstantu
      `hasRealAsset`; po dodání souborů do `public/images/` se přepne.

## Známé nedodělky ponechané mimo rozsah

- 3D dům má klikatelné 3 části z 6 (D-016). Komín, okna a dveře jsou dostupné jen přes
  hlavní navigaci.
