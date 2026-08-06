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
npm run build       # produkční build
npm run dev         # http://localhost:3000
```

---

## Aktuální stav

**Poslední aktualizace:** 2026-08-06

**Fáze:** Příprava — plán po adversariálním review, opravuje se druhé kolo.

**Hotovo:**
- Design spec napsaný a schválený, commitnutý.
- Recovery infrastruktura (DECISIONS.md, PROGRESS.md, tento soubor).
- Audit kódové báze sonnet subagentem. Klíčové nálezy: Tailwind v3.4.10, současné písmo je
  serif (Cormorant Garamond) který musí pryč, 22 souborů používá staré barevné třídy,
  8 souborů má hex literály, 3D dům je raw Three.js (ne R3F), 72 em-dashů v `messages/*.json`,
  mrtvý kód `IsometricHouse.tsx`, chybějící reduced-motion guard u idle animace domu.
- Rozhodnutí k nálezům: D-011 až D-018 v DECISIONS.md.

**Plán — stav:** napsaný (12 tasků, ~3200 řádků), prošel dvěma review koly.
Písma: **Archivo** (display, pravá kurzíva) + **IBM Plex Mono**. Česká diakritika ověřena
inspekcí cmap tabulek stažených `.ttf` přes `fontTools`, ne odhadem.

Review kolo 1 (opus, vlastní skript): všech 7 tvrzených kontrastních poměrů sedí přesně.
Odhaleny 3 neuvedené padající dvojice → D-020.
Review kolo 2 (nezávislý adversariální subagent): potvrdil přesnost odkazů na řádky a symboly
napříč kódovou bází. Nalezena 1 blokující vada (Task 3 implementoval zrušené D-015 místo
D-019) + 5 dalších oprav.

**Právě probíhá:**
- Autor plánu zapracovává opravy z obou review kol. Plán ještě NENÍ commitnutý.

**Další krok:**
- Opus ověří opravy, commitne plán, spustí Task 1.
- Pak implementace task po tasku přes sonnet subagenty, s review mezi tasky.

**Blokery:** žádné.

**Čeká se na klienta:** skutečné IČO (placeholder zatím zůstává, viz D-019 a pre-launch
checklist v PROGRESS.md), reálné fotky realizací.
