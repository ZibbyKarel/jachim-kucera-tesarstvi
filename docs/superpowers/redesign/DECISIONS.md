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

## D-023 — Kontrolní grepy musí selhat hlasitě, ne tiše
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus) — poučení z propásnuté vady
Při ověřování Tasku 6 mi grep spadl na chybu zsh globbingu (`no matches found: --include=*.tsx`).
Chybová hláška zapadla mezi ostatní výstup a já z jiného řádku odečetl „čisté".
Důsledkem prošly čtyři komponenty s natvrdo zapsaným `rgba(28,34,38,…)` ve stínech —
což je přesně hodnota tokenu `slate`, tedy paletová barva v komponentě (porušení D-003).
**Platí:** ověřovací příkazy psát tak, aby prázdný výsledek šel odlišit od pádu příkazu
(`|| echo "clean"` na konci, ne spoléhat na to, že prázdný výstup znamená úspěch).
U vzorů, které se opakují napříč tasky, kontrolovat celý repozitář, ne jen soubory
dotčené posledním commitem — regrese vzniká i v už „hotových" souborech.

## D-022 — Zákaz hex literálů se týká paletových barev, ne fyzikálně významných hodnot
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus) — druhá oprava vlastního přespecifikování
Pravidlo „nula hex literálů v komponentách" jsem formuloval absolutně. Task 4 na to narazil
u dvou hodnot, které barvami palety nejsou:
- `SceneManager.ts:99` → `setClearColor(0x000000, 0)` — alfa je 0, takže jde o *průhledné*
  pozadí canvasu. Sémanticky to znamená „nic", ne „černá".
- `DirectionalLight` / `AmbientLight` s `0xffffff` — barva světelného zdroje, ne povrchu.

**Platí:** tokenizovat se musí barvy, které se mění při výměně palety. Fyzikálně významné
hodnoty (bílé světlo, průhledné pozadí) smějí zůstat literálem s komentářem.
**Důsledek pro Task 11:** hex sweep **nesmí** sáhnout na `SceneManager.ts:99`. Nahrazení
`0x000000` paletovým tokenem by canvas přestal být průhledný a rozbilo by to hero sekci.
Task 4 přidal `COLORS.white` pro barvy světel — to je akceptovatelné, ale musí u něj zůstat
komentář, že se při přechodu na dřevěnou paletu **nemění**.

## D-021 — Zákaz em-dashů platí jen pro uživatelsky viditelný text, ne pro komentáře v kódu
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus) — oprava vlastního přespecifikování
Při zadávání Tasku 1 jsem požadoval nulu em-dashů „včetně komentářů v kódu v češtině".
To bylo nesprávné rozšíření pravidla.
**Proč:** pravidlo existuje proti AI-slop v *renderovaném* textu. Komentáře v kódu se
uživateli nikdy nezobrazí a česká typografie pomlčku legitimně používá. Vynucovat tam
spojovník je pedantství, které nic nezlepšuje a jen plodí zbytečné diffy.
**Platí:** nula em-dashů ve všech uživatelsky viditelných řetězcích — `messages/*.json`,
JSX text, `aria-label`, `alt`, `title`, metadata, chybové hlášky. V komentářích v kódu
jsou povolené.

## D-020 — Tokeny mají závaznou párovací matici, ne jen seznam hodnot
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Nezávislé přeměření potvrdilo všech 7 poměrů, které plán tvrdil (přesně na setiny), ale
odhalilo tři dvojice, které plán neuvádí a které padají:

| dvojice | poměr | verdikt |
|---|---|---|
| `steel` na `slate` | 2,75:1 | propadá i pro velký text |
| `patina` na `slate` | 2,73:1 | propadá i pro velký text |
| `patina-soft` na `slate-soft` | 3,79:1 | propadá pro běžný text, projde pro velký |

**Proč to vadí:** `steel` a `patina` jsou laděné na světlé pozadí, `*-soft` varianty na tmavé.
Nic ale nevynucuje, aby se nepoužily obráceně. `patina-soft` na `slate-soft` je navíc velmi
pravděpodobná kombinace (akcentový text na vyvýšené tmavé kartě) a tichý propadák.
**Řešení:**
1. `patina-soft` se posouvá `#61947a → #74a48c` (4,67:1 na `slate-soft`, 5,69:1 na `slate`).
2. Plán musí obsahovat **párovací matici** — které tokeny popředí jsou legální na kterých
   pozadích — jako globální omezení, které dodržuje každý task. Nestačí seznam hex hodnot.
**Poznámka:** ověřovací skript nepatří do repa; kontrola se opakuje v Tasku 12.

## D-019 — Placeholder IČO zůstává (RUŠÍ D-015)
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
Ověřeno grepem: skutečné IČO se v repu nikde nevyskytuje, jediný výskyt je placeholder
`IČO 000 00 000 · Plzeňský kraj` v `messages/cs.json:19` a `companyIdLabel` v `en.json:19`.
Uživatel rozhodl placeholder zatím ponechat.
**Nahrazuje D-015**, který ho chtěl odstranit.
**Podmínka:** hodnota musí být v kódu i v pre-launch checklistu zřetelně označená jako
placeholder, aby nemohla nasadit omylem. IČO je v ČR povinný údaj na webu firmy a vymyšlená
hodnota působí na návštěvníka hůř než žádná — proto to nesmí projít do produkce tiše.

## D-018 — Chybějící `prefers-reduced-motion` u idle animace domu je bug k opravě
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Idle float/breathing/light-drift smyčka 3D domu nemá guard; má ho jen úvodní animace.
**Proč:** spec vyžaduje respektování `prefers-reduced-motion` všude. Není to nová
funkcionalita, je to oprava existující vady odhalené auditem. Řeší Task 4.

## D-024 — Paleta má mít jediný zdroj pravdy (`lib/palette.ts`)
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus), z vlastní kontroly
Po Tasku 8 jsem zjistil, že stejné hex hodnoty palety žijí ve **třech** kopiích:
`tailwind.config.ts` (`theme.extend.colors`), `app/globals.css` (`:root` blok, jehož
komentář sám přiznává „zrcadlí tailwind.config.ts") a `components/house3d/config.ts`
(`COLORS`).
**Proč to vadí:** uživatel schválil tuhle paletu jen podmíněně — chtěl „dřevěné" barvy a
přijal materiálovou s tím, že tokeny jdou vyměnit. Výměna palety proto musí být úprava
jednoho souboru. Tři kopie znamenají tři místa na drift a trojúpravu.
**Řešení:** `lib/palette.ts` jako jediný zdroj hex hodnot; `tailwind.config.ts` a
`house3d/config.ts` z něj importují; `:root` v `globals.css` se ruší a jeho konzumenti
přecházejí na Tailwind funkci `theme()`.
**Výjimka:** `COLORS.white = 0xffffff` zůstává mimo paletu — je to neutrální bílá pro
Three.js světla, která nemá zteplat spolu s dřevěnou paletou.
**Poznámka k mému vlastnímu procesu:** tuhle duplicitu jsem schválil už v Tasku 1. Vzniklo to
tím, že jsem kontroloval *hodnoty* (kontrast seděl přesně), ne *počet míst, kde hodnoty žijí*.
Kontrola tokenů musí zahrnovat i otázku „kolik souborů se musí změnit při výměně palety".

## D-025 — `--font-body` je mrtvá proměnná v 3D overlayi
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
`components/house3d/MenuOverlay.ts` sahá po `var(--font-body, system-ui, sans-serif)`, jenže
`--font-body` nikde neexistuje (Task 1 zavedl `--font-sans` a `--font-mono`). Overlay tedy
tiše renderuje system-ui místo Archivo. Fallback maskuje vadu, takže se to vizuálně jeví jako
„skoro správně". Opravuje se spolu s D-024.

## D-026 — `var()` na neexistující proměnnou je tichá vada, patří do ověřovacího rituálu
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Redesign vyměnil sadu tokenů a v kódu zůstaly odkazy na proměnné, které zanikly:
`--wood-amber` (`ContactForm`, `IsometricHouse`), `--font-body` a `--font-display`
(`MenuOverlay.ts`).
**Proč je to zákeřné:** CSS na neplatnou `var()` nenadává. Buď spadne na fallback, nebo
deklaraci zahodí. Build, typecheck i lint projdou čistě. `--font-display` měl fallback
`Georgia, serif`, takže názvy služeb v menu 3D domu renderovaly serifovou kurzívou — přesně
ten výraz, který měl redesign odstranit, a na nejexponovanějším prvku webu. Vypadalo to
záměrně, proto si toho nikdo nevšiml.
**Důsledek pro proces:** ověření tasku nesmí končit u „build prošel". U každé `var(--x)`
se musí ověřit, že `x` je někde definované. Fallback vadu maskuje, nezachraňuje ji.
Grep musí procházet i `.ts` soubory — `MenuOverlay.ts` injektuje CSS jako řetězec.

## D-027 — Zákaz pomlček se nesmí zvrhnout v mechanickou náhradu jiným znakem
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Task 11 odstranil všech 68 pomlček z uživatelského textu přeformulováním, ne náhradou
spojovníkem — to bylo správně a explicitně zadané. Jenže u části řetězců se z toho stala
náhrada pomlčky **dvojtečkou**, systematicky, asi patnáctkrát.
**Proč to vadí:** zákaz pomlček existuje proti monotónnímu AI rytmu. Patnáct dvojteček
ve stejné funkci ten rytmus reprodukuje, jen v jiném kostýmu. Navíc SEO titulky tím dostaly
dvě konvence vedle sebe (`Kontakt - Nezávazná poptávka` se spojovníkem vs.
`O nás: Tesaři z Plzeňského kraje` s dvojtečkou) a u služeb dokonce dva oddělovače v jednom
řetězci (`Tesařství: Krovové konstrukce a dřevěné práce | Plzeňský kraj`).
**Pravidlo:** u obsahových pravidel typu „tenhle znak ne" se kontroluje i to, **čím byl
nahrazen**, a jestli náhrada není stejně mechanická. Jinak se jen přesune symptom.
**Poznámka:** `Kontakt - Nezávazná poptávka` byl pozůstatek mechanické náhrady už z Tasku 1.
Spojovník s mezerami je v české sazbě chyba, ne stylová volba.
