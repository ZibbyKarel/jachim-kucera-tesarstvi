import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import Image from "next/image";

/**
 * Logo Jáchim & Kučera — firemní odznak (kruhové logo se štítovou střechou a
 * slovní značkou). Používá se v hlavičce i patičce. Obrázek nese celou značku,
 * proto vedle něj už není žádný textový název.
 */
export function Logo({
  className = "",
  /** Ponecháno kvůli zpětné kompatibilitě volání (obrázek se nepřebarvuje). */
  light: _light = false,
  size = 88,
}: {
  className?: string;
  light?: boolean;
  /** Hrana odznaku v px. */
  size?: number;
}) {
  const t = useTranslations("nav");
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — ${t("home")}`}
      className={`group inline-flex items-center ${className}`}
    >
      <Image
        src="/logo_2.png"
        alt={SITE.name}
        width={size}
        height={size}
        priority
        className="rounded-full object-contain transition-transform duration-500 group-hover:scale-105"
      />
    </Link>
  );
}
