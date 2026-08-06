# Redesign — rozhodnutí (decision log)

Append-only. Každé rozhodnutí = co, proč, kdo rozhodl, kdy.
Nikdy nemazat — pokud se rozhodnutí změní, přidej nový záznam se zdůvodněním a odkazem na starý.

---

## D-001 — Kompletně nový vizuální směr, ne oprava chyb
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
Redesign není audit-driven polish existujícího vizuálu. Jde o nový vizuální jazyk.
**Důsledek:** režim `redesign - overhaul`, ne `preserve`.

## D-002 — Vizuální směr navrhne AI, ne předpřipravená šablona
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
Nepoužívat hotové styly (`minimalist-ui`, `industrial-brutalist-ui`) jako základ.
Směr odvodit z briefu přes `design-taste-frontend`.

## D-003 — Paleta „Materiály řemesla" místo teplé krémovo-mosazné
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus), schválil uživatel s výhradou
Výchozí tokeny: zinek `#8a9296`, břidlice `#1c2226`, patina mědi `#5b8a72` (jediný akcent),
paper `#eef0ef`.
**Proč:** současná krém+mosaz+charcoal je přesně default „warm artisan" paleta, po které AI
sáhne u každé řemeslné značky. Materiálová paleta (plech, břidlice, patina) je autentičtější
a odlišitelná od konkurence.
**Výhrada uživatele:** představoval si spíš „dřevěné" barvy, ale souhlasil to zkusit takto.
**Důsledek:** VŠECHNY barvy musí jít přes tokeny (Tailwind config / CSS custom properties),
žádný hardcoded hex v komponentách — aby byla výměna palety za „dřevěnou" levná operace.
Toto je nefunkční požadavek s nejvyšší prioritou.

## D-004 — 3D dům zůstává, mění se jen jeho vizuální podání
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
`House3DScene` (Three.js) technicky beze změny. Nový vizuál = „technický výkres ožitý ve 3D":
tenké konstrukční linky, zinkové/břidlicové plochy, patina akcent na hover/aktivní část.

## D-005 — Mobilní navigace nesmí záviset na klikání do 3D scény
**Datum:** 2026-08-06 · **Rozhodl:** uživatel (identifikoval problém), řešení Claude
Malé hit-targety (okap, dveře, komín) jsou na mobilu nespolehlivé.
**Řešení:** pod domem explicitní mřížka služeb jako tapovatelné karty (min. 44×44 px).
Dům na mobilu = atmosféra/značka, ne primární ovládací prvek. Tap na část domu smí zůstat
jako bonus, ale nikdy jako jediná cesta.

## D-006 — Obsah lze měnit volně, fakta ne
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
Texty, struktura sekcí a copy jsou volné. Beze změny musí zůstat: telefony, e-maily, adresy.
Dále zachovat: URL slugy, cs/en přes next-intl, existující a11y wiring, SEO metadata + JSON-LD.

## D-007 — Big-bang implementace, ne fázované nasazení
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
Jedna větev (`redesign`), celý web přepracovaný, nasazení až po dokončení celku.
**Ale:** průběžné commity, každý commit musí projít `npm run typecheck` a `npm run lint`.

## D-008 — Implementace přes sonnet subagenty, opus dělá review
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
Opus neorchestruje čtením/psaním dlouhých souborů ani nepíše kód. Opus = quality gate,
code review, advisor. Sonnet subagenty = implementace.
**Důsledek:** každý task končí review od opuse před commitem/posunem dál.

## D-009 — Žádný nový design systém ani framework
**Datum:** 2026-08-06 · **Rozhodl:** Claude, schválil uživatel
Stack beze změny: Next.js 14 App Router + TypeScript + Tailwind v3 + GSAP.
Žádné shadcn/Radix/MUI. Vlastní komponenty v `components/ui`.

## D-010 — Recovery infrastruktura v repu
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
`docs/superpowers/redesign/` obsahuje PROGRESS.md, DECISIONS.md, HANDOFF.md pro obnovu
po výpadku session. Aktualizuje se průběžně, ne až na konci.
