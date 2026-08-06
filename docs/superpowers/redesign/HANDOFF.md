# Redesign — handoff (obnova po výpadku)

**Čti tento soubor jako první, když navazuješ na přerušenou session.**

---

## Co se dělá

Kompletní vizuální redesign webu Jáchim & Kučera (tesařství/pokrývačství/klempířství).
Větev: `redesign`. Základní větev pro PR: `main`.

## Pořadí čtení při obnově

1. **Tento soubor** — kde přesně jsme skončili (sekce „Aktuální stav" níže).
2. `docs/superpowers/redesign/PROGRESS.md` — které tasky jsou hotové, které rozpracované.
3. `docs/superpowers/redesign/DECISIONS.md` — proč je něco tak, jak to je. Nerozhoduj znovu
   to, co už je rozhodnuté.
4. `docs/superpowers/plans/2026-08-06-website-redesign.md` — implementační plán, task po tasku.
5. `docs/superpowers/specs/2026-08-06-website-redesign-design.md` — schválený design spec.
6. `git log --oneline redesign` — co je reálně commitnuté.

## Role v této session

- **Opus (orchestrátor)** — quality gate, code review, poradce. Nepíše kód, nečte dlouhé
  soubory. Rozhoduje, co je hotové.
- **Sonnet subagenty** — implementace jednotlivých tasků z plánu.

Při obnově: pokračuj stejným modelem. Nedělej implementaci sám v hlavní smyčce.

## Nepřekročitelná pravidla (detail viz DECISIONS.md)

- Žádné hardcoded hex barvy v komponentách — všechno přes tokeny. Paleta se bude nejspíš
  ještě měnit na „dřevěnou" (D-003).
- Zachovat verbatim: telefony, e-maily, adresy.
- Zachovat: URL slugy, cs/en i18n, a11y wiring 3D domu, SEO metadata + JSON-LD.
- Nula em-dashů (— –) v uživatelsky viditelném textu.
- Mobil < 768px: 3D dům nesmí být jediná navigace.
- Každý commit projde `npm run typecheck` a `npm run lint`.

## Ověřovací příkazy

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run build       # produkční build - JEDINÝ spolehlivý signál, viz níže
```

⚠️ **`npm run dev` v tomto prostředí nepoužívej jako ověření.** Výstup prochází wrapperem,
který ho shrnuje na „Errors: N" a hlásí chybu i tam, kde build prochází čistě. Ověřeno:
`npm run build` prošel (26 stránek), zatímco dev wrapper hlásil chybu. Port 3000 navíc
obsazuje jiná aplikace. Pro vizuální kontrolu spusť dev server ručně na volném portu.

## URL struktura (pozor při ručním testování)

`localePrefix: 'as-needed'`, výchozí locale je `cs`. Takže:
- čeština je na `/`, `/kontakt`, `/realizace` — **bez** prefixu `/cs`
- angličtina je na `/en`, `/en/kontakt`, …
- `/cs/...` vrací 404, a je to správně

---

## Aktuální stav

**Poslední aktualizace:** 2026-08-06

**Fáze: REDESIGN v2.** Verze 1 (12 tasků, 42 commitů) je hotová a commitnutá, ale
uživatel ji odmítl jako nedostatečnou: *„myslel sem ze vymyslíš úplně jiný design a né
jen upravíš barvy na designu co byl."* Měl pravdu — kostra homepage zůstala původní
(scroll-jacking `StackCover`, stejné pořadí sekcí, 3D dům jako hero i navigace).
Změnily se jen barvy, písma, texty a jedna sekce.

**Nové zadání uživatele (verbatim):** „Hele klidně zapomeň na dům nech ho někde dostupný
na schované URL ale nemusí vůbec být na landing page. Zkus vymyslet kompletně nový design
vubec se neomezuj tím co v projektu teď je. Jen nech faktické údaje."

Druhá výhrada: na titulní stránce bylo tlačítko „Nezávazně poptat" výraznější než logo
firmy. (Příčina: `Header.tsx` schovával wordmark nad hero s odůvodněním „nese ho i dům",
ale dům žádný wordmark nenese — nad ohybem tedy značka nebyla vůbec.)

**Řídící dokumenty v2:**
- `docs/superpowers/specs/2026-08-06-redesign-v2-drevo.md` — spec
- `docs/superpowers/plans/2026-08-06-redesign-v2.md` — plán T1–T7
- `docs/superpowers/redesign/PALETTE-WOOD.md` — dřevěná paleta + kontrastní tabulka

**Postup v2:** T1 (paleta + písma) dispatchnut. T2–T7 čekají.

Paleta v2 je **teplá dřevěná**: `paper / timber / oak / ember`. Všech 14 povinných
kontrastních dvojic ověřeno výpočtem a nezávisle přepočítáno (nejtěsnější `ember` na
`paper.dim` = 4.85:1). Minimální průhlednosti: `timber/N` text ≥65, linka ≥50;
`paper/N` text na timber ≥50, linka ≥40.

Písma v2: **Fraunces** (display) + Archivo (body) + IBM Plex Mono (čísla/popisky).
Česká diakritika se ověřuje inspekcí cmap tabulky staženého `.ttf` přes `fontTools`,
ne odhadem.

**Blokery pro nasazení** (detail v PROGRESS.md): skutečné IČO, reálné fotky, ověření
oficiálního názvu firmy, potvrzení tvrzení „Záruka 10 let", vizuální kontrola na mobilu.
3D dům (D-029) se mezitím **rozjel a vykresluje se správně** — a stejně odchází
z landing page na `/nahled-3d`.

**Stav kódové báze:**
- Jediný soubor s hex hodnotami palety je `lib/palette.ts` (D-024).
- Žádné legacy třídy `wood-*`/`cream`/`charcoal`, žádné pomlčky v uživatelském textu.

## Jak se ověřuje cizí práce (poučení, ne teorie)

- Grep piš tak, aby **prázdný výsledek šel odlišit od pádu příkazu** — vypisuj exit kód.
  `--include=*.tsx` bez uvozovek zsh shodí a chybová hláška zapadne mezi ostatní výstup;
  přesně takhle proklouzla vada opravená v `fdf5fc6` (D-023).
- `grep -n --slate soubor` selže na parsování přepínače. Použij `grep -n -e '--slate'`.
- Kontroluj celý repozitář, ne jen soubory z posledního commitu. Regrese vzniká i tam,
  co už je odškrtnuté.
- U tokenů nekontroluj jen *hodnoty*, ale i **počet míst, kde hodnoty žijí** (D-024).

**Čeká se na klienta:** skutečné IČO (placeholder zatím zůstává, viz D-019 a pre-launch
checklist v PROGRESS.md), reálné fotky realizací.

---

## Kontrola v prohlížeči — dvě pasti, na které jsem narazil

**1. Screenshoty systematicky podceňují stránku.** GSAP `Reveal` animuje `gsap.from`
(obsah je v SSR HTML viditelný, animace ho jen rozjíždí). V automatizovaném prohlížeči
ale animace neběží plynule — screenshot pak ukazuje prázdné nebo poloprůhledné sekce,
které ve skutečnosti fungují. Stejně tak `transition-colors` na hlavičce zamrzne
uprostřed a `getComputedStyle` vrátí mezihodnotu (`bg-paper/90` se čte jako alfa 0.133).

Než něco prohlásíš za vadu, **ověř to čtením DOM** (počet prvků, `gridTemplateColumns`,
`getBoundingClientRect`), ne pohledem na screenshot. Pro pravdivý screenshot jde dočasně
vložit `<style>` s `main *, section *, footer * { opacity:1 !important; transform:none !important }`
— reveal animuje jen tyhle dvě vlastnosti, takže je to věrný obraz usazeného stavu.

**2. `npm run build` v subagentovi rozbije běžící dev server.** Sdílejí `.next`.
Projev: stránka se načte (curl vrací 200), ale renderer v prohlížeči zamrzne a
`Page.captureScreenshot` spadne na timeout. Léčba: `rm -rf .next` a restart dev serveru.
Stalo se to v tomhle běhu potřetí — do zadání subagentů proto patří poznámka, že dev
server běží.
