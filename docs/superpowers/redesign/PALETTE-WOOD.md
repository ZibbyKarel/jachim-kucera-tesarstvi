# Wood palette candidate ("dřevěná" paleta)

Návrh teplé dřevěné palety jako náhrada za současnou chladnou "materiálovou"
paletu v `lib/palette.ts` (paper/slate/steel/patina). **Tento dokument
nemění žádný kód** — je to výpočetní podklad pro budoucí úpravu
`lib/palette.ts`. Struktura klíčů odpovídá tomu, jak by nový `PALETTE`
objekt vypadal.

Estetika: neošetřené modřínové dřevo (paper/timber/oak, hue ~30–44°,
tlumená saturace 28–44 %) + rez na plechu jako jediný akcent (ember,
hue ~17–22°, saturace ~65 %, ne plastová oranžová #ff8800).

## Finální hex hodnoty

```ts
export const PALETTE = {
  paper: {
    DEFAULT: '#f1ebdb', // teplé ovesné pozadí
    dim: '#e6dcc4',     // o odstín tmavší plocha, střídání sekcí
  },
  timber: {
    DEFAULT: '#241c14', // velmi tmavá teplá hnědá — hlavní text, tmavé plochy
    soft: '#362a1c',    // o něco světlejší tmavá — sekundární tmavé plochy
  },
  oak: {
    DEFAULT: '#6b5738', // střední teplá hnědá — sekundární text na světlém
    soft: '#cbb693',    // světlá varianta — text/linky na TMAVÉM pozadí
  },
  ember: {
    DEFAULT: '#9a4220', // jediný akcent — pálená terakota/rez
    dim: '#7c3719',     // tmavší — hover/pressed akcentu na světlém pozadí
    soft: '#e0966a',    // světlejší — text/focus ring na TMAVÉM pozadí
  },
} as const
```

HSL kontrola (kvůli "žádná bahno-hnědá, žádná plastová oranžová"):

| token | hex | H | S | L |
|---|---|---|---|---|
| paper | `#f1ebdb` | 43.6° | 44.0% | 90.2% |
| paper.dim | `#e6dcc4` | 42.4° | 40.5% | 83.5% |
| timber | `#241c14` | 30.0° | 28.6% | 11.0% |
| timber.soft | `#362a1c` | 32.3° | 31.7% | 16.1% |
| oak | `#6b5738` | 36.5° | 31.3% | 32.0% |
| oak.soft | `#cbb693` | 37.5° | 35.0% | 68.6% |
| ember | `#9a4220` | 16.7° | 65.6% | 36.5% |
| ember.dim | `#7c3719` | 18.2° | 66.4% | 29.2% |
| ember.soft | `#e0966a` | 22.4° | 65.6% | 64.7% |

Dřevěné tóny (paper/timber/oak) sdílejí úzké hue pásmo 30–44° s tlumenou
saturací (28–44 %) — vypadají jako jedna dřevěná rodina, ne jako
náhodné hnědé. Ember sedí na jiném, teplejším a sytějším hue (17–22°,
~65 % sat.) — jasně odlišený akcent (rez), ale ne saturovaná oranžová
(ta by byla ~30–40° při ~100 % sat.).

## Naměřená kontrastní tabulka (WCAG 2.1, sRGB-linearizovaná relativní luminance)

Vypočteno skriptem `/Users/zibby/.claude/jobs/69864659/tmp/contrast.py`
(vzorec `(L1+0.05)/(L2+0.05)`, `L` = relativní luminance po sRGB→lineární
transformaci s prahem 0.04045).

### Na světlém pozadí

| dvojice (text/UI → pozadí) | fg | bg | poměr | práh | verdikt |
|---|---|---|---|---|---|
| timber / paper | `#241c14` | `#f1ebdb` | **14.10:1** | ≥7:1 | PASS |
| timber / paper.dim | `#241c14` | `#e6dcc4` | **12.31:1** | ≥7:1 | PASS |
| timber.soft / paper | `#362a1c` | `#f1ebdb` | **11.73:1** | ≥4.5:1 | PASS |
| oak / paper | `#6b5738` | `#f1ebdb` | **5.79:1** | ≥4.5:1 | PASS |
| oak / paper.dim | `#6b5738` | `#e6dcc4` | **5.06:1** | ≥4.5:1 | PASS |
| ember / paper | `#9a4220` | `#f1ebdb` | **5.56:1** | ≥4.5:1 | PASS |
| ember / paper.dim | `#9a4220` | `#e6dcc4` | **4.85:1** | ≥4.5:1 | PASS |
| paper / ember (text na tlačítku) | `#f1ebdb` | `#9a4220` | **5.56:1** | ≥4.5:1 | PASS |

### Na tmavém pozadí

| dvojice | fg | bg | poměr | práh | verdikt |
|---|---|---|---|---|---|
| paper / timber | `#f1ebdb` | `#241c14` | **14.10:1** | ≥7:1 | PASS |
| oak.soft / timber | `#cbb693` | `#241c14` | **8.51:1** | ≥4.5:1 | PASS |
| oak.soft / timber.soft | `#cbb693` | `#362a1c` | **7.08:1** | ≥4.5:1 | PASS |
| ember.soft / timber | `#e0966a` | `#241c14` | **6.99:1** | ≥4.5:1 | PASS |

### Nebarevné UI prvky (≥3:1)

| dvojice | fg | bg | poměr | práh | verdikt |
|---|---|---|---|---|---|
| ember / paper (focus ring) | `#9a4220` | `#f1ebdb` | **5.56:1** | ≥3:1 | PASS |
| ember.soft / timber (focus ring, tmavý panel) | `#e0966a` | `#241c14` | **6.99:1** | ≥3:1 | PASS |

### Bonus (nepovinné, pro úplnost hover stavu akcentu)

| dvojice | fg | bg | poměr | poznámka |
|---|---|---|---|---|
| paper / ember.dim (text na tlačítku při hoveru) | `#f1ebdb` | `#7c3719` | **7.30:1** | výplň tlačítka tmavne při hoveru, kontrast textu roste — bezpečné |

**Všech 14 povinných dvojic PASS. Žádný kompromis na úkor laťky nebyl potřeba** —
jediná úprava oproti první iteraci byla ztmavení `ember` z `#a34a26` na
`#9a4220` (viz níže).

## Minimální přípustná průhlednost (utility jako `text-oak/40`)

Kompozit počítán jako `alpha*fg + (1-alpha)*bg` po složkách v sRGB prostoru
(tak, jak to dělá CSS/Tailwind `opacity`/`/N` na barvu), poté teprve
přepočet na luminanci a kontrast. Krok hledání: po 5 (Tailwind opacity
stupně).

| účel | fg | bg | práh | min. N (%) | dosažený poměr při min. N |
|---|---|---|---|---|---|
| `timber/N` jako text na `paper` | `#241c14` | `#f1ebdb` | ≥4.5:1 | **N ≥ 65** | 4.87:1 |
| `timber/N` jako hranice/linka na `paper` | `#241c14` | `#f1ebdb` | ≥3:1 | **N ≥ 50** | 3.13:1 |
| `paper/N` jako text na `timber` | `#f1ebdb` | `#241c14` | ≥4.5:1 | **N ≥ 50** | 4.50:1 |
| `paper/N` jako linka na `timber` | `#f1ebdb` | `#241c14` | ≥3:1 | **N ≥ 40** | 3.37:1 |

Poučení z minulého kola potvrzeno: **necelá polovina** stupnice
neprochází vůbec (`timber/25`, `timber/40` pro text by padly stejně jako
minule). Utility s `/N` menším než výše uvedené minimum se nesmí použít
pro text ani pro linku, jen pro čistě dekorativní plochy (např. pozadí
skvrny, ne nosič informace).

## Legální a zakázané dvojice

### Legální (smí se kombinovat)

- **Text na světlém:** `timber` nebo `timber.soft` (hlavní text), `oak`
  (sekundární text/labely), `ember` (odkazy, akcentní text, aktivní
  stav) — vše na `paper` i `paper.dim`.
- **Text na tmavém:** `paper` (hlavní text), `oak.soft` (sekundární
  text/labely), `ember.soft` (odkazy, akcentní text) — na `timber` i
  `timber.soft`.
- **Tlačítka/plochy akcentu:** `paper` text na `ember` (default) nebo
  `ember.dim` (hover/pressed) výplni.
- **Focus ring:** `ember` na světlém pozadí, `ember.soft` na tmavém
  pozadí.
- **Průhledné varianty:** `timber/N` (N≥65 text, N≥50 linka) na `paper`
  nebo `paper.dim`; `paper/N` (N≥50 text, N≥40 linka) na `timber` nebo
  `timber.soft`.

### Zakázané

- `oak` nebo `oak.soft` navzájem prohozené podle pozadí — `oak` (tmavší)
  je **jen** pro světlé pozadí, `oak.soft` (světlejší) je **jen** pro
  tmavé pozadí. Obráceně kontrast nevychází (nebylo ani měřeno — je to
  mimo návrh).
- `ember.soft` jako text na `paper`/`paper.dim` — je navržený jen pro
  tmavé pozadí, na světlém pozadí by byl nedostatečný kontrast.
- `ember.dim` jako text/akcent na `paper` mimo hover výplň tlačítka —
  není verifikovaný jako samostatný textový token, jen jako plocha pod
  `paper` textem.
- Jakákoli `/N` průhledná varianta `timber` nebo `paper` použitá jako
  nosič informace (text, linka, ikona) pod hranicí z tabulky výše.
- `timber` text na `ember`/`ember.dim`/`ember.soft` a `oak` text na
  `ember*` — žádná z těchto kombinací nebyla měřena ani navržena,
  akcent se kombinuje jen s `paper`.

## Kompromisy

Jediný kompromis oproti první navržené iteraci: `ember` muselo být
ztmavené z `#a34a26` (H=13.4°, na `paper.dim` jen 4.32:1) na finální
`#9a4220`, protože akcent na `paper.dim` je nejpřísnější vazba v celé
sadě (tmavší pozadí + středně sytý akcent = nejmenší rezerva). Ztmavení
zároveň zlepšilo `paper`-na-`ember` (bílý text na tlačítku) z 4.95:1 na
5.56:1, takže rezerva pro budoucí drobné doladění hue/sytosti zůstává
na obou stranách.
