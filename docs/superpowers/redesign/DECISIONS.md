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

## D-028 — Mechanická náhrada z Tasku 1 přežila ve skládaných řetězcích
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Task 1 nahradil em-dashe spojovníkem (`SITE.name` a spol.). Ta náhrada přežila v **osmi**
šablonových literálech v komponentách — `alt` texty, `aria-label`y a jeden odkaz v skryté
navigaci. Mezerníkový spojovník je v české sazbě chyba, ne stylová volba.
**Proč to uniklo dvanáct tasků:** všechny moje kontroly pomlček mířily na `messages/*.json`
a hledaly znaky `—` a `–`. Tyhle řetězce se skládají až v komponentě z několika `t()` volání,
takže v message souborech nejsou, a hledaný znak v nich není — je tam jeho **náhrada**.
Grep na symptom nenajde vadu, kterou jsem si sám vyrobil při jeho odstraňování.
**Pravidlo:** po každé plošné náhradě znaku se musí hledat i **nový** znak v té samé funkci,
a to i v místech, kde se text skládá za běhu, ne jen ve zdrojích textu.
Souvisí s [[D-027]]. Opravuje se v Tasku 12, část A.

## D-029 — 3D dům se nevykresluje; vada je STARŠÍ než redesign
**Datum:** 2026-08-06 · **Zjistil:** Claude (opus), vizuální kontrola v prohlížeči
Na `/` i `/nahled-3d` se místo domu vykreslí jen **plaňkový plot** kolem pozemku a pár
rozptýlených teček. Chybí hlavní hmota, střecha, garáž i pergola. Menu labely se nezobrazí.
**Ověřeno, že to není regrese redesignu:** vytvořil jsem git worktree na commitu `6d3a0de`
(stav před Taskem 1, tedy před jakoukoli změnou vzhledu), spustil ho na vlastním portu a
vykreslení je **vizuálně totožné**. Rozdíl je jen v barvě pozadí a písmu titulku.
**Není to ani softwarové renderování:** WebGL hlásí `ANGLE (Apple, ANGLE Metal Renderer:
Apple M5)`, 4× MSAA, DPR 2. Skutečná GPU.
**Konzole je bez chyb** — jen dvě deprecation varování z Three.js (`THREE.Clock`,
`PCFSoftShadowMap`). Vada tedy neshodí runtime, jen nic nevykreslí.
**Kde hledat:** `ArchElement.ts:88` vytváří `LineMaterial` s `opacity: 0` a `transparent: true`;
plné krytí nastavuje až `revealComplete()` volaný z intro animace v `SceneManager.prepareIntro()`
/ `updateIntro()`. Plot je jediný prvek, který je vidět, a je to jediný prvek stavěný
`buildFence()` jako **jedna sloučená geometrie**. To ukazuje směrem k tomu, že ostatní prvky
buď nedostanou `revealComplete()`, nebo jejich geometrie nevznikne.
**Rozhodnutí:** mimo rozsah redesignu. Redesign měnil barvy a chování reduced-motion, ne
geometrii. Řešit samostatně, ale **před nasazením** — je to hlavní prvek homepage.

## D-030 — Redesign v1 byl reskin, ne redesign. Startuje v2.
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
Uživatel po vizuální kontrole: *„myslel sem ze vymyslíš úplně jiný design a né jen upravíš
barvy na designu co byl. Myslel sem ze budeš dělat kompletně novou věc."*
**Měl pravdu, a fakta to potvrzují.** Diff `6d3a0de..HEAD` nad `app/` a `components/`:
632 přidaných proti 969 smazaným řádkům, z toho jen **dvě** strukturální výměny
(`ServicesScroll` → `ServicesGrid`, přidaný `MobileServiceGrid`). `page.tsx` se změnila
o 9 řádků. Pořadí sekcí, scroll-jacking přes `StackCover` i 3D dům jako hero zůstaly.
**Proč to tak dopadlo:** v HANDOFF.md jsem mezi „zachovat" napsal *a11y wiring 3D domu*
a scroll architekturu jsem nikdy nedal na stůl jako otevřenou otázku. Tím jsem si sám
zakázal sáhnout na jediné dvě věci, které tvořily osobnost webu. Spec pak mohl být
splněn do puntíku a výsledek přesto vypadal jako ten samý web v jiných barvách.
**Pravidlo:** když zadání zní „kompletně nový vizuální směr", patří **kostra a hlavní
interakční zařízení** mezi věci, o kterých se rozhoduje vědomě — ne mezi ty, které se
mlčky zachovají. Seznam „zachovat" smí obsahovat data, URL a a11y kontrakty, ne layout.

## D-031 — Dům odchází z landing page na skrytou URL
**Datum:** 2026-08-06 · **Rozhodl:** uživatel
*„Hele klidně zapomeň na dům nech ho někde dostupný na schované URL ale nemusí vůbec být
na landing page."* Dům zůstává funkční na `/nahled-3d`, neodkazovaný z navigace.
Modul `components/house3d/` se nemaže.
**Důsledek:** padá s ním `MobileServiceGrid` (existoval jen jako berlička k domu na
mobilu) i `HeroScroll`/`HeroHouse`. Mobilní navigaci nově nese rejstřík služeb, jehož
řádky jsou celoplošné odkazy — mobil je tím vyřešený strukturálně, ne zvláštní komponentou.
Ruší se i `StackCover` na homepage: žádný scroll-jacking.

## D-032 — Wordmark je nad ohybem vždy, CTA v hlavičce není vyplněné tlačítko
**Datum:** 2026-08-06 · **Rozhodl:** uživatel (výhrada), Claude (řešení)
Uživatel: *„na titulní stránce je výraznější „nezávazně poptat" než logo firmy."*
**Příčina:** `Header.tsx` schovával logo nad hero (`opacity-0`) s komentářem „Logo je na
homepage nad Hero redundantní (nese ho i dům)". Dům ale žádný wordmark nenese — vykresluje
geometrii a názvy služeb. Nad ohybem tedy značka nebyla vůbec a jediným výrazným prvkem
byl vyplněný akcentní `Button` s CTA.
**Poučení:** komentář, který odůvodňuje skrytí prvku odkazem na jiný prvek, je potřeba
ověřit proti tomu druhému prvku. Tenhle byl nepravdivý od začátku a nikdo ho nezpochybnil.
**Pravidlo do v2:** wordmark je viditelný okamžitě a všude. V hlavičce není vyplněné
tlačítko; CTA je textový odkaz s podtržením.

## D-033 — Paleta v2 je dřevěná; tokeny se přejmenovávají, ne jen přebarvují
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Uživatel si dřevěné barvy přál od začátku ([[D-003]]) a přijal materiálovou paletu jen
s tím, že *„tokeny se dají změnit později vždy"*. V2 přepisuje kostru, takže je to ta chvíle.
`slate → timber`, `steel → oak`, `patina → ember`, `paper` zůstává jménem (mění hodnotu).
**Proč přejmenovat, ne jen přebarvit:** „patina" je zelený pojem. Nechat zelené jméno na
terakotovém akcentu by byla lež v tokenu, kterou by každý další task musel obcházet.
Přejmenování je levné právě teď, kdy se stejně přepisují všechny komponenty.
Hodnoty a naměřené kontrasty: `docs/superpowers/redesign/PALETTE-WOOD.md`.
Investice z [[D-024]] se vyplatila: hex hodnoty žijí v jediném souboru.

## D-034 — Přejmenování CSS proměnné znovu utrhlo konzumenta (D-025 podruhé)
**Datum:** 2026-08-06 · **Zjistil:** Claude (opus), review T1
T1 přejmenoval `--font-sans` na `--font-body` v `layout.tsx` a v `tailwind.config.ts`,
ale `components/house3d/MenuOverlay.ts` (řádky 186 a 203) konzumoval `var(--font-sans, …)`
v **řetězci s CSS**, ne v Tailwind třídě. Grep nad Tailwind konfigurací ho nenajde.
Proměnná přestala existovat, fallback se tiše aktivoval, menu 3D domu spadlo do `system-ui`.
Build, typecheck i lint prošly — CSS na neplatný `var()` nikdy nezahlásí chybu.
**Je to přesně stejná vada jako [[D-025]]**, jen z opačné strany: tehdy proměnná nikdy
nevznikla, teď zanikla. Obě přežily zelený build.
**Pravidlo:** přejmenování CSS custom property není hotové, dokud neproběhl grep na
**staré jméno** přes celý repo včetně `.ts` souborů, které generují CSS jako řetězec.
Opraveno v review, ne subagentem.

## D-035 — Pravidlo 3:1 platí na UI prvky, ne na dekorativní linky
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus), review T1
T1 dostal instrukci zvednout hranice na `timber/N ≥ 50` a aplikoval ji plošně: **24**
výskytů, včetně vlasových oddělovačů sekcí, orámování karet a `border-y` kolem bloku
statistik. Skok z `/8` na `/50` je šestinásobek — z jemné linky se stane těžká tmavá čára.
**Chyba byla v mém zadání, ne v provedení.** WCAG 1.4.11 vymáhá 3:1 na *prvky
uživatelského rozhraní* a *grafiku nutnou k pochopení obsahu*, a dekoraci výslovně
vyjímá. Skutečná vada v v1 ([[D-020]] okolí) byla podtržení inputu ve formuláři na
1.65:1 — to je hranice ovládacího prvku, ta 3:1 splnit musí. Oddělovač sekcí ne.
**Riziko opačným směrem:** vizuální jazyk v2 stojí na vlasových linkách. Plošné
vymáhání 3:1 by ho zlikvidovalo pod záminkou přístupnosti.
Rozsah pravidla je od teď v tabulce ve specu, sekce „Nepřekročitelná pravidla", bod 5.
Hodnoty se srovnají v T2–T5, kde se ty komponenty stejně přepisují.

## D-036 — Modifikátor průhlednosti musí být násobek pěti, jinak utilita tiše neexistuje
**Datum:** 2026-08-06 · **Zjistil:** Claude (opus), kontrola v prohlížeči
Napsal jsem do specu doporučení „dekorativní linky drž nízko (`timber/12`)" a subagent ho
poslušně použil v `Header.tsx`. V prohlížeči měla hlavička spodní linku v **chladné šedé**.
Příčina: Tailwind generuje modifikátory průhlednosti z výchozí škály `opacity`, která jde
po pětkách. `border-timber/12` se nevygeneruje vůbec, `border-b` proto spadne na výchozí
`borderColor` (`gray-200`) — studená šedá uprostřed teplé dřevěné palety.
**Nic to nezahlásí:** typecheck, lint i build jsou zelené, protože je to jen řetězec ve
`className`. Stejná třída vad jako [[D-025]] a [[D-034]] — tiché selhání ve stylové vrstvě.
**Jak se to našlo:** čtením `getComputedStyle` skutečně vykresleného prvku v prohlížeči,
ne grepem nad zdrojem. Grep vidí, že třída je napsaná; nevidí, že neexistuje.
**Ověřeno v celém repu:** jediný mrtvý výskyt byl `border-timber/12`, opraveno na `/10`.
**Pravidlo:** `/N` jen jako násobek pěti. Audit v T7 musí kontrolovat existenci
vygenerovaného pravidla, ne jen naměřený kontrast hodnoty, kterou jsme *zamýšleli*.

## D-037 — Fraunces se fixuje na nízké opsz a vyšší váhu
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus), vizuální kontrola
Fraunces je proměnné písmo s osou optical-size (9-144). Prohlížeče mají
`font-optical-sizing: auto` a odvozují opsz z velikosti písma, takže nadpis přes 100 px
dostal nejvyšší opsz: vlasové tahy, vysoký kontrast, kresba módního magazínu.
Otvírák s větou „Krov, střecha, okap. Tři řemesla, jedna parta." tak byl vysázený
písmem, které mluví úplně jiným hlasem než ten text.
**Řešení** (`app/globals.css`, `@layer base`): `font-optical-sizing: none`,
`font-variation-settings: 'opsz' 18`, `font-weight: 600` pro `.font-display`/`h1`-`h3`,
`700` pro `h1`. Nízké opsz je u Fraunces textová kresba: hutná, měkká, nízký kontrast tahů.
**Proč to nebyla chyba subagenta:** spec předepisoval písmo a velikosti, ne osy
proměnného písma. Chyběl v něm požadavek, který plyne z organizující myšlenky
(„hmota místo pohybu"). Typografická váha je součást zadání, ne detail implementace.

## D-038 — Značka je odznak + vysázené jméno, ne jen odznak
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Kruhový odznak nese jméno firmy jen jako součást kresby a pod ~64 px je nečitelný.
V hlavičce (44-52 px) tedy fungoval jako značka, ne jako jméno — a to byl zbytek
uživatelovy výhrady z [[D-032]]: i po zviditelnění loga bylo „jméno firmy" fakticky
nepřítomné. `Logo` má nově prop `wordmark`: odznak + `SITE.shortName` vysázený
v display písmu vedle něj. Odznak dostal `alt=""`, jméno nese `aria-label` odkazu
a viditelný text — jinak by ho odečítač hlásil dvakrát.

## D-039 — Dotykový cíl: 44px na ovládací prvky, 24px stačí na textové odkazy
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus), měření na 281px viewportu
Spec psal plošně „cíle ≥ 44px". Měření ukázalo, že to nesplňují textová CTA
(„Nezávazně poptat →", „Všechny realizace →", „Náš příběh →") — mají 24px, protože
je to řádkový box textu, ne tlačítko.
**Nedoplácávám je.** WCAG 2.2 SC 2.5.8 (AA) požaduje 24×24 CSS px a tyhle odkazy ho
splňují přesně. 44×44 je až SC 2.5.5 (AAA). Odsazení, které by je na 44px natáhlo, by
z textového odkazu udělalo skryté tlačítko a rozbilo by to vizuální jazyk, kde vyplněné
tlačítko schválně nikde není ([[D-032]]).
**Doplácal jsem jednu věc:** odkazy v mobilním fullscreen menu měly 40px. Na mobilu je
to jediná navigace, tam se 44px vyplatí — přidáno `min-h-11` a vodorovné odsazení.
**Pravidlo:** 44px vymáhej u ovládacích prvků (tlačítka, ikonová tlačítka, pole
formuláře, přepínač jazyka, řádky rejstříku služeb). U textových odkazů stačí 24px.

## D-040 — Chybové barvy formuláře zůstávají mimo paletu
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus), na základě nálezu z auditu
`ContactForm` používá `text-red-700` a `border-red-600` z výchozí Tailwind palety, ne
z `lib/palette.ts`. Formálně je to porušení pravidla o jediném zdroji hex hodnot.
**Nechávám to tak.** Chybový stav je sémantická barva, ne barva značky — kdyby se
tahala z dřevěné palety, splynul by s akcentem `ember` (terakota), což je přesně ta
barva, kterou web používá pro *pozitivní* akcenty a CTA. Uživatel by nerozeznal chybu
od zvýraznění. Výměna palety za jinou ([[D-003]]) se téhle barvy nesmí dotknout, a to
je argument pro to, aby v tom souboru nebyla.
Kontrast ověřen: `text-red-700` na papíru 5.44:1, `border-red-600/85` 3.50:1. Obojí projde.

## D-041 — Logo je širokoúhlý lockup, ne kulatý odznak
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus), na základě uživatelovy stížnosti
„logo v patičce není dobře čitelné"
`public/logo_2.png` je **867×463 px**, tedy poměr 1,872 — kresba střechy a pod ní
vysázené „Jáchim & Kučera" / „TESAŘSTVÍ". `Logo.tsx` ho ale renderoval jako čtvercový
odznak (`width={size} height={size}` + `rounded-full` + `object-contain`), takže se
lockup do boxu vepsal na poloviční výšku: při `size={44}` se kresba vykreslila 44×23 px
a „TESAŘSTVÍ" vyšlo na 2,5 px.
Sizing je nově **podle výšky** (`LOGO_ASPECT_RATIO = 867/463`), `rounded-full` je pryč.
Naměřené pásy inkoustu (podíl na celkové výšce obrázku), ať se to nemusí odhadovat:
kresba střechy 40,0 %, „Jáchim & Kučera" 21,0 %, linka 2,4 %, „TESAŘSTVÍ" 9,5 %.
**Důsledek pro [[D-038]]:** samostatná vysázená slovní značka byla náplast právě na
tuhle vadu a je odstraněná — lockup jméno firmy obsahuje sám. Vedlejší přínos: pod
breakpointem `sm` se jméno firmy dřív neukazovalo vůbec (`hidden sm:inline`), teď je
čitelné i na mobilu. `alt=""` na obrázku zůstává, jméno nese `aria-label` odkazu.

## D-042 — Světlá varianta loga je vygenerovaný soubor, ne CSS filtr
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Inkoust lockupu je antracitový; na `bg-timber` (#241c14) má kontrast kolem 1,2:1, takže
v patičce logo prakticky mizelo. To byla hlavní příčina uživatelovy stížnosti.
Inkoust je **rastrový** (kresba i písmo v jednom PNG), takže „světlá varianta" nemůže
být přebarvení přes `currentColor`. `filter: invert()` odpadá, protože by zlatý
ampersand a linky u „TESAŘSTVÍ" převrátil do modré.
**Řešení:** `scripts/generate-logo-paper.mjs` (sharp, už je v `node_modules` jako
tranzitivní závislost Nextu — **záměrně nepřidáno do `package.json`**, je to vývojářský
nástroj, ne runtime kód). Skript rozliší pixely podle saturace (práh 0,2; inkoust má
saturaci ~0, zlatá ~0,6 — mezi tím je velká mezera), nízko saturované přebarví na
`paper.DEFAULT`, zlaté nechá být, alfy se nedotkne. Hex čte z `lib/palette.ts`, takže
[[D-024]] (jediný zdroj hex hodnot) platí i pro obrázky. Při výměně palety stačí skript
pustit znovu. `Logo` přepíná `src`, ne CSS barvu.

## D-043 — Dekorativní 3D dům má vlastní fit margin
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus)
Dům se vrací na homepage jako **dekorace** (zadání uživatele: „mohl by se tam dát
zmenšený 3D dům který nebude interaktivní… na mobilu asi nepřidávat"). Navigaci drží
dál `ServiceIndex`, dům není klikací a je `aria-hidden`.
`SceneManager` má nově `interactive` (default `true`): při `false` se `MenuOverlay`
vůbec nezakládá, neregistrují se pointer listenery, neběží raycast v render smyčce,
`OrbitControls` jsou vypnuté a canvas má `pointer-events: none`.
**Podstatné zjištění:** `FIT_MARGIN_HERO = 2.25` existuje proto, aby kolem domu zbylo
místo na **menu labely v pevných sloupcích**. Dekorativní dům labely nemá, takže si
rezervoval místo pro nic — kresba zabírala jen 1/2,25 = 44 % rámu a při canvasu
274×195 px vycházel dům na ~120×86 px, což je prakticky neviditelné. Přidána
`FIT_MARGIN_DECOR = 1.3` (~77 % rámu). Tři hodnoty jsou správně tři: `SOLO` 1.5 pro
`/nahled-3d`, `HERO` 2.25 pro interaktivní dům na papírovém panelu, `DECOR` 1.3 pro
dekoraci bez labelů.
**Mobil:** samotné `hidden lg:block` komponentu stejně namountuje a WebGL kontext
vznikne — jen ho není vidět. Gate je proto `matchMedia('(min-width: 1024px)')`
v `OpenerHouse.tsx` (`useState` + `useEffect`, ne čtení v renderu, kvůli hydrataci).
Ověřeno instrumentací `HTMLCanvasElement.prototype.getContext`: na 390 px žádný canvas
a žádné volání `getContext`.

## D-044 — Dekorace se váže na textový sloupec, ne na okraj okna
**Datum:** 2026-08-06 · **Rozhodl:** Claude (opus), na základě screenshotu na 1920 px
První umístění domu bylo `absolute bottom-0 right-0` na sekci. Do ~1440 px to vypadalo
dobře, ale nad šířkou `max-w-content` (1200 px) dům odplul do prázdné mrže vpravo od
sazby, ztratil na ni vazbu a na 1920 px ho pravý okraj okna ořízl (sazba končí na
1520 px, canvas začínal na 1620 px a končil na 1920 px).
Vrstva leží nově uvnitř `container-content` a `ml-auto` srovná pravou hranu domu
s pravou hranou textu. Ověřeno na 1024/1280/1440/1920 v cs i en:
`canvasRight - textRight = 0` na všech osmi kombinacích, nikde průnik s nadpisem,
podtitulkem, statistikami ani řádkem CTA; při výšce viewportu 720 px je pata vrstvy
vždy nad ohybem (600,9 / 652,5 / 684,5 / 693,1 px).
**Velikost zůstává `clamp(240px,20vw,300px)`.** Svislé pásmo mezi patou `<h1>` a řádkem
CTA má konstantních 249 px (pevné px odstupy v `Opener.tsx`, ne `vw`), takže při
poměru 7:5 je strop kolem 300×214 px. Zvětšovat dál by znamenalo přestavět rozestupy
hero sekce — a uživatel psal „zmenšený dům", takže je to akcent, ne hlavní grafika.

## D-045 — V automatizovaném prohlížeči neběží requestAnimationFrame
**Datum:** 2026-08-06 · **Zjistil:** Claude (opus), měřením
`/nahled-3d` mi vykreslilo místo domu roztříštěné fragmenty a tečky. Než jsem to nahlásil
jako regresi, vrátil jsem `components/house3d` na stav před oběma commity — render vypadal
**úplně stejně**. Příčina se pak našla měřením: rAF smyčka se v CDP prohlížeči za 45 sekund
neposunula ani o jeden snímek. Scéna tedy zamrzne uprostřed úvodního rozkreslení
(`introDur` 1,7 s) a screenshot ukazuje polotovar. GPU je přitom skutečná
(ANGLE Metal, Apple M5), takže renderer za to nemůže.
**Rozšíření pravidla z HANDOFF.md:** past se netýká jen GSAP revealů. **Nic, co je
řízené `requestAnimationFrame`, se v tomhle prohlížeči vizuálně posoudit nedá.**
Layout a rozměry ověřuj čísly (`getBoundingClientRect`), vzhled 3D scény si nech
vyrenderovat subagentem s vlastním Playwrightem (tam rAF běží) a **počkej po načtení
alespoň 3 sekundy**, než screenshotuješ.

## D-046 — Firma jsou dva OSVČ, ne jedna právnická osoba (RUŠÍ D-019)
**Datum:** 2026-08-07 · **Rozhodl:** uživatel (dodal data), zpracoval Claude (opus)
Klient dodal skutečné údaje: **Petr Jáchim, IČO 47748303, +420 608 212 410** a
**Milan Kučera, IČO 29640113, +420 725 443 271**. Dvě IČO znamenají dva samostatné
podnikající subjekty, ne jednu firmu s jedním identifikačním číslem — což ruší celý předpoklad
D-019 (jeden placeholder `IČO 000 00 000` v jednom řetězci v `messages`).
Ověřeno nezávisle, ne přepsáno naslepo: obě IČO projdou kontrolní číslicí (mod 11) a v ARES
odpovídají uvedeným jménům, oba jako právní forma 101 (fyzická osoba podnikající).
**Důsledek:** lidé jsou **data**, ne text. Žijí v `lib/constants.ts` jako `people: Person[]`,
messages drží jen holý štítek (`common.companyIdLabel` = `IČO` / `Company ID`) a jména ani
čísla se v překladech neopakují. Patička, kontaktní panel, JSON-LD i `/o-nas` iterují stejné
pole. `SITE.name` (`Jáchim & Kučera, tesařství`) tím zůstává **obchodní označení, ne zapsaný
název** — v rejstříku žádný takový subjekt není, jsou tam dvě fyzické osoby. Povinné údaje
proto nese patička (obě jména + obě IČO), ne `SITE.name`.

## D-047 — Vymyšlené kontaktní údaje se nesmí tvářit jako faktická data
**Datum:** 2026-08-07 · **Rozhodl:** Claude (opus)
`SITE.phone` byl od prvního commitu `+420 777 123 456` — vymyšlené číslo, které vypadalo
jako skutečný údaj a šlo do JSON-LD, do patičky i do chybové hlášky formuláře. Pravidlo
„zachovat faktické údaje" ho chránilo, přestože faktický nikdy nebyl.
**Pravidlo:** placeholder musí být buď zjevně prázdný, nebo v kódu **označený komentářem
s podmínkou nasazení**. `SITE.phone` je nově odvozený z `people[0]`, takže vymyšlené číslo
v repu neexistuje (ověřeno grepem). Zbylé dva vymyšlené údaje — `SITE.email` a `SITE.url` —
mají u sebe explicitní komentář „nesmí jít do produkce" a záznam v pre-launch checklistu.
Formátový příklad ve formuláři (`+420 123 456 789`) je záměrně neutrální, ať ho nikdo
nezamění za číslo firmy.

## D-048 — `<dl>` snese jen `dt`/`dd`, i když prohlížeč nezlobí
**Datum:** 2026-08-07 · **Zjistil:** Claude (opus) při code review
Rozpad jednoho telefonu na dva vedl k `<dl> > <div> > <p>` a dalšímu vnořenému `<div>`.
Vizuálně bez chyby, ale mimo spec: uvnitř `<dl>` smí být jen skupiny `dt`/`dd`, případně
`<div>`, který obaluje **výhradně** `dt`/`dd`. Odečítač obrazovky pak hlásí jiný počet
položek, než kolik jich na stránce je.
Správný tvar pro „jeden termín, dvě hodnoty" je jedno `<dt>` a **dvě `<dd>`** (spec to
výslovně dovoluje), ne dvojice zabalené do divů. Při opravě se stejná vada našla i v blocích
IČO a mapy (`showMap`, tedy `/kontakt`) — ty definiční páry nejsou vůbec a přesunuly se ven
z `<dl>` jako sourozenci.
**Ověřuje se skriptem**, ne pohledem: projít `dl.children` a `div.children` a ohlásit každý
tag mimo `DIV`/`DT`/`DD`.
