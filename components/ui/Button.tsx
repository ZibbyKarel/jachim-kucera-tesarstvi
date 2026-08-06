/* -------------------------------------------------------------------------- */
/*  Arrow — jediné, co z téhle komponenty redesign v2 skutečně používá.         */
/*                                                                              */
/*  Spec §"Nepřekročitelná pravidla": v2 nemá vyplněná tlačítka mimo formulář   */
/*  (CTA jsou textové odkazy s podtržením). Původní `Button` (primary/outline/  */
/*  ghost varianty, `variant`/`size` props) po T2–T5 nikde neimportuje - grep   */
/*  `<Button` i `import { Button }` v celém app/ a components/ vrací 0 hitů,    */
/*  proto byl smazán jako mrtvý kód (T6/A3), `Arrow` zůstává.                   */
/* -------------------------------------------------------------------------- */

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 6h15M11 1l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
