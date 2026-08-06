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

**Fáze:** Implementace hotová. **Všech 12 tasků commitnuto**, plus 6 oprav mimo plán.
Zbývá vyřešit pre-launch checklist v PROGRESS.md.

Písma: **Archivo** (display) + **IBM Plex Mono**. Česká diakritika ověřena inspekcí cmap
tabulek stažených `.ttf` přes `fontTools`, ne odhadem.

**Blokery pro nasazení** (detail v PROGRESS.md): skutečné IČO, reálné fotky,
**nevykreslující se 3D dům (D-029)**, ověření oficiálního názvu firmy, potvrzení tvrzení
„Záruka 10 let", vizuální kontrola na mobilu.

**Stav kódové báze po redesignu:**
- Jediný soubor s hex hodnotami palety je `lib/palette.ts` (D-024). Výměna palety za
  „dřevěnou" je úprava jednoho souboru, jak si uživatel vymínil.
- Žádné legacy třídy `wood-*`/`cream`/`charcoal`, žádné pomlčky v uživatelském textu.
- Všech ~20 kontrastních dvojic s průhledností přeměřeno a opraveno (Task 12).

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
