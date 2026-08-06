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

**Fáze:** Příprava — plán se generuje.

**Hotovo:**
- Design spec napsaný a schválený, commitnutý (`docs/superpowers/specs/2026-08-06-website-redesign-design.md`).
- Recovery infrastruktura založená (tento soubor + DECISIONS.md).

**Právě probíhá:**
- Sonnet subagent auditoval kódovou bázi a píše implementační plán do
  `docs/superpowers/plans/2026-08-06-website-redesign.md`. Plán ještě NENÍ zreviewovaný
  ani commitnutý.

**Další krok:**
- Opus zreviewuje plán, vyřeší flagnuté nejasnosti, commitne plán.
- Pak se spouští implementace task po tasku přes sonnet subagenty.

**Blokery:** žádné.
