import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import Image from "next/image";

// Intrinsic poměr stran zdrojového PNG (public/logo_2.png je 867×463 px) —
// širokoúhlý lockup kresby domu a vysázeného jména firmy, ne čtvercový
// odznak. Šířka se z výšky dopočítává tímhle poměrem, ať next/image dostane
// vždy správné rozměry a obrázek se nezkresluje.
const LOGO_ASPECT_RATIO = 867 / 463;

/**
 * Logo Jáchim & Kučera — širokoúhlý lockup (kresba domu + vysázené jméno
 * firmy + "TESAŘSTVÍ"), ne kulatý odznak. Jméno firmy je součástí obrázku
 * samotného, takže se vedle něj už nevysazuje žádný samostatný text.
 *
 * Sizuje se podle výšky (`height`), ne podle hrany čtverce — při fixní
 * výšce next/image dopočítá šířku podle LOGO_ASPECT_RATIO, takže lockup
 * nikdy nevypadá stlačený ani neoříznutý.
 *
 * `light` přepíná mezi dvěma PNG soubory, ne mezi CSS barvami: inkoust
 * lockupu je rastrový (kresba + písmo v jednom obrázku), takže "světlá
 * varianta" znamená jiný soubor (public/logo-paper.png, vygenerovaný
 * scripts/generate-logo-paper.mjs), ne přebarvení textu.
 *
 * Obrázek má `alt=""` záměrně: jméno firmy nese `aria-label` odkazu (jediný
 * nositel jména po odstranění vysázené slovní značky vedle obrázku).
 * Popisný `alt` by ho hlásil dvakrát.
 */
export function Logo({
  className = "",
  /** Světlá varianta loga (na tmavém poli, např. patička). */
  light = false,
  /** Výška loga v px — šířka se dopočítá z LOGO_ASPECT_RATIO. */
  height = 88,
  tabIndex,
}: {
  className?: string;
  light?: boolean;
  height?: number;
  tabIndex?: number;
}) {
  const t = useTranslations("nav");
  const width = Math.round(height * LOGO_ASPECT_RATIO);
  return (
    <Link
      href="/"
      aria-label={`${SITE.name}, ${t("home")}`}
      tabIndex={tabIndex}
      className={`group inline-flex items-center ${className}`}
    >
      <Image
        src={light ? "/logo-paper.png" : "/logo_2.png"}
        alt=""
        width={width}
        height={height}
        priority
        className="shrink-0 object-contain transition-transform duration-500 ease-craft group-hover:scale-105"
        style={{ width, height }}
      />
    </Link>
  );
}
