import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import Image from "next/image";

// Intrinsic poměr stran public/logo1_clean.svg (742×686) — hlavičkový a
// hero lockup (kresba domu + vysázené jméno "JÁCHIM TESAŘ" na dvou řádcích),
// skoro čtvercový, ne širokoúhlý. Šířka se z výšky dopočítává tímhle
// poměrem, ať next/image dostane vždy správné rozměry a obrázek se
// nezkresluje.
export const LOGO_ASPECT_RATIO = 742 / 686;

// Intrinsic poměr stran public/logo2_clean_inverted.svg (706×256) — úzký
// jednořádkový lockup pro patičku (bg-timber, tmavé pole).
export const FOOTER_LOGO_ASPECT_RATIO = 706 / 256;

/**
 * Logo firmy pro hlavičku a mobilní hero (Opener.tsx) — `public/logo1_clean.svg`.
 * Jméno firmy je vysázené přímo v SVG, takže se vedle něj už nevysazuje
 * žádný samostatný text.
 *
 * Sizuje se podle výšky (`height`), ne podle hrany čtverce — při fixní
 * výšce next/image dopočítá šířku podle LOGO_ASPECT_RATIO.
 *
 * `heightClassName` je únikový poklop pro Header: lockup se tam musí měnit
 * podle breakpointu (a stavu scrollu), což jediné `height: number` neumí -
 * next/image z něj vyrábí `width`/`height` atributy (poměr stran, srcset),
 * ale skutečnou vykreslenou velikost přebijí Tailwindí výškové třídy (musí
 * mít i `w-auto` v `heightClassName` řetězci, ať šířka drží poměr stran).
 * Bez `heightClassName` se použije `height` jako pevný px rozměr.
 *
 * Obrázek má `alt=""` záměrně: jméno firmy nese `aria-label` odkazu (jediný
 * nositel jména po odstranění vysázené slovní značky vedle obrázku).
 * Popisný `alt` by ho hlásil dvakrát.
 *
 * `unoptimized`: SVG přes next/image optimalizační pipeline nejde bez
 * `images.dangerouslyAllowSVG` v next.config a u vektoru stejně nic
 * nepřináší (žádné responzivní zmenšování rastru).
 */
export function Logo({
  className = "",
  height = 88,
  heightClassName,
  tabIndex,
  /** Skryje logo asistivním technologiím a vyjme ho z tab pořadí, aniž by se
   *  odstranilo z DOM (viz Header.tsx - dočasné schování za mobilní hero logo). */
  ariaHidden,
}: {
  className?: string;
  height?: number;
  heightClassName?: string;
  tabIndex?: number;
  ariaHidden?: boolean;
}) {
  const t = useTranslations("nav");
  const width = Math.round(height * LOGO_ASPECT_RATIO);
  return (
    <Link
      href="/"
      aria-label={`${SITE.name}, ${t("home")}`}
      aria-hidden={ariaHidden}
      tabIndex={tabIndex}
      className={`group inline-flex items-center ${className}`}
    >
      <Image
        src="/logo1_clean.svg"
        alt=""
        width={width}
        height={height}
        priority
        unoptimized
        className={`shrink-0 object-contain transition-transform duration-500 ease-craft group-hover:scale-105 ${
          heightClassName ? `${heightClassName} w-auto` : ""
        }`}
        style={heightClassName ? undefined : { width, height }}
      />
    </Link>
  );
}

/**
 * Logo firmy pro patičku — `public/logo2_clean_inverted.svg`, jednořádkový
 * lockup s barvami obrácenými pro tmavé pole (bg-timber): inkoust → token
 * `paper`, patina → token `oak.soft` (viz komentář v souboru SVG a
 * lib/palette.ts). Patička je jediné místo, kde se tenhle lockup používá,
 * proto zvlášť komponenta místo `light` přepínače na `Logo` výš - jde o jiný
 * soubor s jiným poměrem stran, ne jen o přebarvení stejné kresby.
 */
export function FooterLogo({
  className = "",
  height = 60,
}: {
  className?: string;
  height?: number;
}) {
  const t = useTranslations("nav");
  const width = Math.round(height * FOOTER_LOGO_ASPECT_RATIO);
  return (
    <Link
      href="/"
      aria-label={`${SITE.name}, ${t("home")}`}
      className={`group inline-flex items-center ${className}`}
    >
      <Image
        src="/logo2_clean_inverted.svg"
        alt=""
        width={width}
        height={height}
        unoptimized
        className="shrink-0 object-contain transition-transform duration-500 ease-craft group-hover:scale-105"
        style={{ width, height }}
      />
    </Link>
  );
}
