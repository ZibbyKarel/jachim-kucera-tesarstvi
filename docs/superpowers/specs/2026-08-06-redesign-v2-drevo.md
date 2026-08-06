# Redesign v2 — „Dřevo a čas"

**Status:** schválený směr (uživatel, 2026-08-06)
**Nahrazuje:** `2026-08-06-website-redesign-design.md` v části vizuálního směru a struktury
homepage. Faktická data, i18n, URL slugy a SEO wiring z v1 zůstávají v platnosti.

---

## Proč v2

V1 vyměnila paletu, písma, texty a jednu sekci, ale **kostra zůstala původní**: stejný
scroll-jacking (stohující se panely `StackCover`), stejné pořadí sekcí, stejný 3D dům jako
hero i jako navigace. Uživatel to přečetl přesně tak, jak to je: „myslel sem ze vymyslíš
úplně jiný design a né jen upravíš barvy na designu co byl."

Rozhodnutí uživatele: **dům z landing page pryč** (zůstane na skryté URL `/nahled-3d`),
kompletně nový design bez ohledu na to, co v projektu je. Zachovat jen faktické údaje.

---

## Organizující myšlenka

Předmětem tohohle řemesla je **čas**. Krov je stoletý objekt. Střecha se měří v dekádách.
Firma prodává trvanlivost. Web tomu má odpovídat: má působit **těžce, pomalu a trvale** —
ne chytře.

Z toho plyne všechno ostatní:

- **Hmota místo pohybu.** Velká těžká typografie, hluboké teplé tmavé plochy, celoplošné
  barevné pásy. Sebevědomí vzniká váhou, ne animací.
- **Čísla v monospace.** Roky, rozpony, počty. Řemeslo je věrohodné, když je konkrétní.
- **Žádné karty.** Karta je univerzální známka šablony. Místo nich celoplošné pruhy,
  vlasové linky a sloupce.
- **Design musí být krásný i bez fotek.** Reálné fotky realizací zatím neexistují
  (`ImageFrame.hasRealAsset`). Fotografií vedený design by teď vypadal rozbitě. Rytmus
  proto nese **střídání barevných polí**, ne obrázky — a až fotky přijdou, jen se do
  připravených rámů posadí.

---

## Co se ruší

| Ruší se | Důvod |
|---|---|
| `StackCover` na homepage (stohující se panely) | Hlavní důvod, proč web působil stejně. Homepage má normální scroll. |
| `HeroScroll` + `HeroHouse` na homepage | Dům odchází z landingu (rozhodnutí uživatele). |
| `MobileServiceGrid` | Byl berličkou k domu. Nový rejstřík služeb je sám o sobě mobilní navigace. |
| sr-only „house nav" na homepage | Bez domu nedává smysl; navigaci nese rejstřík služeb. |
| `ServicesGrid` (bento) | Bento mřížka je karta v jiném obalu. |
| GSAP `ScrollTrigger` scrub/pin na homepage | Žádný scroll-jacking. |

## Co zůstává nedotčené

- **Faktické údaje verbatim:** telefon, e-mail, adresa/region, IČO placeholder (D-019).
- URL slugy, `localePrefix: 'as-needed'` (cs na `/`, en na `/en`), cs/en i18n.
- SEO metadata + JSON-LD `LocalBusiness`.
- Modul `components/house3d/` a stránka `/nahled-3d` — dům tam zůstane dostupný,
  neodkazovaný z navigace.
- `lib/palette.ts` jako **jediný zdroj hex hodnot** (D-024). Mění se hodnoty, ne princip.
- Kontrola: `npm run typecheck`, `npm run lint`, `npm run build` u každého commitu.

---

## Paleta

Přechod na **teplou dřevěnou** paletu, jak si ji uživatel představoval od začátku.
Sémantická jména se mění, aby neležela (zelená „patina" v dřevěné paletě nedává smysl):

| starý token | nový token | role |
|---|---|---|
| `paper` | `paper` | teplé papírové pozadí + `paper.dim` pro střídání ploch |
| `slate` | `timber` | velmi tmavá teplá hnědá — text a tmavé pásy + `timber.soft` |
| `steel` | `oak` | střední hnědá pro sekundární text + `oak.soft` pro text na tmavém |
| `patina` | `ember` | jediný akcent, pálená/terakotová + `ember.dim`, `ember.soft` |

**Hex hodnoty, naměřené kontrasty a minimální průhlednosti:** viz
`docs/superpowers/redesign/PALETTE-WOOD.md`. Do kódu jdou výhradně přes `lib/palette.ts`.

**Poučení z v1 (nepřehlédnout):** samotné tokeny tehdy prošly, ale utility s průhledností
(`text-slate/40`, `border-slate/25`) padaly až na 1.65:1. V PALETTE-WOOD.md jsou proto
uvedené **minimální přípustné hodnoty N** pro `timber/N` a `paper/N`. Pod ně se nesmí jít.

---

## Písma

| role | písmo | použití |
|---|---|---|
| display | **Fraunces** (variable, latin+latin-ext) | nadpisy, velké výroky, názvy služeb |
| body | **Archivo** | odstavce, formulář |
| mono | **IBM Plex Mono** | čísla, popisky, eyebrow, technické údaje |

Fraunces má měkkou, teplou kresbu a optical-size osu — sedí ke dřevu a je jasně jiná než
v1. **Podmínka:** česká diakritika (ě š č ř ž ý á í é ů ú ň ť ď) se ověří inspekcí cmap
tabulky staženého `.ttf` přes `fontTools`, ne odhadem — přesně jako v v1.

Aplikace přes `next/font/google` na `<html>`: `--font-display`, `--font-body`,
`--font-mono`. **Každá proměnná, kterou Tailwind konzumuje, musí být skutečně
definovaná** — v1 měla dvanáct tasků dlouho viset `--font-display` s fallbackem
`Georgia, serif` a nadpisy tiše padaly do patkového písma (D-025/D-026). CSS na neplatný
`var()` nikdy nezahlásí chybu.

---

## Struktura homepage

Normální scroll. Rytmus tvoří **střídání celoplošných barevných polí**:

```
paper      hlavička + otvírák
timber     rejstřík služeb          ← prudký skok kontrastu
paper      realizace
paper.dim  postup
timber     o nás
split      kontakt (paper | timber)
timber     patička
```

### 1. Hlavička

- Wordmark **vlevo nahoře, viditelný okamžitě a vždy** — na homepage i jinde.
  V1 ho nad hero schovávala (`opacity-0`) s odůvodněním „nese ho i dům"; dům žádný
  wordmark nenesl, takže nad ohybem nebyla značka vůbec a nejhlasitějším prvkem
  stránky bylo tlačítko. Přesně na tohle si uživatel stěžoval.
- Desktop: nav odkazy vpravo. Mobil: hamburger → fullscreen overlay (`timber` pole).
- **V hlavičce není vyplněné tlačítko.** CTA je textový odkaz s podtržením. Nic
  nesmí přehlušit značku.
- Po odscrollování se hlavička zafixuje a zúží (menší wordmark, hairline spodní linka,
  `paper/90` + backdrop blur).

### 2. Otvírák

`paper` pole, výška `min-h-[88svh]`, obsah zarovnaný dolů (ne na střed) — dává to váhu.

- Mono eyebrow: region + rok založení.
- **Nadpis** `Fraunces`, `clamp(2.75rem, 7vw, 6.5rem)`, leading `0.95`, `timber`.
  Nejvýš tři řádky.
- Jednořádkový podtitul v `oak`, max ~64 znaků.
- **Faktický pás**: hairline oddělené položky, číslice mono a velké v `timber`, popisky
  malé v `oak`.
  ⚠️ **Čísla se neberou odjinud než z existujícího obsahu** (`about.stats`, rok založení).
  Vymýšlet přesně vypadající čísla („240+ realizací") je zakázané — je to nepravda o
  reálné firmě.
- **CTA: dva textové odkazy se šipkou**, žádné vyplněné tlačítko:
  `Nezávazně poptat →` a `Prohlédnout realizace →`.

### 3. Rejstřík služeb

`timber` celoplošné pole. Čtyři řádky (tesarstvi, pokryvacstvi, klempirstvi,
cisteni-strech), každý je **celý odkaz**:

```
01   TESAŘSTVÍ            krovy, pergoly, dřevostavby                    →
──────────────────────────────────────────────────────────────────────────
02   POKRÝVAČSTVÍ         skládané krytiny, falcované plechy             →
```

- pořadové číslo: mono, `oak.soft`
- název: `Fraunces`, velký (clamp ~1.75rem→3rem), `paper`
- tagline: `oak.soft`, na mobilu pod názvem
- oddělovače: hairline `paper/N` (N dle PALETTE-WOOD.md, ≥ prahu pro 3:1)
- `min-h`: 120px desktop / 88px mobil
- hover i `:focus-visible`: pozadí řádku `ember`, text zůstává `paper`, šipka se posune
  doprava. Přechod ≤ 250 ms, pod `prefers-reduced-motion` jen změna barvy.

Tenhle prvek **nahrazuje mobilní navigaci**: řádky jsou celoplošné, vysoko nad 44px, a
jsou v DOM vždy. Žádná zvláštní mobilní komponenta není potřeba.

### 4. Realizace

`paper` pole. Nadpis vlevo, `Všechny realizace →` vpravo na stejném řádku.

Asymetrická sazba na 12 sloupcích: první realizace `col-span-7` s vysokým rámem,
další dvě naskládané v `col-span-5`. Pod každým rámem **popiska v mono**:
`PLZEŇ / 2024 / KROV`. Na mobilu jeden sloupec.

Rámy používají `ImageFrame`. Dokud nejsou fotky, rám ukazuje konstrukční rastr a svou
popisku — čte se to jako výkresový list, tedy záměrně, ne jako rozbitý obrázek.

### 5. Postup

`paper.dim` pole. Čtyři kroky vedle sebe (desktop) / pod sebou (mobil). Každý: velká mono
číslice v `ember`, krátký nadpis, jedna věta. Kroky spojuje jedna průběžná vlasová linka.
Žádné ikony.

Obsah vychází z `about.timeline` / vytvoří se nové klíče v `messages/*.json` — viz plán.

### 6. O nás

`timber` pole. Velký výrok (`Fraunces`, `paper`) přes ~8 sloupců, vedle krátký odstavec
v `oak.soft` a hodnoty jako prostý hairline oddělený seznam. Certifikáty jako mono řádek.
Odkaz `Více o nás →`.

### 7. Kontakt

Rozdělená obrazovka. Vlevo `paper`: formulář (`ContactForm`, funkčně beze změny — Web3Forms,
validace, stavy). Vpravo `timber`: **faktické údaje velké a čitelné** — telefon jako
`tel:` odkaz v display velikosti, e-mail, region, IČO. Tohle je závěrečný obraz stránky.

Na mobilu pod sebou: nejdřív faktické údaje, pak formulář.

### 8. Patička

Úzký `timber` pás: wordmark, navigace, IČO, copyright. Nic víc.

---

## Podstránky

Stejný jazyk, aplikovaný na existující šablony:

- **`/sluzby/[slug]`** (`ServicePageTemplate`) — otvírák jako na homepage (paper, mono
  eyebrow, Fraunces nadpis), `includes` jako číslovaný rejstřík na `timber` poli,
  galerie beze změny funkce, závěrečné CTA jako split kontakt.
- **`/realizace`** — mřížka s mono popiskami, filtr jako řádek textových odkazů
  s podtržením (ne pilulky/chips).
- **`/o-nas`** — editorial: velký výrok, `story` odstavce v širokém sloupci, `Timeline`
  přepsaný do stejného jazyka jako sekce Postup, statistiky jako faktický pás.
- **`/kontakt`** — plná verze split layoutu z homepage.
- **`/nahled-3d`** — beze změny funkce, jen nové barvy a písma. **Neodkazovaná z
  navigace.** Zůstává crawlovatelná jen přímým odkazem.
- **404** (`app/not-found.tsx` i `app/[locale]/not-found.tsx`) — nová paleta přes
  `import { PALETTE }`, ne přes hardcoded hex (v1 tam vada vznikla dvakrát).

---

## Pohyb

- **Žádný pin, žádný scrub, žádné stohování panelů.**
- Jediný povolený efekt: jemný `fade + rise` při vstupu sekce do viewportu (existující
  `Reveal`), trvání ≤ 600 ms, posun ≤ 16px.
- Hover přechody ≤ 250 ms.
- `prefers-reduced-motion: reduce` vypíná posun i fade (obsah je rovnou viditelný).

---

## Nepřekročitelná pravidla

1. **Faktické údaje verbatim.** Telefon, e-mail, region, IČO. Nic se nepřepisuje.
2. **Žádná vymyšlená čísla.** Statistika, která není v obsahu, se nevymýšlí.
3. **Žádné hex hodnoty mimo `lib/palette.ts`.** Jediná výjimka:
   `setClearColor(0x000000, 0)` v `SceneManager` — je to alfa kanál, ne barva (D-022).
4. **Žádné pomlčky (— –) v uživatelsky viditelném textu** (D-021: týká se jen textu, který
   uživatel vidí, ne českých komentářů v kódu). Nepřepisovat je mechanicky na dvojtečky
   (D-027) — reformuluj větu.
5. **Kontrast**: každá dvojice barva/pozadí, včetně variant s průhledností, musí sedět na
   tabulku v PALETTE-WOOD.md. Neměřené průhlednosti jsou zakázané.
6. **A11y**: focus ring viditelný všude, `aria-label` u každého landmarku, cíle ≥ 44px,
   skip link funkční.
7. Každý commit projde `typecheck` + `lint` + `build`.
