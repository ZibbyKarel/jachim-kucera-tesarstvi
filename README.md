# Jáchim &amp; Kučera — Tesařství

Web tesařsko-pokrývačsko-klempířské firmy z Plzeňského kraje. Postavený na
Next.js 14 (App Router), Reactu 18 s TypeScriptem, Tailwind CSS a GSAP.

Centrem homepage je interaktivní izometrická skica domu, jejíž jednotlivé
části (krov, střecha, okapy, komín, vstup) fungují jako rozcestník na služby a
sekce webu.

---

## Tech stack

| Vrstva        | Technologie                                  |
| ------------- | -------------------------------------------- |
| Framework     | Next.js 14+ (App Router)                     |
| Jazyk         | TypeScript (strict)                          |
| Styly         | Tailwind CSS v3 + CSS custom properties      |
| Animace       | GSAP + ScrollTrigger + DrawSVGPlugin         |
| E-mail        | Web3Forms (kontaktní formulář)               |
| i18n          | next-intl (cs / en, zatím jen české texty)   |
| Obrázky       | next/image + Sharp                           |

---

## Rychlý start

```bash
npm install
cp .env.example .env.local   # doplň WEB3FORMS_KEY
npm run dev                  # http://localhost:3000
```

Další skripty:

```bash
npm run build      # produkční build
npm run start      # spuštění produkčního buildu
npm run typecheck  # kontrola typů (tsc --noEmit)
npm run lint       # ESLint
```

---

## Proměnné prostředí

Zkopíruj `.env.example` do `.env.local` a vyplň:

| Proměnná               | Popis                                                        |
| ---------------------- | ------------------------------------------------------------ |
| `WEB3FORMS_KEY`        | Access Key z [web3forms.com](https://web3forms.com).         |
| `NEXT_PUBLIC_SITE_URL` | Veřejná URL webu (sitemap, robots, canonical).               |

> **Bez `WEB3FORMS_KEY` ve vývoji** se formulář tváří úspěšně a poptávku jen
> vypíše do konzole, takže jde testovat UI bez nastaveného klíče.

### Nastavení Web3Forms

1. Zaregistruj se na [web3forms.com](https://web3forms.com) — stačí e-mail,
   na který mají chodit notifikace z formuláře.
2. Z dashboardu zkopíruj **Access Key** a vlož ho do `WEB3FORMS_KEY` v
   `.env.local` (a do prostředí produkce).
3. Žádná konfigurace domény ani DNS záznamy nejsou potřeba.

---

## Struktura projektu

```
app/
  [locale]/
    layout.tsx              root layout — fonty, metadata, JSON-LD, Header/Footer
    page.tsx                homepage (dům + scroll sekce)
    sluzby/<služba>/        4 detailní stránky služeb
    realizace/page.tsx      filtrovatelná galerie + modal
    o-nas/page.tsx          příběh, timeline, hodnoty
    kontakt/page.tsx        formulář + kontaktní info + mapa
    not-found.tsx           lokalizovaná 404
  api/contact/route.ts      odeslání formuláře přes Web3Forms
  sitemap.ts / robots.ts    technické SEO
components/
  house/                    IsometricHouse, HouseSection, useHouseRotation
  layout/                   Header, Footer, Logo, LanguageSwitcher
  sections/                 ServicesScroll, AboutSection, ContactSection, Timeline, …
  ui/                       Button, ServiceCard, ProjectGallery, ContactForm, …
lib/
  constants.ts              veškerý obsah (služby, realizace, texty)
  types.ts                  TypeScript typy dat
  gsap.ts                   registrace pluginů + prefers-reduced-motion
i18n/                       next-intl routing + request config
messages/                   cs.json, en.json (UI řetězce)
public/images/              fotky realizací a týmu (placeholdery)
```

---

## Obrázky

Reálné fotky nejsou součástí zadání. Komponenta
[`components/ui/ImageFrame.tsx`](components/ui/ImageFrame.tsx) proto vykresluje
architektonický **placeholder** se správným poměrem stran a `alt` textem.

Jakmile přidáš skutečné soubory do `public/images/...` (cesty jsou definované v
`lib/constants.ts`), přepni v `ImageFrame` konstantu `hasRealAsset` na `true` —
placeholder se nahradí optimalizovaným `next/image`.

Doporučené rozměry: realizace 1600×1200 (4:3), portréty 1200×1500 (4:5), hero
2400×1350 (16:9). Sharp se o varianty a formáty (AVIF/WebP) postará automaticky.

---

## Přístupnost

- Interaktivní části domu mají `role="button"`, `tabIndex`, `aria-label` a
  ovládání klávesnicí (Enter / Space).
- Viditelný focus ring (`outline: 2px solid #D47F3A`), skip-link na obsah.
- Všechny GSAP animace respektují `prefers-reduced-motion` (instantní finální
  stav).
- Sémantický HTML (`main`, `nav`, `section[aria-labelledby]`, `article`), jeden
  `h1` na stránku, popisky formulářů přes `<label>` a `aria-describedby`.
- Kontrast: cream `#F5ECD7` na dark `#1a1410` ≈ 12,5:1; amber `#D47F3A` ≈ 4,8:1.

---

## Animace

GSAP je centralizovaný v `lib/gsap.ts` (registrace `ScrollTrigger` a
`DrawSVGPlugin`). Každá animovaná komponenta používá `gsap.context()` a uklízí
se přes `ctx.revert()` v cleanupu `useEffect`. Horizontální scroll služeb a
parallax běží přes `ScrollTrigger` s `scrub`.

---

## Licence

© Jáchim &amp; Kučera. Veškerý obsah a kód k privátnímu použití klienta.
