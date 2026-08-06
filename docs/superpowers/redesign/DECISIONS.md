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

---

# Rozhodnutí po auditu kódové báze (2026-08-06)

Audit odhalil rozpory mezi specem a realitou. Následující rozhodnutí je řeší.

## D-011 — Em-dash v `SITE.name` se mění na spojovník
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
`lib/constants.ts:4` obsahuje `'Jáchim & Kučera — Tesařství'`, což propaguje do každého
`<title>`, OG/Twitter karet, JSON-LD a patičky.
**Proč:** je to interpunkce v title stringu, ne fakt ze seznamu chráněných údajů (telefon,
e-mail, adresa). Pravidlo nula em-dashů má přednost. Vratné jednou řádkou.

## D-012 — Kontrola kontrastu se přesouvá z Tasku 12 do Tasku 1
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Audit spočítal, že `steel` na `paper` dává ~2,6:1 → neprojde WCAG AA.
**Proč:** tokeny jsou základ, který konzumuje všech 11 následujících tasků. Ověřovat je až
na konci znamená postavit celý web na vadném základu a pak přebarvovat všechno.
**Důsledek:** Task 1 musí skriptem změřit všechny reálně použité dvojice popředí/pozadí a
hex hodnoty upravit tak, aby prošly AA (4,5:1 běžný text, 3:1 velký text). Spec explicitně
říká, že hex hodnoty jsou výchozí bod k doladění — autorita k úpravě existuje.
Task 12 si ponechává závěrečné přeověření.

## D-013 — Sekce služeb: přepsat na statický bento grid, GSAP horizontální scroll smazat
**Datum:** 2026-08-06 · **Rozhodl:** uživatel (na doporučení opuse)
Spec chtěl bento grid, ale kód má horizontální scroll-hijack s dokumentovaným minulým pádem
(pin-spacer reparenting při navigaci v App Routeru).
**Proč:** návštěvník řemeslného webu chce mít odpovězeno „děláte okapy?" za dvě vteřiny —
skenovatelná asymetrická mřížka to řeší lépe než nucený horizontální průchod. Smazáním
křehkého kódu navíc mizí zdroj minulého bugu, místo abychom kolem něj stavěli.
**Důsledek:** ověřit, jestli na pinování `ServicesScroll` není navázaný `StackCover`.

## D-014 — Písma: vybrat charakternější pár, ověřit českou diakritiku
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
Spec zmiňoval Cabinet Grotesk/Satoshi, ty ale nejsou na Google Fonts (Fontshare licence +
self-hosting). Návrh Hanken Grotesk + IBM Plex Mono byl vyhodnocen jako bezpečný, ale
neutrální.
**Požadavky:** `next/font/google`, ověřená (ne předpokládaná) podpora ř ů ě ť ď ň, pravá
kurzíva u display řezu, žádný Inter, žádný serif.

## D-015 — Fake `IČO 000 00 000` odstranit, skutečné dodá klient
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus), potvrzeno uživateli
Patička renderuje vymyšlené IČO na každé stránce.
**Proč:** fabrikovaný údaj je horší než žádný. IČO na webu firmy ale být má (zákonná
náležitost v ČR) — proto se na místě odstranění nechává komentář, že skutečnou hodnotu má
dodat klient. Nevymýšlet náhradu.

## D-016 — 3D dům zůstává se 3 klikatelnými částmi
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
Dům má klikatelné jen střechu, pergolu a okapy; komín, okna a dveře nejsou ve scéně
nawirované, ačkoliv labely existují (6 v `lib/constants.ts`, 3 v `house3d/config.ts`).
**Proč:** stávající nedodělek, ne nová regrese. Chybějící cíle jsou dostupné přes hlavní
navigaci. Rozšíření na 6 je práce v Three.js modelu — mimo rozsah tohoto redesignu.

## D-017 — Mrtvý kód `components/house/IsometricHouse.tsx` se maže
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Audit potvrdil nula importérů. Obsahuje navíc hardcoded hex barvy, které by jinak zůstaly
v repu jako matoucí falešná stopa při příští výměně palety.

## D-018 — Chybějící `prefers-reduced-motion` u idle animace domu je bug k opravě
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Idle float/breathing/light-drift smyčka 3D domu nemá guard; má ho jen úvodní animace.
**Proč:** spec vyžaduje respektování `prefers-reduced-motion` všude. Není to nová
funkcionalita, je to oprava existující vady odhalené auditem. Řeší Task 4.
