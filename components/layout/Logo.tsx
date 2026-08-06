import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import Image from "next/image";

/**
 * Logo Jáchim & Kučera — kruhový odznak se štítovou střechou, volitelně
 * doplněný vysázenou slovní značkou.
 *
 * Odznak sám nese jméno firmy jen jako součást kresby, a pod ~64 px je
 * nečitelný — v hlavičce tedy funguje jako značka, ne jako jméno. Proto
 * `wordmark`: odznak + vysázené jméno vedle sebe. Uživatel si stěžoval, že
 * na titulní stránce byl výraznější odkaz na poptávku než logo firmy; jméno
 * musí být čitelné, ne jen naznačené.
 *
 * Obrázek má `alt=""` záměrně: jméno firmy nese `aria-label` odkazu, a když
 * je zapnutý `wordmark`, i viditelný text. Popisný `alt` by ho hlásil dvakrát.
 */
export function Logo({
  className = "",
  /** Světlá varianta slovní značky (na tmavém pozadí). Odznak se nepřebarvuje. */
  light = false,
  /** Hrana odznaku v px. */
  size = 88,
  /** Vysázet vedle odznaku i jméno firmy. */
  wordmark = false,
  tabIndex,
}: {
  className?: string;
  light?: boolean;
  size?: number;
  wordmark?: boolean;
  tabIndex?: number;
}) {
  const t = useTranslations("nav");
  return (
    <Link
      href="/"
      aria-label={`${SITE.name}, ${t("home")}`}
      tabIndex={tabIndex}
      className={`group inline-flex items-center gap-3 ${className}`}
    >
      <Image
        src="/logo_2.png"
        alt=""
        width={size}
        height={size}
        priority
        className="shrink-0 rounded-full object-contain transition-transform duration-500 ease-craft group-hover:scale-105"
        style={{ width: size, height: size }}
      />
      {wordmark && (
        <span
          aria-hidden="true"
          className={`hidden whitespace-nowrap font-display text-base leading-none tracking-tight transition-colors duration-300 sm:inline ${
            light ? "text-paper" : "text-timber"
          }`}
        >
          {SITE.shortName}
        </span>
      )}
    </Link>
  );
}
