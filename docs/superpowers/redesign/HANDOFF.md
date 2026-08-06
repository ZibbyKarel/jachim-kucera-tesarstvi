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

**Fáze:** Implementace — **8 z 12 tasků hotovo a commitnuto.**

Plán je commitnutý (`6d3a0de`, 12 tasků), prošel dvěma review koly. Přesný stav tasků
včetně hashů je v PROGRESS.md — tenhle soubor ho needubluje.

Písma: **Archivo** (display) + **IBM Plex Mono**. Česká diakritika ověřena inspekcí cmap
tabulek stažených `.ttf` přes `fontTools`, ne odhadem.

**Právě probíhá (2 souběžné sonnet subagenty, souborově disjunktní):**
- Task 9 — O nás + Timeline (`app/[locale]/o-nas/page.tsx`, `components/sections/Timeline.tsx`)
- Oprava mimo plán — jeden zdroj pravdy pro paletu, D-024 (`lib/palette.ts`,
  `tailwind.config.ts`, `app/globals.css`, `components/house3d/config.ts`)

**Další krok:** ověřit oba, pak Task 10 (Kontakt), 11 (content sweep), 12 (závěrečný pass).

**Soubory, které ještě nesou legacy třídy** (stav po Tasku 8, ověřeno grepem):
`app/[locale]/kontakt/page.tsx` a `components/ui/ContactForm.tsx` (Task 10),
`app/[locale]/o-nas/page.tsx` a `components/sections/Timeline.tsx` (Task 9, běží),
`app/[locale]/not-found.tsx` a `components/house/IsometricHouse.tsx` (Task 11 — druhý se maže).
Pozor: `app/not-found.tsx` v kořeni je **jiný soubor** než `app/[locale]/not-found.tsx`
a taky má vlastní legacy paletu (`#2d2b28`/`#e9e6e0`/`#c49a4c`). Ať na něj Task 11 nezapomene.

**Blokery:** žádné.

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
