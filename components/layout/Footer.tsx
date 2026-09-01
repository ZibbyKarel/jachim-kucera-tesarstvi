import { Link } from "@/i18n/routing";
import { SITE, navLinks, people } from "@/lib/constants";
import type { NavLink } from "@/lib/types";
import { useTranslations } from "next-intl";
import { FooterLogo } from "./Logo";

function navLabel(t: (key: string) => string, source: NavLink["textSource"]) {
  return source.ns === "service"
    ? t(`services.${source.slug}.title`)
    : t(`nav.${source.key}`);
}

/* -------------------------------------------------------------------------- */
/*  Footer — úzký timber pás                                                    */
/*                                                                              */
/*  Wordmark, navigace, telefon a e-mail jako odkazy, IČO, copyright. Nic       */
/*  víc - žádný popisný odstavec jako v1 (ten patřil k jinému rytmu stránky).   */
/* -------------------------------------------------------------------------- */

export function Footer() {
  const t = useTranslations();
  const year = 2026;

  return (
    <footer aria-label={t("common.siteFooterAria")} className="bg-timber">
      <div className="container-content flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between md:gap-6">
        {/* height=60 → šířka ~165px (FOOTER_LOGO_ASPECT_RATIO). Patička je
            bg-timber, takže logo jede v invertované variantě (viz
            logo2_clean_inverted.svg) — jinak by antracitový inkoust na
            tmavém poli prakticky zmizel. */}
        <FooterLogo height={60} />

        <nav
          aria-label={t("common.footerNavAria")}
          className="flex flex-wrap gap-x-6 gap-y-3"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-underline font-body text-sm text-paper"
            >
              {navLabel(t, link.textSource)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-4 font-mono text-sm">
          {people.map((person) => (
            <div key={person.key} className="flex flex-col gap-1">
              <span className="text-oak-soft">{person.name}</span>
              <a
                href={`tel:${person.phoneHref}`}
                className="link-underline w-fit text-paper"
              >
                {person.phone}
              </a>
            </div>
          ))}
          <a
            href={`mailto:${SITE.email}`}
            className="link-underline w-fit text-paper"
          >
            {SITE.email}
          </a>
        </div>
      </div>

      <div className="container-content flex flex-col gap-4 border-t border-paper/15 py-6 font-body text-xs text-oak-soft sm:flex-row sm:items-center sm:justify-between">
        {/* Skutečné IČO dodal klient (viz D-019), hodnota žije v lib/constants.ts. */}
        <div className="flex flex-col gap-1">
          {people.map((person) => (
            <p key={person.key}>
              {person.name} · {t("common.companyIdLabel")} {person.companyId}
            </p>
          ))}
        </div>
        <p>
          © {year} {SITE.name}. {t("common.allRightsReserved")}
        </p>
      </div>
    </footer>
  );
}
