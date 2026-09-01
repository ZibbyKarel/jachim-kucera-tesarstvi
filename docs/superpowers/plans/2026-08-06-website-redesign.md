# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current warm cream/brass/charcoal "artisan" visual language across the entire site with the approved "Materiály řemesla" (steel/slate/patina/paper) technical-drawing language, without changing routes, facts, i18n, a11y wiring, or GSAP/StackCover scroll mechanics.

**Architecture:** All color flows through five Tailwind tokens (`paper`, `slate`, `steel`, `patina`, plus a dark-surface-only `patina-soft` variant) defined once in `tailwind.config.ts` and consumed everywhere else via utility classes or the mirrored CSS custom properties in `app/globals.css` — component structure, routing, and the GSAP/StackCover pin choreography are untouched **except in one place**: the homepage Services section, whose old horizontal-scroll GSAP pin is deleted outright in Task 6 in favor of a static bento grid, which changes how it participates in `StackCover`'s shared pin/climb mechanism (documented explicitly in Task 6, not left dangling). The two things that look risky but are not architecturally hard are (a) the 3D house, whose colors are already centralized in `components/house3d/config.ts`, and (b) the rest of the homepage scroll choreography (`HeroScroll` → `StackCover`-wrapped Realizace/O nás/Kontakt), which is preserved by only ever touching color/typography classes inside it, never its pin/sticky/climb logic. Token hex values are not the spec's literal starting points verbatim — three of them (`steel`, `patina`, `patina-dim`) are tuned darker/lighter from the spec's starting hexes specifically to clear WCAG AA, computed with a script and verified in Task 1 rather than assumed; see the token table below.

**Tech Stack:** Next.js 14.2.15 (App Router), TypeScript 5.5 (strict), Tailwind CSS 3.4.10, GSAP 3.12.5 (+ ScrollTrigger, DrawSVGPlugin), raw `three` 0.185.0 (no `@react-three/fiber`/`@react-three/drei` — the 3D house is hand-rolled imperative Three.js), next-intl 3.20, React 18.3. `playwright: ^1.61.1` is listed in `package.json` devDependencies, but there is no Playwright config file, no spec files, and no `test` script wired up anywhere in the repo — it is an installed-but-unused dependency, not an active test framework. Practical conclusion is unchanged: there is nothing to run as an automated test suite, so verification per task is `npm run typecheck`, `npm run lint`, and `npm run build`.

## Global Constraints

- Stack unchanged: Next.js 14 App Router, TypeScript strict, Tailwind CSS v3, GSAP. NO new design system (no shadcn/Radix/MUI).
- Palette starting values (tokens, tunable later): steel/zinc `#8a9296`, slate `#1c2226`, patina (SINGLE accent) `#5b8a72`, paper `#eef0ef`. ONE accent color across the entire site — no secondary CTA colors.
- All color must go through Tailwind tokens / CSS custom properties. No hardcoded hex in components.
- Typography: sans-serif grotesk display + technical mono for numbers/specs/contact details. NO serif. Load via `next/font`. Emphasis uses italic/bold of the SAME family, never a mixed font family.
- ZERO em-dashes (— or –) in any user-visible string, in any language file, in any component. Use a regular hyphen.
- Preserve verbatim: all phone numbers, e-mail addresses, physical addresses currently in `lib/constants.ts` / `messages/*.json`.
- Preserve: all URL slugs/routes, cs+en i18n via next-intl, existing a11y wiring (role/aria-label/keyboard handlers on 3D house parts, focus ring, skip link, semantic HTML), SEO metadata + JSON-LD.
- `prefers-reduced-motion` must be honored by every animation.
- Mobile (<768px): the 3D house must NOT be the only navigation. An explicit tappable service card list/grid (min 44x44px targets) must be present below it.
- No AI-slop decorations: no scroll cues ("Scroll", ↓), no section-number eyebrows (`01 / INDEX`), no version labels, no locale/weather strips, no decorative status dots, no `border-t`+`border-b` on every row of a list, no fake precision numbers.
- Max 1 eyebrow (small uppercase tracking label above a headline) per 3 sections across the whole site.
- Every commit must pass `npm run typecheck` and `npm run lint`.

### Legal color-pairing matrix (D-020 addendum — every token's allowed backgrounds)

The bullets above are the original spec constraints, unedited. This table is an addition, added per D-020 after a review found two dark-background pairings (`steel` and `patina` directly on `slate`) that this plan does not use anywhere today, but which are not otherwise prevented from being introduced by a later task or a future change. "A raw hex is a blocking defect" (see Task 11) is a syntactic rule; this table is the semantic rule underneath it — even using the _correct token name_ is a defect if it's paired with a background it fails against. Every ratio below was measured with the WCAG relative-luminance formula against the final Task 1 hex values (`steel #5f666a`, `steel-soft #b7bcbe`, `patina #486c5a`, `patina-dim #3a5648`, `patina-soft #74a48c` — the D-020-revised value).

| Foreground token      | as text on `paper`                                                                       | as text on `paper-dim` | as text on `slate`     | as text on `slate-soft` |
| --------------------- | ---------------------------------------------------------------------------------------- | ---------------------- | ---------------------- | ----------------------- |
| `slate`               | 14.05:1 ✓                                                                                | 12.67:1 ✓              | n/a (same family)      | n/a                     |
| `paper` / `paper-dim` | n/a                                                                                      | n/a                    | 14.05:1 / 12.67:1 ✓    | 11.53:1 / 10.40:1 ✓     |
| `steel`               | 5.10:1 ✓                                                                                 | 4.60:1 ✓               | **2.75:1 ✗ forbidden** | **2.26:1 ✗ forbidden**  |
| `steel-soft`          | 1.68:1 ✗ forbidden                                                                       | 1.51:1 ✗ forbidden     | 8.38:1 ✓               | 6.88:1 ✓                |
| `patina`              | 5.14:1 ✓                                                                                 | 4.64:1 ✓               | **2.73:1 ✗ forbidden** | **2.24:1 ✗ forbidden**  |
| `patina-dim`          | not used as standalone text (button-hover fill only, `paper` text sits on it, see below) |                        | 1.99:1 ✗ forbidden     | 1.64:1 ✗ forbidden      |
| `patina-soft`         | 2.47:1 ✗ forbidden                                                                       | 2.23:1 ✗ forbidden     | 5.69:1 ✓               | 4.67:1 ✓                |

**Rules that follow from this table:**

- **`steel` and `patina` are light-background-only.** Never apply `text-steel`, `text-patina`, `hover:text-patina`, `border-patina` (as a would-be text color), etc. to anything rendered on `slate` or `slate-soft`. Use `steel-soft` / `patina-soft` there instead.
- **`steel-soft` and `patina-soft` are dark-background-only.** Never use them as text on `paper` or `paper-dim` — both fail AA badly there (patina-soft 2.47:1/2.23:1, steel-soft 1.68:1/1.51:1), the inverse mistake of the one above.
- **`patina-dim`** is a light-background CTA hover _fill_ (`paper` text sits on top of it at 7.04:1) — it is not used as standalone foreground text anywhere in this plan, and per this table it must not be, on any background.
- **Non-text uses (borders, icon strokes, dividers, decorative lines) are exempt** from this table — WCAG text-contrast thresholds don't apply to them (they're still subject to the 3:1 non-text-UI-component rule only where they convey information on their own, e.g. a focus ring or an icon-only control).
- Every task in this plan that places `steel`/`patina`/`steel-soft`/`patina-soft` on a background is expected to already comply with this table (see Task 1's token table and Task 3's Header/LanguageSwitcher fixes); Task 12 Step 3 re-verifies it as a regression gate.

## Audit-derived facts this plan relies on

- **Tailwind v3** confirmed (`tailwindcss: ^3.4.10`, `@tailwind base/components/utilities` in `app/globals.css`). No v4 syntax anywhere.
- **Fonts today**: `Cormorant_Garamond` (serif, display) + `DM_Sans` (body), both loaded via `next/font/google` in `app/[locale]/layout.tsx:1-24` as `--font-display`/`--font-body`. The serif must go entirely (spec forbids serif).
- **Color tokens today**: `wood.dark/medium/warm/light/amber`, `charcoal`, `steel.dark/medium/light` (unused anywhere, dead), `cream` (`#2d2b28` — identically the same hex as `charcoal.DEFAULT`, i.e. two token names for one color) — all defined in `tailwind.config.ts:11-36` and mirrored as CSS vars in `app/globals.css:5-18`. Every component consumes color exclusively through these tokens (confirmed via repo-wide grep) **except** 15 hardcoded hex-literal sites that bypass the token system entirely (listed per-task below) — these must be fixed as part of this redesign, not just re-pointed.
- **3D house is TWO separate, only-one-of-them-live implementations**:
  - `components/house3d/*` (raw Three.js, `SceneManager`/`HouseModel`/`ArchElement`/`MenuOverlay`/`config.ts`) is the **live** implementation, rendered via `HeroScroll` → `HeroHouse` → `House3DScene` on the real homepage (`app/[locale]/page.tsx`). Its colors are centralized in `components/house3d/config.ts` (`COLORS`), consumed by `ArchElement.ts`, `HouseModel.ts:320`, `SceneManager.ts:92`, `MenuOverlay.ts` — low risk to retheme. Two spots bypass this: `HouseModel.ts:317` (hardcoded `0xe9eaeb` window color) and `SceneManager.ts:196/199/218` (hardcoded light colors).
  - `components/house/IsometricHouse.tsx` (old SVG "skica" + GSAP `drawSVG`) is **dead code** — imported nowhere except a stale comment reference in `lib/constants.ts:193`. It gets deleted in this plan rather than retheme'd.
  - The live 3D house's clickable `MENU` (`components/house3d/config.ts`) only covers **3 of 6** destinations (`roof`→pokryvačství, `pergola`→tesařství, `gutters`→klempířství). Chimney/windows/door (→ realizace/o-nas/kontakt) are merged into other elements as non-interactive decor (`HouseModel.ts` — chimney merged into the gutters `ArchElement`, windows and entrance built with `menuId: null`) and are reachable today **only** via the header nav and the `sr-only` fallback `<nav>` in `app/[locale]/page.tsx:41-51` (which correctly lists all 6 `houseLabels` from `lib/constants.ts`). This plan does not change that split — see "Judgment calls" in the report back to the user.
  - No gyro tilt exists (never implemented despite the old spec mentioning it). `OrbitControls` drag is explicitly _disabled_ in hero/transparent mode (`SceneManager.ts:131-136`) so wheel/touch scroll isn't swallowed — the only motion today is a continuous idle float/breathing/light-drift loop (`SceneManager.ts` `tick()`) that currently has **no `prefers-reduced-motion` guard** (only the intro reveal is gated) — this is a real bug against the "respektováno všude" requirement and gets fixed in Task 4.
  - Mobile handling that exists today: `MenuOverlay.ts` reflows its 3 HTML labels into a centered chip row below 768px, and `SceneManager.ts:420` hides the decorative fence below 768px. **No 44×44px card grid exists** — this is genuinely new work, not an adaptation (Task 5).
- **Em-dashes are pervasive**: 36 occurrences in `messages/cs.json`, 35 in `messages/en.json` (71 total, every namespace touched — `common`, `home`, `contact`, `about`, `service`/`services`, `houseLabels`, `seo`, `notFound`, `projectsData`), plus **one outside the message files that is easy to miss**: `lib/constants.ts:4` `SITE.name = 'Jáchim & Kučera — Tesařství'`, which propagates into every page's `<title>`, OpenGraph, Twitter card, JSON-LD, and the visible Footer copyright line on every single page. Also one hardcoded in JSX template-string concatenation in five places (`ServiceCard.tsx:34`, `ProjectGallery.tsx:103,210`, `ProjectsPreview.tsx:53`, `ServicePageTemplate.tsx:23`, `Logo.tsx:28`, `app/[locale]/page.tsx:46`) of the form `` `${a} — ${b}` `` building `alt`/`aria-label` text, and one in `app/not-found.tsx` (root, outside next-intl) as a literal "404 — Page not found" string.
- **Anti-slop violations already in the codebase**: an explicit pulsing-arrow scroll cue in `components/house/HeroScroll.tsx:94-108` (`t('home.scrollCue')` + `animate-scroll-cue` keyframe); the `.eyebrow` label used **15+ times** across the site (budget is roughly 4-5 for a site this size); a `0{i+1}` section-number pattern in `app/[locale]/o-nas/page.tsx:129`; a fabricated placeholder company ID `"IČO 000 00 000"` rendered in the Footer on every page (`messages/*.json` `common.companyIdLabel`, consumed at `Footer.tsx:70`) — **resolution per D-019** (`docs/superpowers/redesign/DECISIONS.md`, supersedes the earlier D-015): kept, not removed, because IČO is a legally required disclosure on a Czech company site and no real value exists anywhere in the repo to substitute; Task 3 marks it with a code comment and it is already tracked in the pre-launch checklist in `docs/superpowers/redesign/PROGRESS.md`.
- **No real photo assets exist** (`public/images/**/.gitkeep` only) — `ImageFrame` always renders its placeholder (`hasRealAsset = false`), which the spec requires to look like an intentional technical/material pattern rather than "missing image".
- **No active test framework.** `package.json` lists `playwright: ^1.61.1` as a devDependency, but there is no Playwright config, no spec files, and no `test` script anywhere in the repo — it's installed but not wired up to anything. Verification per task is `npm run typecheck`, `npm run lint`, and (for tasks touching build-affecting files) `npm run build`.

## Design tokens: WCAG contrast verification (governs Task 1)

The spec's four starting hex values are explicitly a tunable starting point ("Přesné hex hodnoty se doladí až v implementaci (kontrast WCAG AA...)" — spec §3.1/§9). Rather than assume the starting values pass and patch contrast failures at the end, every foreground/background pair the design actually uses was computed with a script (WCAG 2.x relative-luminance formula, sRGB) before Task 1 was written. Two of the four starting values fail AA outright at their literal spec hex (`steel` on `paper`/`paper-dim` is ~2.6-2.8:1; `patina` on `paper`/`paper-dim` is ~3.1-3.5:1 — both fail the 4.5:1 body-text threshold), and a fifth token (`patina-soft`) had to be added because no single `patina` shade can simultaneously pass 4.5:1 as text on light `paper` _and_ as text/focus-ring on dark `slate` — the same problem the original `steel`/`steel-soft` pair already solved for the neutral, extended here to the accent.

Script location: `/tmp/fontcheck/contrast.py` (scratch path, not committed to the repo — this is a one-time derivation, not a build-time check; re-run it by hand if tokens are retuned later). Method: standard WCAG relative-luminance contrast ratio; each tuned value was found by binary-searching the _minimal_ darken/lighten (in HLS lightness, hue and saturation preserved) that clears the target ratio with a small safety margin (4.6:1 target instead of the bare 4.5:1 AA minimum, so rendering/anti-aliasing rounding can't tip a pair below the legal line), then rounded to a hex triplet.

**Final token values** (unchanged values are the spec's literal starting hex; changed values are noted):

| Token              | Spec starting hex          | Final hex                                      | Role                                                                                                                                                                                                                                                            |
| ------------------ | -------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paper` (DEFAULT)  | `#eef0ef`                  | `#eef0ef` (unchanged)                          | primary light background                                                                                                                                                                                                                                        |
| `paper-dim`        | _(not in spec, derived)_   | `#e2e5e3` (unchanged)                          | secondary light background                                                                                                                                                                                                                                      |
| `slate` (DEFAULT)  | `#1c2226`                  | `#1c2226` (unchanged)                          | text / dark surfaces                                                                                                                                                                                                                                            |
| `slate-soft`       | _(not in spec, derived)_   | `#2a3136` (unchanged)                          | secondary dark background                                                                                                                                                                                                                                       |
| `steel` (DEFAULT)  | `#8a9296`                  | **`#5f666a`** (darkened)                       | text/numbers/labels on light backgrounds, plus general borders (no contrast requirement there)                                                                                                                                                                  |
| `steel-soft`       | _(not in spec, derived)_   | `#b7bcbe` (unchanged)                          | text/borders on **dark** backgrounds only                                                                                                                                                                                                                       |
| `patina` (DEFAULT) | `#5b8a72`                  | **`#486c5a`** (darkened)                       | the single accent on **light** backgrounds: CTA fill, links, active state, headings, focus ring                                                                                                                                                                 |
| `patina-dim`       | _(not in spec, derived)_   | **`#3a5648`** (re-derived)                     | darker hover/pressed state of the accent, on light backgrounds                                                                                                                                                                                                  |
| `patina-soft`      | _(new token, not in spec)_ | **`#74a48c`** (new; revised — see D-020 below) | the same accent hue, lightened, for text/hover-state/focus-ring/active-state on **dark** (`slate` **and** `slate-soft`) backgrounds only — mobile-menu nav-link hover, active-locale indicator in the dark `LanguageSwitcher`, focus ring inside `#mobile-menu` |

**Measured ratios** (every pair the design actually uses; ✓ = clears its required threshold with the 4.6:1 safety margin where 4.5:1 is required, or comfortably above 3:1 where only non-text/large-text applies):

| Pair                                                                 | Ratio   | Requirement               | Result        |
| -------------------------------------------------------------------- | ------- | ------------------------- | ------------- |
| `slate` text on `paper`                                              | 14.05:1 | 4.5:1 (body)              | ✓ AAA         |
| `slate` text on `paper-dim`                                          | 12.67:1 | 4.5:1                     | ✓ AAA         |
| `paper` text on `slate` (mobile menu nav links)                      | 14.05:1 | 4.5:1                     | ✓ AAA         |
| `steel` text/numbers on `paper`                                      | 5.10:1  | 4.5:1                     | ✓ AA          |
| `steel` text/numbers on `paper-dim` (binding case)                   | 4.60:1  | 4.5:1                     | ✓ AA          |
| `patina` text/links/headings on `paper`                              | 5.14:1  | 4.5:1                     | ✓ AA          |
| `patina` text on `paper-dim` (binding case)                          | 4.64:1  | 4.5:1                     | ✓ AA          |
| `paper` text on `patina` (default CTA button fill)                   | 5.14:1  | 4.5:1                     | ✓ AA          |
| `paper` text on `patina-dim` (CTA hover fill)                        | 7.04:1  | 4.5:1                     | ✓ AAA         |
| `patina` focus ring vs `paper`                                       | 5.14:1  | 3:1 (non-text UI)         | ✓             |
| `patina` focus ring vs `paper-dim`                                   | 4.64:1  | 3:1                       | ✓             |
| `patina-soft` text/hover/active/focus-ring vs `slate`                | 5.69:1  | 4.5:1 body / 3:1 non-text | ✓ AAA         |
| `patina-soft` text vs `slate-soft` (binding case)                    | 4.67:1  | 4.5:1 body / 3:1 non-text | ✓ AA for both |
| `steel-soft` text/border vs `slate`                                  | 8.38:1  | 4.5:1                     | ✓ AAA         |
| `steel-soft` text/border vs `slate-soft`                             | 6.88:1  | 4.5:1                     | ✓ AAA         |
| `red-700` (`#b91c1c`, unchanged semantic form-error text) vs `paper` | 5.65:1  | 4.5:1                     | ✓ AA          |

**Revision (D-020):** the first draft of this table only measured the pairs the design was _intended_ to use, not every pair that could actually occur. An independent review measured the full cross product and found three failures against pairs I had not checked: `steel` on `slate` (2.75:1), `patina` on `slate` (2.73:1) — both are already prevented by policy (`steel`/`patina` are documented light-background-only, see the legal pairing matrix in Global Constraints, and no task in this plan pairs them with a dark background) — and, critically, `patina-soft` on `slate-soft` (3.79:1 at the original `#61947a` value), which **was** a real gap: `patina-soft` is the dark-mode accent and `slate-soft` is the elevated dark card/panel surface, so "accent text on a dark card" is a combination the design can plausibly need later even though no task in this draft currently produces it. Fix: `patina-soft` changed from `#61947a` to **`#74a48c`**, re-verified above (5.69:1 on `slate`, 4.67:1 on `slate-soft` — both now clear AA). This value is used everywhere `patina-soft` appears in this plan (Task 1's `tailwind.config.ts`/`globals.css`, Task 3's Header.tsx/LanguageSwitcher.tsx, Task 12's regression-gate table).

A full legal pairing matrix — which foreground token may sit on which background token, for every token, not just the ones this plan currently uses as text — is now part of the Global Constraints section (below), so a later task can't reintroduce an illegal pairing like `steel`/`patina` on `slate` by accident.

Two usage-site consequences fall out of `patina`/`steel` no longer being safe as text on dark backgrounds (they were never safe there, this just makes the fix explicit instead of accidental): `components/layout/Header.tsx`'s dark mobile-menu panel must use `text-steel-soft` (not `text-steel`) for its region label, and `hover:text-patina-soft` (not `hover:text-patina`) for nav-link hover; `components/layout/LanguageSwitcher.tsx`'s active-locale color must switch to `text-patina-soft` when its `light` prop is true. Both are called out explicitly in Task 3's code.

Task 12 keeps a final re-verification pass (re-running the same ratios against whatever hex values are actually in `tailwind.config.ts` at that point) as a regression gate, but the tokens are correct from the moment Task 1 lands — no task after Task 1 should ever need to touch a token hex value.

---

### Task 1: Design tokens, fonts, and the SITE.name em-dash

**Files:**

- Modify: `tailwind.config.ts` (full rewrite)
- Modify: `app/globals.css` (full rewrite)
- Modify: `app/[locale]/layout.tsx` (lines 1-24, font loading + line 131 `className`, line 142 skip-link classes)
- Modify: `lib/constants.ts` (line 4 only)

**Interfaces:**

- Produces: Tailwind color tokens `paper` (`DEFAULT #eef0ef`, `dim #e2e5e3`), `slate` (`DEFAULT #1c2226`, `soft #2a3136`), `steel` (`DEFAULT #5f666a`, `soft #b7bcbe`), `patina` (`DEFAULT #486c5a`, `dim #3a5648`, `soft #74a48c`) — hex values are WCAG-AA-tuned, see the token table above, not the spec's literal starting hexes for `steel`/`patina`/`patina-dim`. Produces `fontFamily.display`, `fontFamily.body` (both `var(--font-sans)`) and `fontFamily.mono` (`var(--font-mono)`). Produces CSS vars `--paper`, `--paper-dim`, `--slate`, `--slate-soft`, `--steel`, `--steel-soft`, `--patina`, `--patina-dim`, `--patina-soft` in `app/globals.css`.
- Consumes: nothing (foundation task).

- [ ] **Step 1: Rewrite `tailwind.config.ts` with the new token set (WCAG-tuned hex values, see the token table above), drop all old wood/cream/charcoal/steel tokens, drop the scroll-cue keyframe**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Materiály řemesla" palette — steel/zinc, slate, patina (single accent), paper.
        // Hex values are WCAG AA-tuned (see the token table in the plan's "Design
        // tokens: WCAG contrast verification" section) — steel/patina/patina-dim are
        // darkened from the design spec's literal starting hex specifically so every
        // text usage clears 4.5:1 on paper/paper-dim. Tunable later without touching
        // component code (see design spec §3.1), but re-run the contrast check if so.
        paper: {
          DEFAULT: "#eef0ef", // primary light background
          dim: "#e2e5e3", // secondary light background (alternating panels)
        },
        slate: {
          DEFAULT: "#1c2226", // primary dark background / ink (text on paper)
          soft: "#2a3136", // secondary dark background (overlays, alternating panels)
        },
        steel: {
          DEFAULT: "#5f666a", // text/numbers/labels on LIGHT backgrounds + general borders (5.10:1 on paper, 4.60:1 on paper-dim)
          soft: "#b7bcbe", // text/borders on DARK backgrounds only (8.38:1 on slate) — do not use on light backgrounds, too low-contrast as text there
        },
        patina: {
          DEFAULT: "#486c5a", // the SINGLE accent on LIGHT backgrounds — CTA, links, active/hover state, headings, focus ring (5.14:1 on paper, 4.64:1 on paper-dim)
          dim: "#3a5648", // darkened accent for hover/pressed states of the accent itself, on light backgrounds (7.04:1 as button-hover fill)
          soft: "#74a48c", // the SAME accent hue, lightened, for text/hover/active-state/focus-ring on DARK backgrounds only (5.69:1 on slate, 4.67:1 on slate-soft — see the legal pairing matrix in Global Constraints) — do not use on light backgrounds
        },
      },
      fontFamily: {
        display: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        body: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      letterSpacing: {
        widest: "0.2em",
      },
      maxWidth: {
        content: "1200px",
      },
      transitionTimingFunction: {
        craft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Rewrite `app/globals.css` with mirrored CSS vars (WCAG-tuned values, see the token table above), patina focus ring, a `patina-soft` focus-ring override for the dark mobile menu, and a technical hatch utility for later use (ImageFrame, kontakt map)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Design tokens mirror tailwind.config.ts for use outside utility classes.
     steel/patina/patina-dim are WCAG-AA-tuned (darker than the spec's literal
     starting hex); patina-soft is new — see the token table in the plan's
     "Design tokens: WCAG contrast verification" section. */
  --paper: #eef0ef;
  --paper-dim: #e2e5e3;
  --slate: #1c2226;
  --slate-soft: #2a3136;
  --steel: #5f666a;
  --steel-soft: #b7bcbe;
  --patina: #486c5a;
  --patina-dim: #3a5648;
  --patina-soft: #74a48c;
}

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  body {
    @apply bg-paper font-body text-slate antialiased;
    text-rendering: optimizeLegibility;
  }

  ::selection {
    background-color: var(--patina);
    color: var(--paper);
  }

  /* Viditelný a konzistentní focus ring napříč webem. */
  :focus-visible {
    outline: 2px solid var(--patina);
    outline-offset: 3px;
    border-radius: 2px;
  }

  /* SVG skupiny / canvas overlaye nemají vlastní border-radius, ale focus ring chceme. */
  [tabindex]:focus-visible {
    outline: 2px solid var(--patina);
    outline-offset: 4px;
  }

  /* Dark mobile-menu panel (#mobile-menu, see Header.tsx) sits on --slate, where
     the default --patina focus ring falls to ~2.8:1 and fails AA. Swap to
     --patina-soft (5.69:1 on slate) only inside that panel. */
  #mobile-menu :focus-visible {
    outline-color: var(--patina-soft);
  }

  h1,
  h2,
  h3 {
    @apply font-display;
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }
}

@layer components {
  .container-content {
    @apply mx-auto w-full max-w-content px-6 md:px-10;
  }

  /* Jemný papírový grain přes plochy (nahrazuje starý sépiový .grain). */
  .grain::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* Kicker label — reserved for section HERO headlines only (budget: ~1 per 3 sections). */
  .eyebrow {
    @apply font-mono text-xs uppercase tracking-widest text-patina;
  }

  .link-underline {
    @apply relative inline-block;
  }
  .link-underline::after {
    content: "";
    @apply absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-current transition-transform duration-500 ease-craft;
  }
  .link-underline:hover::after {
    @apply origin-left scale-x-100;
  }

  /* Technický "konstrukční" rastr — pro ImageFrame placeholder a kontakt mapu. */
  .tech-grid {
    background-image:
      linear-gradient(0deg, rgba(28, 34, 38, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(28, 34, 38, 0.06) 1px, transparent 1px);
    background-size: 24px 24px;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* Pokud uživatel preferuje omezený pohyb, vypneme i CSS smooth scroll. */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 3: Swap fonts in `app/[locale]/layout.tsx` (lines 1-24) — Archivo (display+body) and IBM Plex Mono (numbers/specs/contact details)**

**Font pair: Archivo + IBM Plex Mono.** Archivo is a grotesque originally drawn from American wood-type sign lettering, with the squared, slightly-mechanical proportions and a true italic (not an oblique fake) that reads as drafted rather than decorative — it carries the "technical drawing" register the spec asks for without tipping into a generic rounded/friendly startup grotesk, which ruled out neutral-but-soft alternatives like Familjen Grotesk or Instrument Sans. IBM Plex Mono was designed explicitly to express "the relationship between humans and machines" for IBM's own technical documentation and engineering contexts, with an italic modeled on Selectric typewriter type — pairing it with Archivo puts a wood/sign-lettering heritage face against an engineering-documentation face, which is the carpentry-plus-technical-drawing combination the spec wants, not two interchangeable neutral grotesks. Both are available via `next/font/google`, are not Inter, are not a serif, and both offer a true italic file (confirmed via the Google Fonts CSS2 API — see below) so emphasis stays inside the same family per the Global Constraints.

**Czech diacritic verification method (not assumed):** downloaded the actual `.ttf` files Google Fonts serves for Archivo (regular + italic, weights 400/500/600/700) and IBM Plex Mono (regular + medium) from the CSS2 API (`https://fonts.googleapis.com/css2?family=...`), then inspected each file's cmap directly with the `fontTools` Python library (`TTFont(path).getBestCmap()`), checking for the presence of every Czech-specific codepoint — `č Č ď Ď ě Ě ň Ň ř Ř š Š ť Ť ů Ů ž Ž` — plus the common accented Latin-1 set (`á é í ó ú ý` + uppercase). Script: `/tmp/fontcheck/check_glyphs.py` (scratch path, not committed). Result: full coverage, zero missing glyphs, for every downloaded file of both families. This is a stronger check than trusting the `latin-ext` subset label, since a font can claim `latin-ext` while still omitting individual precomposed glyphs.

```tsx
import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
```

Everything else in the file between the old font block and `generateStaticParams` stays. Then update two lines further down:

```tsx
    <html
      lang={locale}
      className={`${archivo.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
```

and the skip-link (was `bg-wood-amber ... text-charcoal`):

```tsx
          <a
            href="#main-content"
            className="sr-only rounded-md bg-patina px-4 py-2 font-body text-sm font-medium text-paper focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]"
          >
```

- [ ] **Step 4: Fix the em-dash in `SITE.name` (`lib/constants.ts:4`) — this single string propagates into every page's `<title>`, OG/Twitter, JSON-LD, and the Footer**

```ts
export const SITE = {
  name: "Jáchim & Kučera - Tesařství",
  shortName: "Jáchim & Kučera",
  url: "https://tesarjachim.cz",
  phone: "+420 777 123 456",
  phoneHref: "+420777123456",
  email: "info@tesarjachim.cz",
} as const;
```

(Phone/email preserved verbatim, only the name's dash character changes.)

- [ ] **Step 5: Verify**

```bash
npm run typecheck && npm run lint
```

Expect both to pass. The build will still fail/look broken at this point because every component still references the now-deleted `wood-*`/`cream`/`charcoal` classes — Tailwind will simply emit those as unrecognized utility classes (no visual color, not a compile error), so `typecheck`/`lint` pass but `npm run build`/visual output is intentionally broken until Task 3 onward lands. Do not run `npm run build` as a gate on this task.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.ts app/globals.css "app/[locale]/layout.tsx" lib/constants.ts && git commit -m "$(cat <<'EOF'
Design tokens: replace wood/cream/charcoal palette with steel/slate/patina/paper

Foundation for the site-wide redesign - swaps serif Cormorant Garamond
for Archivo (display+body, true italic, verified Czech glyph coverage)
and adds IBM Plex Mono for technical numbers/specs, per the approved
redesign spec. steel/patina/patina-dim are darkened from the spec's
starting hex and a new patina-soft token is added so every token
passes WCAG AA at every site the design actually uses it (see the
contrast table in docs/superpowers/plans/2026-08-06-website-redesign.md).
EOF
)"
```

---

### Task 2: Shared UI primitives (Button, ImageFrame, Counter)

**Files:**

- Modify: `components/ui/Button.tsx` (full rewrite)
- Modify: `components/ui/ImageFrame.tsx` (full rewrite — new technical placeholder pattern replaces the hardcoded-hex brick texture)
- Modify: `components/ui/Counter.tsx` (full rewrite — digits move to `font-mono`)

**Interfaces:**

- Consumes: Tailwind tokens from Task 1 (`paper`, `slate`, `steel`, `patina`).
- Produces: `Button({ variant: 'primary'|'outline'|'ghost', size: 'md'|'lg', href?, className?, children })` (signature unchanged from today, only class values inside change). `Arrow({ className? })` (unchanged). `ImageFrame({ src, alt, aspect?, className?, sizes?, priority?, aged?, rounded? })` (signature unchanged; `aged` prop is now a no-op retained only so call sites don't need updating this task — see Task 2 Step 2 note). `Counter({ value, label })` (signature unchanged).

- [ ] **Step 1: Rewrite `components/ui/Button.tsx`**

```tsx
import { Link } from "@/i18n/routing";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-body text-sm font-medium uppercase tracking-widest transition-all duration-500 ease-craft disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-patina text-paper hover:bg-patina-dim",
  outline:
    "border border-slate/30 text-slate hover:border-patina hover:text-patina",
  ghost: "text-slate hover:text-patina",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3",
  lg: "px-8 py-4 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & Omit<ComponentProps<"button">, "className" | "children">;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
    ...rest
  } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
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
  );
}
```

Note: dropped the `hover:shadow-lg hover:shadow-wood-amber/20` glow on `primary` — a soft brand-color glow reads as decorative flourish under the new "no ornament beyond function" material language; the darker `patina-dim` hover fill alone communicates state per spec §6 ("hover/tap feedback... bez magnetických efektů").

- [ ] **Step 2: Rewrite `components/ui/ImageFrame.tsx` — technical/material placeholder instead of the old hardcoded-hex "brick" texture, per spec §3.4**

```tsx
import Image from "next/image";

interface ImageFrameProps {
  src: string;
  alt: string;
  /** poměr stran, např. "4/3", "16/9", "3/4" */
  aspect?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** ponecháno kvůli zpětné kompatibilitě volání - placeholder už nemá "aged" variantu */
  aged?: boolean;
  rounded?: boolean;
}

/**
 * Rámeček pro fotku realizace.
 *
 * Reálné fotky nejsou součástí zadání - komponenta proto vykresluje
 * technický/materiálový placeholder (jemný rastr + kótovací značky v rozích +
 * popisek), ne "chybí obrázek". Jakmile do `public{src}` přibude skutečný
 * soubor, stačí odkomentovat <Image> níže a placeholder se nahradí
 * optimalizovaným obrázkem.
 */
export function ImageFrame({
  src,
  alt,
  aspect = "4/3",
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  rounded = true,
}: ImageFrameProps) {
  const hasRealAsset = false; // přepni na true, až budou fotky v /public

  return (
    <div
      className={`group relative overflow-hidden bg-paper-dim tech-grid ${
        rounded ? "rounded-sm" : ""
      } ${className}`}
      style={{ aspectRatio: aspect }}
    >
      {hasRealAsset ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
        >
          {/* rohové kótovací značky - signalizují "toto je záměrný rámeček", ne chybějící obrázek */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 text-steel/50"
          >
            <path
              d="M6 16V6h10M84 6h10v10M94 84v10H84M16 94H6V84"
              stroke="currentColor"
              strokeWidth="0.6"
              fill="none"
            />
          </svg>
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            className="text-steel"
          >
            <path
              d="M4 24 16 8l12 16M8 22v6h16v-6"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="max-w-[80%] font-mono text-[0.65rem] uppercase tracking-widest text-slate/45">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
}
```

All four call sites pass `aged` today — `components/ui/ProjectGallery.tsx:212`, `components/ui/ServiceCard.tsx:36`, `components/sections/ServicePageTemplate.tsx:25`, **and `app/[locale]/o-nas/page.tsx:46`** (this fourth site is easy to miss since it's a page file, not a component, but it does pass `aged={false}` today) — that prop is kept in the type signature so all four call sites keep compiling this task, but it's unused in the body. It's removed from call sites piecemeal as each file gets its own pass in a later task, not all at once: `ServiceCard.tsx` in Task 6, `ServicePageTemplate.tsx` in Task 7, `ProjectGallery.tsx` in Task 8, and `o-nas/page.tsx` in Task 9 (confirmed: Task 9 Step 2's full rewrite of that file's `ImageFrame` call already omits `aged` — no separate action needed there beyond what Task 9 already does). No call site is left passing `aged` after Task 9; the prop stays in `ImageFrame`'s type signature indefinitely as a harmless no-op unless a future cleanup task removes it from the type too.

- [ ] **Step 3: Rewrite `components/ui/Counter.tsx` — digits in `font-mono`, accent in `patina`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

interface CounterProps {
  value: string;
  label: string;
}

/** Vytáhne číselnou část a předponu/příponu (např. "20+" → 20, "+"). */
function parse(value: string) {
  const match = value.match(/^(\D*)(\d+)(\D*)$/);
  if (!match) return { prefix: "", num: null as number | null, suffix: value };
  return { prefix: match[1], num: parseInt(match[2], 10), suffix: match[3] };
}

export function Counter({ value, label }: CounterProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const { prefix, num, suffix } = parse(value);

  useEffect(() => {
    const el = numRef.current;
    if (!el || num === null) return;

    if (prefersReducedMotion()) {
      el.textContent = String(num);
      return;
    }

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: num,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.val));
        },
      });
    });
    return () => ctx.revert();
  }, [num]);

  return (
    <div className="text-center">
      <div className="font-mono text-4xl text-patina md:text-5xl">
        {prefix}
        {num !== null ? <span ref={numRef}>0</span> : null}
        {num === null ? <span>{suffix}</span> : suffix}
      </div>
      <div className="mt-2 font-body text-xs uppercase tracking-widest text-slate/60">
        {label}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npm run typecheck && npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/Button.tsx components/ui/ImageFrame.tsx components/ui/Counter.tsx && git commit -m "$(cat <<'EOF'
Retheme shared UI primitives to steel/slate/patina/paper tokens

Button, ImageFrame and Counter now consume the new design tokens.
ImageFrame's placeholder is redesigned as an intentional technical
pattern (corner dimension marks + grid) instead of a hardcoded-hex
wood texture.
EOF
)"
```

---

### Task 3: Layout chrome (Header, Footer, Logo, LanguageSwitcher)

**Files:**

- Modify: `components/layout/Header.tsx` (full rewrite)
- Modify: `components/layout/Footer.tsx` (full rewrite — **keeps** the `companyIdLabel` placeholder row per D-019 (supersedes D-015, `docs/superpowers/redesign/DECISIONS.md`), drops its `.eyebrow` usage per the site-wide eyebrow budget)
- Modify: `components/layout/Logo.tsx` (line 28 em-dash fix + no other changes needed, no color classes present)
- Modify: `components/layout/LanguageSwitcher.tsx` (color-only rewrite)

No changes to `messages/cs.json`/`messages/en.json` in this task — `common.companyIdLabel` (cs.json:19, en.json:19) is kept per D-019.

**Interfaces:**

- Consumes: `SITE` (`lib/constants.ts`, unchanged shape), `navLinks` (`lib/constants.ts`, unchanged shape), Tailwind tokens from Task 1.
- Produces: `Header()`, `Footer()`, `Logo({ className?, light?, size?, tabIndex? })`, `LanguageSwitcher({ className?, light? })` — all signatures unchanged.

- [ ] **Step 1: Rewrite `components/layout/Header.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { navLinks } from "@/lib/constants";
import type { NavLink } from "@/lib/types";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

function navLabel(t: (key: string) => string, source: NavLink["textSource"]) {
  return source.ns === "service"
    ? t(`services.${source.slug}.title`)
    : t(`nav.${source.key}`);
}

export function Header() {
  const t = useTranslations("common");
  const tFull = useTranslations();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [pastHero, setPastHero] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setPastHero(window.scrollY > window.innerHeight - 140);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const showNav = !isHome || pastHero;
  const solid = !menuOpen && (isHome ? pastHero : scrolled);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid
          ? "border-b border-slate/10 bg-paper/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="container-content flex items-center justify-between py-4">
        <div
          className={`transition-opacity duration-500 ${
            showNav ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!showNav}
        >
          <Logo size={56} tabIndex={showNav ? undefined : -1} />
        </div>

        <nav
          aria-label={t("mainNavAria")}
          className={`hidden items-center gap-8 transition-opacity duration-500 lg:flex ${
            showNav ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                tabIndex={showNav ? undefined : -1}
                className={`link-underline font-body text-xs uppercase tracking-widest transition-colors duration-300 ${
                  active ? "text-patina" : "text-slate/80 hover:text-slate"
                }`}
              >
                {navLabel(tFull, link.textSource)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <LanguageSwitcher light={menuOpen} />

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t("close") : t("menu")}
            className="relative z-50 flex h-10 w-8 items-center justify-center lg:hidden"
          >
            <span className="sr-only">{menuOpen ? t("close") : t("menu")}</span>
            <div className="flex w-6 flex-col items-end gap-[6px]">
              <span
                className={`h-px transition-all duration-300 ${
                  menuOpen
                    ? "w-6 translate-y-[7px] rotate-45 bg-paper"
                    : "w-6 bg-slate"
                }`}
              />
              <span
                className={`h-px transition-all duration-300 ${
                  menuOpen ? "w-0 opacity-0 bg-paper" : "w-4 bg-slate"
                }`}
              />
              <span
                className={`h-px transition-all duration-300 ${
                  menuOpen
                    ? "w-6 -translate-y-[7px] -rotate-45 bg-paper"
                    : "w-5 bg-slate"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex h-[100dvh] w-screen flex-col bg-slate transition-opacity duration-300 lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav
          aria-label={t("mobileNavAria")}
          className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={menuOpen ? undefined : -1}
              className="font-display text-4xl italic text-paper transition-colors duration-300 hover:text-patina-soft"
            >
              {navLabel(tFull, link.textSource)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-paper/10 px-8 py-6">
          <span className="font-mono text-xs uppercase tracking-widest text-steel-soft">
            {t("region")}
          </span>
          <LanguageSwitcher light />
        </div>
      </div>
    </header>
  );
}
```

Note: this panel (`#mobile-menu`) is on the dark `bg-slate` background, where `text-patina`/`text-steel` fall below AA as text (see the token table above) — the mobile nav-link hover uses `hover:text-patina-soft` and the region label uses `text-steel-soft`, both tuned specifically for readability on `slate`.

- [ ] **Step 2: Rewrite `components/layout/Footer.tsx` — retheme, KEEP the company-ID row (D-019 supersedes D-015 — see below), and demote the two nav-group headings from `.eyebrow` to a plain mono label (they're utility footer headers, not content-section kickers, so they don't count against the eyebrow budget)**

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SITE, navLinks } from "@/lib/constants";
import type { NavLink } from "@/lib/types";
import { Logo } from "./Logo";

function navLabel(t: (key: string) => string, source: NavLink["textSource"]) {
  return source.ns === "service"
    ? t(`services.${source.slug}.title`)
    : t(`nav.${source.key}`);
}

export function Footer() {
  const t = useTranslations();
  const year = 2026;

  return (
    <footer className="relative overflow-hidden border-t border-slate/10 bg-paper-dim">
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="container-content relative grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo size={64} />
          <p className="max-w-xs font-body text-sm leading-relaxed text-slate/60">
            {t("common.footerDescription")}
          </p>
        </div>

        <nav aria-label={t("common.footerNavAria")} className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-steel">
            {t("common.navigationHeading")}
          </h2>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-underline font-body text-sm text-slate/70 transition-colors hover:text-slate"
                >
                  {navLabel(t, link.textSource)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-steel">
            {t("nav.contact")}
          </h2>
          <ul className="space-y-2 font-body text-sm text-slate/70">
            <li>
              <a
                href={`tel:${SITE.phoneHref}`}
                className="link-underline font-mono transition-colors hover:text-slate"
              >
                {SITE.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="link-underline font-mono transition-colors hover:text-slate"
              >
                {SITE.email}
              </a>
            </li>
            <li className="pt-2 text-slate/50">{t("common.region")}</li>
          </ul>
        </div>
      </div>

      <div className="container-content relative flex flex-col items-start justify-between gap-2 border-t border-slate/10 py-6 font-body text-xs text-slate/40 sm:flex-row sm:items-center">
        <p>
          © {year} {SITE.name}. {t("common.allRightsReserved")}
        </p>
        {/* PLACEHOLDER — not a real IČO. No genuine company registration number
            exists anywhere in this repo (verified by grep). Kept intentionally
            per D-019 in docs/superpowers/redesign/DECISIONS.md, which supersedes
            the earlier D-015 (which wanted it removed): IČO is a legally required
            disclosure on a Czech company website, and a missing field reads worse
            to a visitor than a labeled placeholder does. MUST be replaced with the
            client's real IČO before production — tracked in the pre-launch
            checklist in docs/superpowers/redesign/PROGRESS.md. Do not remove this
            comment when the real value is supplied; delete it only together with
            replacing the string below. */}
        <p>{t("common.companyIdLabel")}</p>
      </div>
    </footer>
  );
}
```

Note: the second footer row's second `<p>` (`{t('common.companyIdLabel')}`) is **kept**, unlike an earlier draft of this plan which removed it. D-019 (`docs/superpowers/redesign/DECISIONS.md`) supersedes D-015 and reinstates the placeholder on the user's explicit decision, on the condition that it is "zřetelně označená jako placeholder, aby nemohla nasadit omylem" (clearly marked as a placeholder so it can't ship by accident) — satisfied here by the code comment above and by the existing pre-launch checklist entry in `docs/superpowers/redesign/PROGRESS.md`, which this task does not need to touch (it already correctly describes D-019). No message-file changes are needed in this task: `common.companyIdLabel` stays in both `messages/cs.json` and `messages/en.json` exactly as-is (its string content has no em-dash already, so Task 11's em-dash sweep does not need to touch it either).

- [ ] **Step 3: Fix the em-dash in `components/layout/Logo.tsx:28` and retheme nothing else (no color classes present in this file)**

```tsx
      aria-label={`${SITE.name} - ${t("home")}`}
```

(replaces `` `${SITE.name} — ${t("home")}` ``; rest of the file is unchanged.)

- [ ] **Step 4: Rewrite `components/layout/LanguageSwitcher.tsx` (color-only)**

```tsx
"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher({
  className = "",
  light = false,
}: {
  className?: string;
  /** Světlá varianta pro tmavé pozadí (otevřené mobilní menu). */
  light?: boolean;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const sep = light ? "text-paper/30" : "text-slate/30";
  const idle = light
    ? "text-paper/60 hover:text-paper"
    : "text-slate/60 hover:text-slate";
  // On the dark `slate` background (light===true, e.g. the mobile menu), `text-patina`
  // falls to ~2.8:1 as text and fails AA — use `text-patina-soft` there instead
  // (5.69:1 on slate). On the light background, `text-patina` (5.14:1 on paper) is fine.
  const active = light ? "text-patina-soft" : "text-patina";

  return (
    <div
      className={`flex items-center gap-1 font-body text-xs uppercase tracking-widest ${className}`}
      role="group"
      aria-label="Volba jazyka"
    >
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className={sep}>|</span>}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={loc === locale ? "true" : undefined}
            className={`transition-colors duration-300 ${
              loc === locale ? active : idle
            }`}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Verify**

```bash
npm run typecheck && npm run lint
```

- [ ] **Step 6: Commit**

```bash
git add components/layout/Header.tsx components/layout/Footer.tsx components/layout/Logo.tsx components/layout/LanguageSwitcher.tsx && git commit -m "$(cat <<'EOF'
Retheme layout chrome; keep the placeholder company-ID footer row (D-019)

Header/Footer/Logo/LanguageSwitcher now use the steel/slate/patina/paper
tokens. Footer's IČO placeholder row is intentionally KEPT per D-019
(supersedes D-015) - a real IČO does not exist anywhere in the repo, and
the user decided a clearly-labeled placeholder reads better to a visitor
than a missing legally-required field. Marked with a code comment at the
render site and tracked in the pre-launch checklist
(docs/superpowers/redesign/PROGRESS.md) so it cannot ship silently.
Fixes an em-dash in Logo's aria-label.
EOF
)"
```

---

### Task 4: 3D house retheme (desktop) + reduced-motion fix

**Files:**

- Modify: `components/house3d/config.ts` (full rewrite — `COLORS` only, `MENU`/`DIM`/`CAMERA` untouched)
- Modify: `components/house3d/HouseModel.ts` (line 317 only)
- Modify: `components/house3d/SceneManager.ts` (lines 196, 199, 218 — light colors; two new private fields + one new bound method; constructor gains a one-time `MediaQueryList` setup before the existing `prepareIntro()` call; `tick()`'s idle block at lines 367-378 gains a cached reduced-motion guard; `dispose()` gains one `removeEventListener`)
- Modify: `app/[locale]/nahled-3d/House3DPreview.tsx` (full rewrite — replace hardcoded hex with tokens, fix stray `'—'` fallback char)

**Interfaces:**

- Consumes: nothing new (this task changes values inside `components/house3d`, not its public API).
- Produces: `COLORS` object shape unchanged (`background, line, lineHover, face, faceHover, emissiveHover, ground, ink, inkSoft, accent`), only values change. `House3DScene`/`MenuId`/`MenuItem`/`MENU` exports (`components/house3d/index.ts`) are untouched — `HeroHouse.tsx` and `House3DPreview.tsx` keep working with no signature changes.

- [ ] **Step 1: Rewrite `COLORS` in `components/house3d/config.ts` (only the `COLORS` block changes; `MenuId`, `MenuItem`, `LabelSide`, `LINE`, `DIM`, `MENU`, `CAMERA` are unchanged) — `emissiveHover`/`accent` use the WCAG-tuned `patina` hex (`#486c5a`, not the spec's original `#5b8a72`), matching Task 1's token table**

```ts
/** "Materiály řemesla" paleta - steel/zinek, břidlice, patina mědi.
 *  emissiveHover/accent = #486c5a, the WCAG-AA-tuned `patina` token from
 *  tailwind.config.ts (Task 1) — darker than the spec's original #5b8a72. */
export const COLORS = {
  background: 0xeef0ef, // paper
  line: 0x2a3136, // slate-soft - obrysové linky
  lineHover: 0x1c2226, // slate - tmavší při hoveru pro kontrast
  face: 0xdfe2e1, // paper-dim/steel mix - plochy stěn/střechy
  faceHover: 0xeef0ef, // paper - zesvětlá při hoveru
  emissiveHover: 0x486c5a, // patina - jediný akcent, hover/aktivní stav
  ground: 0xeef0ef, // paper
  /* DOM/overlay (CSS) */
  ink: "#1c2226", // slate
  inkSoft: "rgba(28, 34, 38, 0.55)",
  accent: "#486c5a", // patina - jediný akcent
} as const;
```

This file is one of the documented, justified exceptions to "no hardcoded hex in components" (Task 11) — Three.js `THREE.Color`/material APIs require numeric/hex literals, there is no CSS-custom-property bridge into the WebGL layer, so `COLORS` itself is the single source of truth these numbers are centralized in, and every other file under `components/house3d` imports from it rather than hardcoding its own.

- [ ] **Step 2: Fix the hardcoded window-pane color at `HouseModel.ts:317`**

```ts
      color: 0xdfe2e1,
```

(replaces `color: 0xe9eaeb,` — matches the new `COLORS.face` tone so window glass reads as part of the same material system instead of an off-palette light gray.)

- [ ] **Step 3: Retune the three hardcoded light colors in `SceneManager.ts` to a cooler, less warm-cream-tinted neutral consistent with the new palette**

At `SceneManager.ts:196` (hemisphere light sky/ground colors):

```ts
const hemi = new THREE.HemisphereLight(0xffffff, 0xdfe2e1, 2.1);
```

(replaces `0xe6e4de` — a warm cream-tinted ground-bounce color — with `0xdfe2e1`, matching the new `face`/paper-dim tone.)

At `SceneManager.ts:199` and `:218`, the directional and ambient lights already use neutral `0xffffff` — no change needed there, leave as-is.

- [ ] **Step 4: Add the missing `prefers-reduced-motion` guard to the idle float/breathing/light-drift loop in `SceneManager.ts`'s `tick()` method, using a `MediaQueryList` constructed once — not `window.matchMedia()` called every frame**

The idle block that needs gating is `tick()`'s three statements at `SceneManager.ts:367-378` (verified against the live file):

```ts
// idle: jemné vznášení domu (čistě klidová animace, žádné scroll „usazení")
this.house.root.position.y = this.floatAmp * Math.sin(t * 0.6);

// idle: dýchání kamery (fov)
this.camera.fov = this.baseFov + this.fovAmp * Math.sin(t * 0.25);
this.camera.updateProjectionMatrix();

// idle: pohyb světla → měkký posun stínu
this.dirLight.position.set(
  this.dirBase.x + 1.3 * Math.sin(t * 0.13),
  this.dirBase.y,
  this.dirBase.z + 1.1 * Math.cos(t * 0.11),
);
```

`tick()` runs every frame via `requestAnimationFrame` (60x/second), so the guard must **not** call `window.matchMedia(...)` inline the way `prepareIntro()` does at line 305 — that call constructs a fresh `MediaQueryList` object, and doing that 60 times a second is real overhead in a hot path that today has none. `prepareIntro()` gets away with it because it runs exactly once, at mount; `tick()` does not have that luxury. Fix: construct the `MediaQueryList` once during setup, cache its `.matches` on the instance, and only read the cached boolean inside `tick()`; listen for `change` so a live OS-setting toggle takes effect without a reload; remove the listener in `dispose()`.

Add two new private fields near the other instance fields (e.g. next to `private disposed = false` around line 74):

```ts
  private reducedMotionMQ: MediaQueryList | null = null
  private reducedMotion = false
```

Add a bound instance method (near the other bound handlers like `onPointerMove`):

```ts
  private onReducedMotionChange = (e: MediaQueryListEvent): void => {
    this.reducedMotion = e.matches
  }
```

In the constructor, construct the `MediaQueryList` once and read its initial state — place this right before the existing `this.prepareIntro()` call (line 152), which stays as-is (it's a one-time check, not a hot path, so it does not need this fix itself):

```ts
if (typeof window !== "undefined" && window.matchMedia) {
  this.reducedMotionMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  this.reducedMotion = this.reducedMotionMQ.matches;
  this.reducedMotionMQ.addEventListener("change", this.onReducedMotionChange);
}

this.prepareIntro();
```

Replace the three `tick()` statements above with the guarded version, reading the cached `this.reducedMotion` (no `matchMedia` call in this method at all):

```ts
// idle: jemné vznášení domu / dýchání kamery / posun světla - jen bez reduced-motion.
// this.reducedMotion je čtený z MediaQueryList vytvořeného JEDNOU v konstruktoru
// (ne window.matchMedia() volaného každý frame - to by v hot path 60x/s zbytečně
// alokovalo nový MediaQueryList). Živá změna OS nastavení se promítne přes
// onReducedMotionChange (addEventListener('change', ...)), bez reloadu.
if (!this.reducedMotion) {
  this.house.root.position.y = this.floatAmp * Math.sin(t * 0.6);
  this.camera.fov = this.baseFov + this.fovAmp * Math.sin(t * 0.25);
  this.camera.updateProjectionMatrix();
  this.dirLight.position.set(
    this.dirBase.x + 1.3 * Math.sin(t * 0.13),
    this.dirBase.y,
    this.dirBase.z + 1.1 * Math.cos(t * 0.11),
  );
} else {
  this.house.root.position.y = 0;
  this.camera.fov = this.baseFov;
  this.camera.updateProjectionMatrix();
  this.dirLight.position.set(this.dirBase.x, this.dirBase.y, this.dirBase.z);
}
```

Finally, remove the listener in the existing `dispose()` teardown (`SceneManager.ts:431-441`), alongside the other `removeEventListener` calls already there:

```ts
  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.resizeObs.disconnect()
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.renderer.domElement.removeEventListener('pointerleave', this.onPointerLeave)
    this.renderer.domElement.removeEventListener('click', this.onClick)
    this.reducedMotionMQ?.removeEventListener('change', this.onReducedMotionChange)
    this.controls.dispose()
    this.overlay.dispose()
    // (rest of dispose() unchanged)
```

- [ ] **Step 5: Rewrite `app/[locale]/nahled-3d/House3DPreview.tsx` — replace hardcoded hex with tokens, remove the stray `'—'` fallback**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { House3DScene, MENU, type MenuId } from "@/components/house3d";

/* Klientský náhled - drží poslední emitnutý onMenuSelect (zatím bez routingu). */
export function House3DPreview() {
  const t = useTranslations();
  const [selected, setSelected] = useState<MenuId | null>(null);
  const item = MENU.find((m) => m.id === selected);
  const label = item ? t(`services.${item.serviceSlug}.title`) : null;

  return (
    <main className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden bg-paper">
      <House3DScene onMenuSelect={setSelected} />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6">
        <p className="font-display text-lg italic text-slate">
          {t("nahled3d.heading")}
        </p>
        <p
          className="font-mono text-xs uppercase tracking-widest text-patina transition-opacity duration-300"
          style={{ opacity: label ? 1 : 0 }}
        >
          {label ? `onMenuSelect -> ${label}` : ""}
        </p>
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate/40">
        {t("nahled3d.hint")}
      </p>
    </main>
  );
}
```

- [ ] **Step 6: Verify**

```bash
npm run typecheck && npm run lint
```

Then visually check `/nahled-3d` at `npm run dev` (desktop 1440x900): house should render in the new zinc/slate palette with a patina hover/active highlight, no console errors, hover/click still routes the debug label as before.

- [ ] **Step 7: Commit**

```bash
git add components/house3d/config.ts components/house3d/HouseModel.ts components/house3d/SceneManager.ts "app/[locale]/nahled-3d/House3DPreview.tsx" && git commit -m "$(cat <<'EOF'
Retheme 3D house to steel/slate/patina palette, fix reduced-motion gap

House3DScene materials/lights now use the new tokens (centralized in
config.ts COLORS, plus the two hardcoded color sites found in
HouseModel.ts and SceneManager.ts). Also gates the continuous idle
float/breathing/light-drift loop behind prefers-reduced-motion, which
it previously ignored.
EOF
)"
```

---

### Task 5: Mobile 3D house fallback — explicit service card grid

**Files:**

- Create: `components/house/MobileServiceGrid.tsx`
- Modify: `components/house/HeroScroll.tsx` (full rewrite — removes the scroll cue, retheme, restructure the mobile band of the sticky panel)
- Modify: `messages/cs.json`, `messages/en.json` (add a new `common.mobileServicesNavAria` key — see Step 1's landmark-naming note)

**Interfaces:**

- Consumes: `houseLabels: HouseLabel[]` (`lib/constants.ts`, unchanged shape — all 6 entries: chimney/roof/truss/gutters/windows/door), `HouseLabel`/`NavLink` types (`lib/types.ts`, unchanged).
- Produces: `MobileServiceGrid({ className? })` — a new client component, self-contained (reads `houseLabels` + `useTranslations` internally, no other props needed).

**Duplicate landmark name, and why this task adds a new i18n key instead of reusing `common.houseNavAria`:** `app/[locale]/page.tsx` already has an always-in-DOM `sr-only` fallback `<nav aria-label={t('common.houseNavAria')}>` (Task 6 Step 8) listing the same 6 `houseLabels` destinations. Below 768px, `MobileServiceGrid` is now _also_ always in the DOM, rendering the same 6 destinations. If both `<nav>`s share one `aria-label`, a screen reader's landmark list shows two navigation regions with an identical name and no way to tell them apart. Fix: `MobileServiceGrid` gets its own translation key, `common.mobileServicesNavAria`; the `sr-only` fallback nav keeps `common.houseNavAria` unchanged.

- [ ] **Step 1: Add the new `common.mobileServicesNavAria` key to both message files (em-dash-free, distinct from the existing `common.houseNavAria`)**

```bash
python3 - <<'EOF'
import json
from collections import OrderedDict

values = {
    'messages/cs.json': 'Mobilní nabídka služeb',
    'messages/en.json': 'Mobile services menu',
}
for path, value in values.items():
    with open(path, encoding='utf-8') as f:
        data = json.load(f, object_pairs_hook=OrderedDict)
    # insert right after houseNavAria so the two related keys stay adjacent
    common = data['common']
    new_common = OrderedDict()
    for k, v in common.items():
        new_common[k] = v
        if k == 'houseNavAria':
            new_common['mobileServicesNavAria'] = value
    data['common'] = new_common
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
EOF
```

Both new strings (`Mobilní nabídka služeb` / `Mobile services menu`) are plain hyphen-free text — no em-dash to worry about. `cs.json` and `en.json` gain the key in the same position, keeping the two files structurally identical.

- [ ] **Step 2: Create `components/house/MobileServiceGrid.tsx`, using the new `common.mobileServicesNavAria` key (not `common.houseNavAria`, which stays reserved for the `sr-only` fallback nav)**

This renders all 6 `houseLabels` destinations (matching the same part→page table as the desktop house and the `sr-only` fallback nav) as real `<Link>` tap targets, min 44px tall, 2-column grid, one small line-icon per destination in the same technical-line style as `ServiceCard`'s icons.

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { houseLabels } from "@/lib/constants";
import type { HouseLabel, NavLink } from "@/lib/types";

function labelText(t: (key: string) => string, source: NavLink["textSource"]) {
  return source.ns === "service"
    ? t(`services.${source.slug}.title`)
    : t(`nav.${source.key}`);
}

const ICONS: Record<HouseLabel["key"], JSX.Element> = {
  roof: <path d="M4 20 16 8l12 12M8 18v8h16v-8" />,
  truss: <path d="M4 22 16 8l12 14M8 20l8-9 8 9M16 8v14" />,
  gutters: (
    <path d="M4 10h20M6 10v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M14 14v6a2 2 0 0 0 2 2h2" />
  ),
  chimney: <path d="M6 26 16 12l10 14M11 19V9h4v6M8 24h16" />,
  windows: <path d="M7 6h18v20H7zM16 6v20M7 16h18" />,
  door: <path d="M9 27V6h14v21M9 27h14M20 16v2" />,
};

export function MobileServiceGrid({ className = "" }: { className?: string }) {
  const t = useTranslations();

  return (
    <nav
      aria-label={t("common.mobileServicesNavAria")}
      className={`grid grid-cols-2 gap-2.5 ${className}`}
    >
      {houseLabels.map((label: HouseLabel) => (
        <Link
          key={label.id}
          href={label.href}
          className="group flex min-h-[44px] items-center gap-3 rounded-sm border border-slate/12 bg-paper/90 px-3.5 py-3 backdrop-blur-sm transition-colors hover:border-patina"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-steel transition-colors group-hover:text-patina"
          >
            {ICONS[label.key]}
          </svg>
          <span className="font-body text-sm leading-tight text-slate">
            {labelText(t, label.textSource)}
          </span>
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Rewrite `components/house/HeroScroll.tsx` — remove the scroll cue, retheme, switch the desktop hero from centered-text-over-full-width-house to the spec-required ASYMMETRIC split (text block as one side, house as the main asset on the other — spec §4.1 explicitly rules out "vycentrovaný text přes celou šířku"), and reserve a bottom band of the existing 100dvh sticky panel for `MobileServiceGrid` on mobile only**

The sticky-panel + 100vh-runway mechanic that lets `StackCover`-wrapped `ServicesScroll` climb over the hero (`h-[calc(100dvh_+_100vh)]` wrapper, `sticky top-0 h-[100dvh]` panel) is preserved exactly - only the _contents_ of the sticky panel change. On mobile the house is confined to a shrunk band (its container gets a fixed `h-[38vh]`, and `House3DScene`'s existing `ResizeObserver` on its container - `SceneManager.ts` - picks that up automatically, no house3d code changes needed) with the text as an overlay above it and `MobileServiceGrid` below, `md:hidden`. On desktop (`md:` and up) the panel becomes a flex row: a ~42%-wide text column on the left, the house filling the remaining ~58% on the right as the primary visual asset — the same `HouseHero`/`ResizeObserver` auto-fit behavior handles the narrower container with no house3d changes.

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { HeroHouse } from "./HeroHouse";
import { MobileServiceGrid } from "./MobileServiceGrid";

/* -------------------------------------------------------------------------- */
/*  HeroScroll — dům „na papíře" se scroll choreografií                         */
/*                                                                              */
/*  Panel drží 100dvh a je STICKY uvnitř delší dráhy (runway). Sticky (ne GSAP  */
/*  pin) = žádné přerodičování do .pin-spacer → App Router při navigaci nespadne */
/*  na removeChild. Dům zůstává v klidu (žádné „usazení"). Na desktopu je       */
/*  layout asymetrický - text vlevo (~42 %), dům jako hlavní asset vpravo       */
/*  (spec §4.1). Na mobilu (<768px) je dům zmenšen na horní pásmo a pod ním     */
/*  je MobileServiceGrid - jediná garantovaná cesta k navigaci (spec §4.2).     */
/* -------------------------------------------------------------------------- */

export function HeroScroll() {
  const t = useTranslations("home");
  const runwayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      gsap.to(headerRef.current, {
        opacity: 0,
        y: -28,
        ease: "none",
        scrollTrigger: {
          trigger: runway,
          start: "top top",
          end: "35% top",
          scrub: true,
        },
      });
    }, runwayRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={runwayRef}
      className="relative h-[calc(100dvh_+_100vh)] motion-reduce:h-[100dvh]"
    >
      <div className="sticky top-0 flex h-[100dvh] w-full flex-col overflow-hidden bg-paper md:flex-row">
        {/* text blok - mobil: overlay nad zmenšeným domem (centrováno); desktop: samostatný levý sloupec ~42 % (asymetrie dle spec §4.1) */}
        <div
          ref={headerRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-6 pt-[5.5rem] text-center md:pointer-events-auto md:static md:z-auto md:w-[42%] md:shrink-0 md:items-start md:justify-center md:px-12 md:pt-0 md:text-left lg:px-16"
        >
          <span className="eyebrow">{t("heroEyebrow")}</span>
          <h1 className="mt-3 max-w-2xl font-display text-3xl italic leading-[1.05] text-slate sm:text-4xl md:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <Button
            href="/kontakt"
            size="md"
            className="pointer-events-auto mt-6"
          >
            {t("heroCta")}
          </Button>
        </div>

        {/* dům - hlavní asset. Mobil: zmenšené horní pásmo (h-[38vh]). Desktop: zbylých ~58 % šířky panelu. */}
        <div className="relative h-[38vh] w-full md:h-full md:flex-1">
          <HeroHouse />
        </div>

        {/* mobilní kartový seznam služeb - jediná garantovaná navigace pod 768px */}
        <div className="flex-1 overflow-y-auto border-t border-slate/8 bg-paper-dim px-4 py-4 md:hidden">
          <MobileServiceGrid />
        </div>
      </div>
    </div>
  );
}
```

Note: the old paper-grain/vignette `<div>`s and the `bg-[#f4efe3]` hex literal are removed — the sticky panel's background is now the token `bg-paper`, and `.grain` (redefined in Task 1 Step 2) is intentionally not reapplied here since the panel now has real foreground content (grid, and on desktop a text column) rather than being a pure "paper backdrop", so a grain texture there would visually compete.

- [ ] **Step 4: Verify — typecheck/lint, then manually check both viewports with `npm run dev`**

```bash
npm run typecheck && npm run lint
```

Manual check: at 1440x900 the panel is now a left text column (~42%) beside the house filling the remaining width as the primary asset — not centered text over a full-width house — confirming spec §4.1's asymmetric requirement, and no mobile card grid is visible (`md:hidden`). At 390x844 the house occupies roughly the top third with the text overlaid centered above it, and below it a 2-column, 6-item, min-44px-tall tappable grid is visible and each link navigates correctly (realizace/pokryvačství/tesařství/klempířství/o-nás/kontakt). Run the browser's accessibility landmark inspector (or the accessibility tree in devtools) at 390x844 and confirm exactly one "navigation" landmark is named via `common.mobileServicesNavAria` ("Mobilní nabídka služeb"/"Mobile services menu") and the `sr-only` fallback nav is separately named via `common.houseNavAria` — no two landmarks share a name. Confirm the `StackCover`-wrapped Services section below the hero (still `ServicesScroll` at this point in the task sequence — it becomes `ServicesGrid` in Task 6) still climbs over the hero correctly on both viewports (scroll down from the top and verify no visual gap/overlap glitch at the hero→services transition — this exercises the runway/climb math that Task 5 does not touch, but the panel's new internal layout could regress it if a height calculation was wrong).

- [ ] **Step 5: Commit**

```bash
git add components/house/MobileServiceGrid.tsx components/house/HeroScroll.tsx messages/cs.json messages/en.json && git commit -m "$(cat <<'EOF'
Hero: asymmetric desktop split, mobile service card grid, remove scroll cue

Desktop hero moves from centered text over a full-width house to an
asymmetric layout (text column + house as the main asset), per redesign
spec §4.1. Below 768px the house shrinks to an atmosphere band and a
new MobileServiceGrid (6 tappable cards, min 44px targets, same
part-to-page mapping as houseLabels) becomes the guaranteed mobile
navigation per spec §4.2. Adds a new common.mobileServicesNavAria i18n
key so this nav has a distinct accessible name from the always-present
sr-only fallback nav (both list the same 6 destinations below 768px,
and would otherwise collide as two identically-named landmarks). Also
removes the pulsing "scroll down" arrow/cue, an explicit anti-slop
violation.
EOF
)"
```

---

### Task 6: Homepage composition (ServicesGrid bento — replaces ServicesScroll's horizontal-scroll GSAP pin — ProjectsPreview, AboutSection, ContactSection)

This task changes substantially from a straight retheme: the old `ServicesScroll` (three `matchMedia`-branched GSAP `ScrollTrigger` pins — mobile plain hold, tablet horizontal track scroll, desktop "card deal" stagger) is **deleted outright**, not class-only reskinned, and replaced with `ServicesGrid`, a real static CSS-grid bento layout with no scroll-hijack of its own. This directly changes how the section participates in `StackCover`'s shared pin/climb mechanism — see the Interfaces note and Step 8 below, which handle that explicitly rather than leaving it dangling.

**Files:**

- Modify: `lib/types.ts` (add one optional field to `Service`)
- Modify: `lib/constants.ts` (set the new field on one service)
- Modify: `components/ui/ServiceCard.tsx` (full rewrite — drops track-width classes, sized by its CSS-grid cell instead)
- Delete: `components/sections/ServicesScroll.tsx` (its entire GSAP/ScrollTrigger/matchMedia mechanism is removed, not preserved — see Step 4)
- Create: `components/sections/ServicesGrid.tsx` (static bento grid, entry animation via the existing `Reveal` component, no bespoke GSAP)
- Modify: `components/sections/ProjectsPreview.tsx` (full rewrite — retheme + em-dash fix)
- Modify: `components/sections/AboutSection.tsx` (full rewrite — retheme + eyebrow removed, per the hero-only eyebrow budget)
- Modify: `components/sections/ContactSection.tsx` (full rewrite — retheme + eyebrow removed)
- Modify: `app/[locale]/page.tsx` (retheme root section background + em-dash fix in the fallback nav, **plus** the Services `StackCover` usage changes — see Interfaces)

**Interfaces:**

- Produces: `Service` (`lib/types.ts`) gains `featured?: boolean`. `ServiceCard({ service: Service })` signature unchanged, but no longer sets its own width — sizing now comes entirely from the CSS-grid cell `ServicesGrid` places it in (featured cell spans 3 grid rows on `md:`+, secondary cells are 1 row each). `ServicesGrid()` — new component, no props, self-contained (reads `services` from `lib/constants.ts` internally like `ServicesScroll` did).
- Consumes: `services: Service[]` (`lib/constants.ts`), `StackCover` (`components/sections/StackCover.tsx`, **unchanged component definition, but its call site for Services changes** — see below), `Reveal` (`components/ui/Reveal.tsx`, **unchanged, not modified this task** — `ServicesGrid` reuses it exactly as `ProjectsPreview`/`AboutSection` already do, rather than inventing new animation code).
- **`StackCover` pin coupling, handled explicitly:** the old `<StackCover z={20} pin={false}><ServicesScroll /></StackCover>` set `pin={false}` for exactly one reason — `ServicesScroll` ran its _own_ internal `ScrollTrigger` pin (see its removed code comment: "dva piny v jednom scroll regionu se přepočítávaly proti sobě a scrub 'zamrzl'", i.e. two pins in one scroll region fought each other and the scrub froze), so `StackCover`'s own pin had to be disabled to avoid that collision. `ServicesGrid` has no internal pin at all — it is a plain static section, like `ProjectsPreview`/`AboutSection` already are. There is therefore no longer a collision to avoid, and Services should simply adopt `StackCover`'s **default** `pin={true}` behavior, exactly like every other homepage section. This is a simplification, not new complexity: Step 8 changes `<StackCover z={20} pin={false}>` to plain `<StackCover z={20}>` in `app/[locale]/page.tsx`. `StackCover.tsx` itself (`components/sections/StackCover.tsx`) is not modified — only this one call site.

- [ ] **Step 1: Add `featured?: boolean` to the `Service` interface in `lib/types.ts`**

Locate the `Service` interface and add one field:

```ts
export interface Service {
  slug: ServiceSlug;
  /** Skupina v SVG domě, na kterou služba navazuje (#g-…). */
  houseGroup: string;
  /** Hero obrázek detailní stránky. */
  heroImage: string;
  /** Galerie na detailní stránce (alt text přichází z messages/{locale}.json). */
  gallery: { src: string }[];
  /** Počet položek „Co zahrnuje" (texty přichází z messages/{locale}.json). */
  workItemNumbers: string[];
  /** Zvýrazněná služba v homepage bento mřížce (přesně jedna, viz lib/constants.ts). */
  featured?: boolean;
}
```

- [ ] **Step 2: Mark `tesarstvi` as the featured service in `lib/constants.ts`** (it's the trade in the company name — `Jáchim & Kučera - Tesařství`)

In the `services` array, add `featured: true` to the first entry (`slug: 'tesarstvi'`), right after `slug`:

```ts
  {
    slug: 'tesarstvi',
    featured: true,
    houseGroup: 'g-truss',
```

No other entries change.

- [ ] **Step 3: Rewrite `components/ui/ServiceCard.tsx` — retheme, drop the hardcoded-hex wood-texture reveal, drop the track-width classes (`ServicesGrid`'s CSS-grid cell now sizes it, not the card itself)**

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Service } from "@/lib/types";
import { ImageFrame } from "./ImageFrame";
import { Arrow } from "./Button";

const icons: Record<string, JSX.Element> = {
  tesarstvi: <path d="M4 30 16 6l12 24M9 30l7-14 7 14M16 6v24" />,
  pokryvacstvi: (
    <path d="M13.5 8.5 16 6l2.5 2.5M10 13q3-4.5 6 0 3-4.5 6 0M6.5 19q3-4.5 6 0 3-4.5 6 0 3-4.5 6 0M4 25q3-4.5 6 0 3-4.5 6 0 3-4.5 6 0 3-4.5 6 0" />
  ),
  klempirstvi: (
    <path d="M3 6 13 10M3 10v1.5a2.2 2.2 0 0 0 2.2 2.2h8.6a2.2 2.2 0 0 0 2.2-2.2V10M14 14v7q0 2.6 2.6 2.6h4M24 23q2.2 3.2 0 6.4-2.2-2.8 0-6.4" />
  ),
  "cisteni-strech": (
    <path d="M4 20 16 8l12 12M9 24l2-3M16 27l2-3M23 24l2-3M8 20v2M16 20v2M24 20v2" />
  ),
};

export function ServiceCard({ service }: { service: Service }) {
  const t = useTranslations();
  const title = t(`services.${service.slug}.title`);

  return (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-sm border border-slate/10 bg-paper-dim p-8 transition-colors duration-500 hover:border-patina md:p-10">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-craft group-hover:opacity-100">
        <ImageFrame
          src={service.heroImage}
          alt={`${t("nav.projects")} - ${title}`}
          aspect="3/4"
          rounded={false}
          className="!absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper-dim via-paper-dim/80 to-paper-dim/40" />
      </div>

      <div className="relative">
        <span className="font-mono text-xs uppercase tracking-widest text-steel">
          {t("common.serviceLabel")}
        </span>
        <svg
          width="44"
          height="36"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="mt-6 text-patina"
        >
          {icons[service.slug]}
        </svg>
        <h3
          className={`mt-6 font-display italic leading-[0.95] text-slate ${
            service.featured ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl"
          }`}
        >
          {title}
        </h3>
        <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-slate/70">
          {t(`services.${service.slug}.shortDescription`)}
        </p>
      </div>

      <Link
        href={`/sluzby/${service.slug}`}
        className="relative mt-8 inline-flex items-center gap-3 font-body text-xs uppercase tracking-widest text-patina transition-colors hover:text-patina-dim"
      >
        {t("common.moreAbout")} {title}
        <Arrow className="transition-transform duration-500 ease-craft group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
```

The bento asymmetry now comes entirely from the CSS-grid cell `ServicesGrid` (Step 4) places each card in — the featured cell spans 3 grid rows, secondary cells are 1 row each — plus the `service.featured` heading-size bump kept here so the featured card's type still reads as the emphasized one inside its taller cell. `ServiceCard` no longer sets its own width/`shrink-0` — it fills whatever cell it's given (`h-full` on the `<article>`, grid's default `align-items`/`justify-items: stretch` does the rest).

- [ ] **Step 4: Delete `components/sections/ServicesScroll.tsx` and create `components/sections/ServicesGrid.tsx` — static CSS-grid bento layout, no `ScrollTrigger`/pin/matchMedia of its own**

Delete the file entirely — its three `matchMedia` branches (mobile plain pin-and-hold, tablet horizontal track scroll, desktop card-deal stagger) are not preserved or adapted, per the ruling that this section stops being a scroll-hijacking mechanism.

```bash
git rm components/sections/ServicesScroll.tsx
```

Create `components/sections/ServicesGrid.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { services } from "@/lib/constants";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";

/* -------------------------------------------------------------------------- */
/*  ServicesGrid — „Co umíme"                                                   */
/*                                                                              */
/*  Replaces the old ServicesScroll (three matchMedia-branched GSAP             */
/*  ScrollTrigger pins — mobile hold / tablet horizontal track / desktop        */
/*  card-deal stagger) with a plain static bento grid. No pin, no scrub, no     */
/*  matchMedia — entry is a simple scroll-into-view reveal via the shared       */
/*  <Reveal stagger> primitive (same one ProjectsPreview/AboutSection already   */
/*  use), which is itself prefers-reduced-motion-guarded.                      */
/*                                                                              */
/*  Bento: exactly one `featured` service (see lib/constants.ts) fills a       */
/*  cell spanning all 3 grid rows on md:+; the other three fill one row each   */
/*  in the second column, so the featured cell reads visibly taller/wider —    */
/*  pure CSS Grid auto-row sizing, no JS measurement needed. Single column     */
/*  stack below md:.                                                          */
/* -------------------------------------------------------------------------- */

export function ServicesGrid() {
  const t = useTranslations("home");
  const featured = services.find((s) => s.featured);
  const secondary = services.filter((s) => !s.featured);

  return (
    <section
      aria-labelledby="services-heading"
      className="relative bg-paper py-24 shadow-[0_-30px_60px_-30px_rgba(28,34,38,0.12)] md:py-32"
    >
      <div className="container-content">
        <h2
          id="services-heading"
          className="max-w-xl font-display text-3xl italic text-slate md:text-4xl"
        >
          {t("servicesIntro")}
        </h2>

        <Reveal
          stagger
          className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-3 md:gap-6"
        >
          {featured && (
            <div
              data-reveal-item
              className="md:col-start-1 md:row-start-1 md:row-span-3"
            >
              <ServiceCard service={featured} />
            </div>
          )}
          {secondary.map((service, i) => (
            <div
              key={service.slug}
              data-reveal-item
              className={
                i === 0
                  ? "md:col-start-2 md:row-start-1"
                  : i === 1
                    ? "md:col-start-2 md:row-start-2"
                    : "md:col-start-2 md:row-start-3"
              }
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
```

All grid-position classes are static string literals (no dynamic interpolation), required for Tailwind's JIT scanner to pick them up. The `secondary` array is expected to always have exactly 3 entries (today's data: `pokryvacstvi`, `klempirstvi`, `cisteni-strech`) — if a future service is added without updating this layout, the 4th+ secondary item still renders (React key-mapped, no crash) but falls into `row-start-3` alongside the 3rd, overlapping visually; this is an acceptable known limitation for a 4-service catalogue, not something to over-engineer a dynamic grid for now.

- [ ] **Step 5: Rewrite `components/sections/ProjectsPreview.tsx` — retheme, remove eyebrow, fix the em-dash in the generated `alt` text, and cut the shown count from 6 to 4 (spec §5 calls for a curated "výběr 3-4 nejlepších realizací" on the homepage, not a dense 6-item grid — also matches the `VISUAL_DENSITY: 3` dial)**

```tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { projects } from "@/lib/constants";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Button";

export function ProjectsPreview() {
  const t = useTranslations("home");
  const tFull = useTranslations();
  const newest = [...projects].sort((a, b) => b.year - a.year).slice(0, 4);

  return (
    <section
      aria-labelledby="projects-heading"
      className="relative min-h-[100dvh] bg-paper py-24 shadow-[0_-30px_60px_-30px_rgba(28,34,38,0.14)] md:py-32"
    >
      <div className="container-content">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2
              id="projects-heading"
              className="max-w-xl font-display text-4xl italic text-slate md:text-5xl"
            >
              {t("projectsIntro")}
            </h2>
          </div>
          <Link
            href="/realizace"
            className="group inline-flex shrink-0 items-center gap-3 font-body text-xs uppercase tracking-widest text-patina transition-colors hover:text-patina-dim"
          >
            {tFull("common.allProjects")}
            <Arrow className="transition-transform duration-500 ease-craft group-hover:translate-x-1" />
          </Link>
        </div>

        <Reveal
          stagger
          className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        >
          {newest.map((project, i) => {
            const title = tFull(`projectsData.${project.id}.title`);
            const location = tFull(`projectsData.${project.id}.location`);
            return (
              <Link
                key={project.id}
                href="/realizace"
                data-reveal-item
                className={`group block ${i % 4 === 0 ? "row-span-2" : ""}`}
              >
                <ImageFrame
                  src={project.thumbnail}
                  alt={`${title} - ${location}`}
                  aspect={i % 4 === 0 ? "3/4" : "4/3"}
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="mt-3">
                  <h3 className="font-display text-lg italic text-slate transition-colors group-hover:text-patina">
                    {title}
                  </h3>
                  <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-steel">
                    {tFull(`services.${project.category}.title`)} · {location}
                  </p>
                </div>
              </Link>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Rewrite `components/sections/AboutSection.tsx` — retheme, remove eyebrow**

```tsx
"use client";

import { Arrow, Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Reveal } from "@/components/ui/Reveal";
import { useTranslations } from "next-intl";

export function AboutSection() {
  const t = useTranslations("home");
  const tAbout = useTranslations("about");
  const story = tAbout.raw("story") as string[];
  const stats = tAbout.raw("stats") as { value: string; label: string }[];

  return (
    <section
      aria-labelledby="about-heading"
      className="relative min-h-[100dvh] overflow-hidden bg-paper-dim py-24 shadow-[0_-30px_60px_-30px_rgba(28,34,38,0.2)] md:py-32"
    >
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="container-content relative grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <Reveal>
          <ImageFrame
            src="/images/tym/tym-01.jpg"
            alt={tAbout("teamAlt")}
            aspect="4/5"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </Reveal>

        <Reveal stagger>
          <h2
            id="about-heading"
            data-reveal-item
            className="font-display text-4xl italic leading-tight text-slate md:text-5xl"
          >
            {t("aboutHeadline")}
          </h2>
          {story.slice(0, 2).map((p) => (
            <p
              key={p.slice(0, 24)}
              data-reveal-item
              className="mt-5 max-w-prose font-body text-base leading-relaxed text-slate/75"
            >
              {p}
            </p>
          ))}

          <div
            data-reveal-item
            className="mt-10 grid grid-cols-2 gap-4 border-y border-slate/10 py-8"
          >
            {stats.map((s) => (
              <Counter key={s.label} value={s.value} label={s.label} />
            ))}
          </div>

          <div data-reveal-item className="mt-8">
            <Button href="/o-nas" variant="outline">
              {t("aboutCta")} <Arrow />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Rewrite `components/sections/ContactSection.tsx` — retheme, remove eyebrow, phone number moves to `font-mono`**

```tsx
"use client";

import { useTranslations } from "next-intl";
import { SITE } from "@/lib/constants";
import { ContactForm } from "@/components/ui/ContactForm";
import { Reveal } from "@/components/ui/Reveal";

export function ContactSection() {
  const t = useTranslations();

  return (
    <section
      id="kontakt"
      aria-labelledby="contact-cta-heading"
      className="relative min-h-[100dvh] overflow-hidden bg-paper py-24 shadow-[0_-30px_60px_-30px_rgba(28,34,38,0.2)] md:py-32"
    >
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="container-content relative">
        <Reveal className="text-center">
          <h2
            id="contact-cta-heading"
            className="font-display text-4xl italic text-slate md:text-5xl"
          >
            {t("home.contactHeadline")}
          </h2>
          <a
            href={`tel:${SITE.phoneHref}`}
            className="mt-8 inline-block font-mono text-4xl text-patina transition-colors hover:text-patina-dim md:text-6xl"
          >
            {SITE.phone}
          </a>
          <p className="mt-4 font-body text-sm uppercase tracking-widest text-slate/50">
            {t("common.region")}
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mx-auto mt-16 max-w-2xl rounded-sm border border-slate/10 bg-paper-dim/60 p-8 md:p-10"
        >
          <ContactForm compact />
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Retheme `app/[locale]/page.tsx`, fix the em-dash in the fallback nav, swap `ServicesScroll` for `ServicesGrid`, and remove `pin={false}` from its `StackCover` (see the Interfaces note above — no more internal pin to collide with)**

```tsx
import { HeroScroll } from "@/components/house/HeroScroll";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { StackCover } from "@/components/sections/StackCover";
```

(`import { ServicesScroll } from '@/components/sections/ServicesScroll'` → `import { ServicesGrid } from '@/components/sections/ServicesGrid'`, alphabetical position updates accordingly.)

```tsx
<section aria-label={t("home.heroAria")} className="relative z-0 bg-paper">
  <HeroScroll />

  <nav aria-label={t("common.houseNavAria")} className="sr-only">
    <ul>
      {houseLabels.map((label) => (
        <li key={label.id}>
          <Link href={label.href}>
            {labelText(t, label.textSource)} - {labelSubtext(t, label)}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
</section>
```

(`bg-wood-dark` → `bg-paper`, and the em-dash separator inside the `<Link>` text → hyphen.)

Then the Services `StackCover` block (comment rewritten to describe the new static section, not the old dual-pin workaround it no longer needs):

```tsx
{
  /* 1B — Služby (vyjedou přes hero). Statická bento mřížka bez vlastního
          pinu (viz ServicesGrid) — StackCover ji teď pinuje jako každou jinou
          sekci (žádný kolizní druhý pin, takže žádné pin={false}). Náběh
          (climb) přes hero zůstává. */
}
<StackCover z={20}>
  <ServicesGrid />
</StackCover>;
```

(replaces `<StackCover z={20} pin={false}><ServicesScroll /></StackCover>` — the only change is dropping `pin={false}` and swapping the child component; `z={20}` and `climb` default are untouched, and every other `StackCover` block in this file — Realizace `z={30}`, O nás `z={40}`, Kontakt `z={50} pin={false}` — is untouched.)

- [ ] **Step 9: Verify**

```bash
npm run typecheck && npm run lint
```

Manual check at `npm run dev`: scroll the whole homepage at 1440x900 and 390x844. Confirm the services section now shows a static bento grid — one visibly taller "Tesařství" tile spanning the full height of three stacked narrower tiles beside it on desktop, a single column on mobile — with no horizontal drag/scroll-hijack and no card-dealing animation; cards simply fade/rise into view once scrolled near (same feel as `AboutSection`/`ProjectsPreview`). Confirm the `StackCover` climb-and-cover transitions between Hero → Services → Realizace → O nás → Kontakt are still visually unbroken, in particular that Services now correctly freezes (pins) for one full viewport height before Realizace climbs over it — this is the behavior that changed from `pin={false}` to the default `pin={true}`, so check it deliberately rather than assuming it "just works": scroll slowly through the Hero→Services→Realizace transition and confirm there's no double-freeze, no visual jump, and no gap.

- [ ] **Step 10: Commit**

```bash
git add lib/types.ts lib/constants.ts components/ui/ServiceCard.tsx components/sections/ServicesScroll.tsx components/sections/ServicesGrid.tsx components/sections/ProjectsPreview.tsx components/sections/AboutSection.tsx components/sections/ContactSection.tsx "app/[locale]/page.tsx" && git commit -m "$(cat <<'EOF'
Replace ServicesScroll's scroll-hijack with a static bento grid

ServicesScroll's three matchMedia-branched GSAP ScrollTrigger pins
(mobile hold / tablet horizontal track / desktop card-deal) are
deleted outright and replaced by ServicesGrid, a static CSS-grid bento
layout (one featured cell spanning 3 rows, three secondary cells)
whose only motion is the shared Reveal stagger already used elsewhere
on the page. Because ServicesGrid has no pin of its own, its
StackCover wrapper drops pin={false} and adopts the default pin={true}
like every other homepage section - the old dual-pin collision this
guarded against no longer exists. ServiceCard gains a `featured` field
(set on tesarstvi) and is now sized by its grid cell instead of its
own width classes. ProjectsPreview drops from 6 to 4 projects to match
the spec's curated "3-4 best" homepage callout. Also drops 4 eyebrow
labels down to the site-wide budget and fixes an em-dash in the
homepage's sr-only fallback nav.
EOF
)"
```

---

### Task 7: ServicePageTemplate + 4 service pages

**Files:**

- Modify: `components/sections/ServicePageTemplate.tsx` (full rewrite)
- Verify only (no expected changes): `app/[locale]/sluzby/tesarstvi/page.tsx`, `app/[locale]/sluzby/pokryvacstvi/page.tsx`, `app/[locale]/sluzby/klempirstvi/page.tsx`, `app/[locale]/sluzby/cisteni-strech/page.tsx` (none of these 4 files contain color classes or em-dashes per audit — they're thin wrappers around `ServicePageTemplate`)

**Interfaces:**

- Consumes: `Service` (`lib/types.ts`, now includes `featured?`, unused by this component), `getService(slug)` (`lib/constants.ts`, unchanged).
- Produces: `ServicePageTemplate({ service: Service })` — signature unchanged.

- [ ] **Step 1: Rewrite `components/sections/ServicePageTemplate.tsx` — retheme, "Co zahrnuje" becomes mono-technical (numbers in `font-mono`, drop the bordered-card look for a spec-sheet row style), eyebrow reduced to the hero only**

```tsx
import { useTranslations } from "next-intl";
import type { Service } from "@/lib/types";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { SITE } from "@/lib/constants";

export function ServicePageTemplate({ service }: { service: Service }) {
  const t = useTranslations("service");
  const tCommon = useTranslations("common");
  const tService = useTranslations(`services.${service.slug}`);
  const title = tService("title");
  const longDescription = tService.raw("longDescription") as string[];
  const workItems = tService.raw("workItems") as {
    title: string;
    description: string;
  }[];
  const galleryAlt = tService.raw("galleryAlt") as string[];

  return (
    <article>
      {/* 1 — Hero */}
      <header className="relative h-[72vh] min-h-[460px] w-full overflow-hidden">
        <ImageFrame
          src={service.heroImage}
          alt={`${tCommon("serviceLabel")} - ${title}`}
          aspect="16/9"
          rounded={false}
          priority
          sizes="100vw"
          className="!absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/60 to-paper/20" />
        <div className="container-content absolute inset-x-0 bottom-0">
          <div className="pb-14">
            <span className="eyebrow">
              {tCommon("serviceLabel")} · {tCommon("region")}
            </span>
            <h1 className="mt-3 font-display text-6xl italic leading-none text-slate md:text-8xl">
              {title}
            </h1>
            <p className="mt-4 max-w-md font-body text-lg text-slate/70">
              {tService("tagline")}
            </p>
          </div>
        </div>
      </header>

      {/* 2 — Popis */}
      <section
        aria-label={t("descriptionAria")}
        className="bg-paper py-20 md:py-28"
      >
        <div className="container-content grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <Reveal>
            <p className="font-display text-2xl italic leading-snug text-patina md:sticky md:top-28">
              {tService("shortDescription")}
            </p>
          </Reveal>
          <Reveal stagger className="space-y-5">
            {longDescription.map((p) => (
              <p
                key={p.slice(0, 24)}
                data-reveal-item
                className="font-body text-base leading-relaxed text-slate/75"
              >
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 3 — Co zahrnuje: spec-sheet řádky, mono čísla, žádné karty s rámečkem */}
      <section
        aria-labelledby="includes-heading"
        className="bg-paper-dim py-20 md:py-28"
      >
        <div className="container-content">
          <h2
            id="includes-heading"
            className="font-display text-3xl italic text-slate md:text-4xl"
          >
            {t("includesHeading")}
          </h2>
          <Reveal
            stagger
            className="mt-12 divide-y divide-slate/10 border-t border-slate/10"
          >
            {workItems.map((item, i) => (
              <div
                key={item.title}
                data-reveal-item
                className="group flex gap-6 py-8 transition-colors duration-500 md:gap-10"
              >
                <span className="font-mono text-xl text-steel transition-colors duration-500 group-hover:text-patina">
                  {service.workItemNumbers[i]}
                </span>
                <div>
                  <h3 className="font-display text-2xl italic text-slate">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-slate/65">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 4 — Galerie */}
      <section
        aria-labelledby="gallery-heading"
        className="bg-paper py-20 md:py-28"
      >
        <div className="container-content">
          <h2
            id="gallery-heading"
            className="font-display text-3xl italic text-slate md:text-4xl"
          >
            {t("galleryHeading")}
          </h2>
          <Reveal
            stagger
            className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6"
          >
            {service.gallery.map((img, i) => (
              <div data-reveal-item key={img.src}>
                <ImageFrame
                  src={img.src}
                  alt={galleryAlt[i]}
                  aspect="4/3"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5 — CTA */}
      <section className="border-t border-slate/10 bg-paper-dim py-20 md:py-28">
        <div className="container-content flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl italic text-slate md:text-4xl">
              {t("ctaHeading")}
            </h2>
            <p className="mt-3 max-w-md font-body text-base text-slate/70">
              {t("ctaText")}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button href="/kontakt" size="lg">
              {tCommon("nonbindingInquiry")} <Arrow />
            </Button>
            <a
              href={`tel:${SITE.phoneHref}`}
              className="inline-flex items-center justify-center border border-slate/30 px-8 py-4 font-mono text-base text-slate transition-colors hover:border-patina hover:text-patina"
            >
              {SITE.phone}
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}
```

- [ ] **Step 2: Verify the 4 route files need no changes**

```bash
grep -n "wood-\|charcoal\|text-cream\|bg-cream\|border-cream\|—\|–" "app/[locale]/sluzby/tesarstvi/page.tsx" "app/[locale]/sluzby/pokryvacstvi/page.tsx" "app/[locale]/sluzby/klempirstvi/page.tsx" "app/[locale]/sluzby/cisteni-strech/page.tsx"
```

Expect no output (confirms the audit finding that these 4 files are color/em-dash-free thin wrappers).

- [ ] **Step 3: Verify**

```bash
npm run typecheck && npm run lint
```

Manual check at `npm run dev`: visit `/sluzby/tesarstvi` - confirm "Co zahrnuje" now reads as a divided list with mono numbers (01/02/03/04) instead of bordered cards, and only one eyebrow (the hero) appears on the page.

- [ ] **Step 4: Commit**

```bash
git add components/sections/ServicePageTemplate.tsx && git commit -m "$(cat <<'EOF'
Retheme ServicePageTemplate, "Co zahrnuje" becomes mono spec-sheet rows

Work-item numbers move to font-mono and the section drops its bordered-
card grid for a technical divided-row list, matching the redesign's
"technical drawing" material language. All 4 service route pages need
no changes (verified color/em-dash-free).
EOF
)"
```

---

### Task 8: Realizace gallery

**Files:**

- Modify: `components/ui/ProjectGallery.tsx` (full rewrite — retheme + em-dash fixes in `alt`/`aria-label` templates)
- Modify: `app/[locale]/realizace/page.tsx` (retheme only)

**Interfaces:**

- Consumes: `Project`/`ProjectCategory` (`lib/types.ts`, unchanged), `projects: Project[]` (`lib/constants.ts`, unchanged).
- Produces: `ProjectGallery({ projects: Project[], enableFilter?: boolean })` — signature unchanged.

- [ ] **Step 1: Rewrite `components/ui/ProjectGallery.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { Project, ProjectCategory } from "@/lib/types";
import { ImageFrame } from "./ImageFrame";

type Filter = ProjectCategory | "all";

export function ProjectGallery({
  projects,
  enableFilter = true,
}: {
  projects: Project[];
  enableFilter?: boolean;
}) {
  const t = useTranslations("projects");
  const tFull = useTranslations();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const visible =
    filter === "all" ? projects : projects.filter((p) => p.category === filter);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-project-card]",
        { opacity: 0, scale: 0.96, y: 16 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "tesarstvi", label: tFull("services.tesarstvi.title") },
    { key: "pokryvacstvi", label: tFull("services.pokryvacstvi.title") },
    { key: "klempirstvi", label: tFull("services.klempirstvi.title") },
  ];

  return (
    <div>
      {enableFilter && (
        <div
          role="tablist"
          aria-label={t("filterAria")}
          className="mb-10 flex flex-wrap gap-3"
        >
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={`rounded-full border px-5 py-2 font-body text-xs uppercase tracking-widest transition-colors duration-300 ${
                  active
                    ? "border-patina bg-patina text-paper"
                    : "border-slate/20 text-slate/70 hover:border-slate/50 hover:text-slate"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((project, i) => {
          const title = tFull(`projectsData.${project.id}.title`);
          const location = tFull(`projectsData.${project.id}.location`);
          return (
            <article
              key={project.id}
              data-project-card
              className={i % 5 === 0 ? "sm:row-span-2" : ""}
            >
              <button
                onClick={() => setSelected(project)}
                className="group block w-full text-left"
                aria-label={`${title}, ${location} ${project.year} - ${t("viewDetailAria")}`}
              >
                <ImageFrame
                  src={project.thumbnail}
                  alt={`${title} - ${location}`}
                  aspect={i % 5 === 0 ? "3/4" : "4/3"}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="mt-3 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl italic text-slate transition-colors group-hover:text-patina">
                    {title}
                  </h3>
                  <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-steel">
                    {project.year}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-steel">
                  {tFull(`services.${project.category}.title`)} · {location}
                </p>
              </button>
            </article>
          );
        })}
      </div>

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const t = useTranslations("projects");
  const tFull = useTranslations();
  const dialogRef = useRef<HTMLDivElement>(null);
  const title = tFull(`projectsData.${project.id}.title`);
  const location = tFull(`projectsData.${project.id}.location`);
  const description = tFull(`projectsData.${project.id}.description`);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        className="absolute inset-0 bg-slate/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("closeDetailAria")}
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="animate-fade-up relative z-10 max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-sm border border-slate/10 bg-paper p-6 outline-none md:p-10"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate/20 text-slate transition-colors hover:border-patina hover:text-patina"
          aria-label={tFull("common.close")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M3 3l10 10M13 3 3 13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <span className="eyebrow">
          {tFull(`services.${project.category}.title`)} · {location} ·{" "}
          {project.year}
        </span>
        <h2 className="mt-3 font-display text-4xl italic text-slate">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-slate/70">
          {description}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {project.images.map((img, i) => (
            <ImageFrame
              key={img}
              src={img}
              alt={`${title} - ${t("photoAlt")} ${i + 1}`}
              aspect="4/3"
            />
          ))}
        </div>

        <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-3 border-t border-slate/10 pt-6 font-body text-sm">
          <div>
            <dt className="text-xs uppercase tracking-widest text-steel">
              {t("location")}
            </dt>
            <dd className="mt-1 text-slate">{location}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-steel">
              {t("year")}
            </dt>
            <dd className="mt-1 font-mono text-slate">{project.year}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
```

Note: the modal's `<span className="eyebrow">` is kept — the modal is a distinct overlay "page" of its own (not stacked with the gallery grid's own section eyebrow), so it doesn't add to the same-viewport eyebrow count.

- [ ] **Step 2: Retheme `app/[locale]/realizace/page.tsx` (colors only, eyebrow kept - this page has exactly one section)**

```tsx
return (
  <div className="bg-paper">
    <header className="container-content pb-12 pt-36 md:pt-44">
      <span className="eyebrow">{tNav("projects")}</span>
      <h1 className="mt-3 max-w-3xl font-display text-5xl italic leading-tight text-slate md:text-7xl">
        {t("heroTitle")}
      </h1>
      <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-slate/70">
        {t("heroIntro")}
      </p>
    </header>

    <div className="container-content pb-28">
      <ProjectGallery projects={projects} enableFilter />
    </div>
  </div>
);
```

(only `bg-wood-dark`→`bg-paper` and `text-cream`(×2)→`text-slate`/`text-slate/70` change; imports and function signature are unchanged.)

- [ ] **Step 3: Verify**

```bash
npm run typecheck && npm run lint
```

Manual check at `npm run dev`: `/realizace` filters still work, modal opens/closes with Escape and focus-traps as before, varied aspect ratios (3/4 every 5th card) still visible.

- [ ] **Step 4: Commit**

```bash
git add components/ui/ProjectGallery.tsx "app/[locale]/realizace/page.tsx" && git commit -m "$(cat <<'EOF'
Retheme realizace gallery, fix em-dashes in generated alt/aria text

ProjectGallery and its detail modal move to the new tokens; year/
location metadata moves to font-mono. Fixes em-dashes in five
generated alt/aria-label template strings.
EOF
)"
```

---

### Task 9: O nás (timeline as technical schedule)

**Files:**

- Modify: `components/sections/Timeline.tsx` (full rewrite — retheme + replace the rounded-dot milestone marker with a technical tick mark)
- Modify: `app/[locale]/o-nas/page.tsx` (full rewrite — retheme, remove the `0{i+1}` fake section-numbering, eyebrow reduced to hero only)

**Interfaces:**

- Consumes: `about.timeline` (`messages/*.json`, shape `{ year: string; title: string; description: string }[]`, unchanged), `about.story`/`about.stats`/`about.values`/`about.certificates` (unchanged).
- Produces: `Timeline()` — signature unchanged (no props).

- [ ] **Step 1: Rewrite `components/sections/Timeline.tsx` — retheme, and replace the rounded "decorative dot" milestone marker with a technical tick/dimension-mark (per spec §3.3, construction marks used functionally, and per the anti-slop "no decorative status dots" rule)**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

interface Milestone {
  year: string;
  title: string;
  description: string;
}

export function Timeline() {
  const t = useTranslations("about");
  const timeline = t.raw("timeline") as Milestone[];
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-milestone]");
      if (prefersReducedMotion()) {
        gsap.set(items, { opacity: 1, x: 0 });
        return;
      }
      items.forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          x: -48,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 82%" },
        });
      });
      const line = el.querySelector("[data-timeline-line]");
      if (line) {
        gsap.from(line, {
          scaleY: 0,
          transformOrigin: "top",
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
            end: "bottom 70%",
            scrub: 1,
          },
        });
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <ol ref={ref} className="relative ml-3 space-y-12 pl-10 md:ml-6">
      <span
        data-timeline-line
        aria-hidden="true"
        className="absolute left-0 top-2 h-[calc(100%-1rem)] w-px bg-steel/50"
      />
      {timeline.map((m) => (
        <li key={m.year} data-milestone className="relative">
          {/* technická značka bodu (kolmá kóta), ne dekorativní tečka */}
          <span
            aria-hidden="true"
            className="absolute -left-[2.6rem] top-2 h-3 w-3 -rotate-45 border border-patina bg-paper md:-left-[3.1rem]"
          />
          <span className="font-mono text-2xl text-patina">{m.year}</span>
          <h3 className="mt-1 font-display text-2xl italic text-slate">
            {m.title}
          </h3>
          <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-slate/70">
            {m.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: Rewrite `app/[locale]/o-nas/page.tsx` — retheme, remove `0{i+1}` numbering, eyebrow reduced to hero only**

```tsx
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { Timeline } from "@/components/sections/Timeline";
import { Button, Arrow } from "@/components/ui/Button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.onas" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/o-nas" },
  };
}

export default async function ONasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const aboutStory = t.raw("story") as string[];
  const aboutStats = t.raw("stats") as { value: string; label: string }[];
  const values = t.raw("values") as { title: string; description: string }[];
  const certificates = t.raw("certificates") as string[];

  return (
    <div className="bg-paper">
      <header className="relative h-[70vh] min-h-[440px] w-full overflow-hidden">
        <ImageFrame
          src="/images/tym/tym-portret.jpg"
          alt={t("heroAlt")}
          aspect="16/9"
          rounded={false}
          priority
          sizes="100vw"
          className="!absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/65 to-paper/25" />
        <div className="container-content absolute inset-x-0 bottom-0">
          <div className="pb-14">
            <span className="eyebrow">
              {tNav("about")} · {tCommon("region")}
            </span>
            <h1 className="mt-3 font-display text-5xl italic leading-none text-slate md:text-8xl">
              {t("heroTitle")}
            </h1>
          </div>
        </div>
      </header>

      <section aria-label={t("storyAria")} className="py-20 md:py-28">
        <div className="container-content grid gap-10 md:grid-cols-[1fr_1.3fr] md:gap-16">
          <Reveal>
            <p className="font-display text-3xl italic leading-snug text-patina md:sticky md:top-28">
              {t("heroQuote")}
            </p>
          </Reveal>
          <Reveal stagger className="space-y-5">
            {aboutStory.map((p) => (
              <p
                key={p.slice(0, 24)}
                data-reveal-item
                className="font-body text-base leading-relaxed text-slate/75"
              >
                {p}
              </p>
            ))}
            <div
              data-reveal-item
              className="mt-8 grid grid-cols-3 gap-4 border-y border-slate/10 py-8"
            >
              {aboutStats.map((s) => (
                <Counter key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section
        aria-labelledby="timeline-heading"
        className="border-t border-slate/10 bg-paper-dim py-20 md:py-28"
      >
        <div className="container-content">
          <h2
            id="timeline-heading"
            className="mb-14 font-display text-3xl italic text-slate md:text-4xl"
          >
            {t("timelineHeading")}
          </h2>
          <Timeline />
        </div>
      </section>

      <section
        aria-labelledby="values-heading"
        className="bg-paper py-20 md:py-28"
      >
        <div className="container-content">
          <h2
            id="values-heading"
            className="font-display text-3xl italic text-slate md:text-4xl"
          >
            {t("valuesHeading")}
          </h2>
          <Reveal stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                data-reveal-item
                className="border-t border-slate/15 pt-6"
              >
                <h3 className="font-display text-3xl italic text-slate">
                  {v.title}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-slate/70">
                  {v.description}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-t border-slate/10 bg-paper-dim py-20 md:py-28">
        <div className="container-content">
          <h2 className="font-display text-3xl italic text-slate md:text-4xl">
            {t("certificatesHeading")}
          </h2>
          <Reveal
            stagger
            className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {certificates.map((c) => (
              <div
                key={c}
                data-reveal-item
                className="flex aspect-[3/2] items-center justify-center rounded-sm border border-slate/10 bg-paper p-6 text-center font-body text-xs uppercase tracking-widest text-slate/50"
              >
                {c}
              </div>
            ))}
          </Reveal>

          <div className="mt-16 flex flex-col items-start gap-6 border-t border-slate/10 pt-12 md:flex-row md:items-center md:justify-between">
            <p className="max-w-md font-display text-2xl italic text-slate">
              {t("ctaText")}
            </p>
            <Button href="/kontakt" size="lg">
              {t("ctaButton")} <Arrow />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

(The values grid's `<span className="font-display text-2xl italic text-wood-warm">0{i + 1}</span>` is removed entirely along with the now-unused `i` index in the `.map`, since the section-number pattern is an explicit anti-slop violation.)

- [ ] **Step 2: Verify**

```bash
npm run typecheck && npm run lint
```

Manual check: `/o-nas` timeline shows a diamond/tick marker (not a filled circle) per milestone, scroll-reveal and the draw-on vertical line still animate as before, values grid no longer shows "01/02/03".

- [ ] **Step 3: Commit**

```bash
git add components/sections/Timeline.tsx "app/[locale]/o-nas/page.tsx" && git commit -m "$(cat <<'EOF'
Retheme o-nas page and timeline, remove fake section numbering

Timeline's milestone marker becomes a technical tick mark instead of a
decorative filled dot. Removes the "01/02/03" section-number pattern
from the values grid (explicit anti-slop violation) and reduces the
page to one eyebrow (hero only).
EOF
)"
```

---

### Task 10: Kontakt (form + map placeholder)

**Files:**

- Modify: `components/ui/ContactForm.tsx` (full rewrite — retheme, keep semantic red for validation errors)
- Modify: `app/[locale]/kontakt/page.tsx` (full rewrite — retheme, replace the hardcoded-hex hand-drawn "map" with token-based technical map, eyebrow reduced to hero-only by demoting the second "Kontaktní info" eyebrow to a plain mono label)

**Interfaces:**

- Consumes: `SITE` (`lib/constants.ts`, unchanged shape).
- Produces: `ContactForm({ compact?: boolean })` — signature unchanged.

- [ ] **Step 1: Rewrite `components/ui/ContactForm.tsx`**

```tsx
"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SITE } from "@/lib/constants";

type FieldErrors = Partial<Record<"name" | "phone" | "message", string>>;

const PHONE_RE = /^(\+|00)?\d[\d\s/-]{7,15}$/;

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("contact");
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState({
    name: "",
    phone: "",
    message: "",
    website: "", // honeypot
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const fid = (name: string) => `${uid}-${name}`;

  const validateField = (name: keyof FieldErrors, value: string): string => {
    if (name === "name" && !value.trim()) return t("errors.nameRequired");
    if (name === "phone") {
      if (!value.trim()) return t("errors.phoneRequired");
      if (!PHONE_RE.test(value.trim())) return t("errors.phoneInvalid");
    }
    if (name === "message" && !value.trim()) return t("errors.messageRequired");
    return "";
  };

  const onBlur = (name: keyof FieldErrors) => {
    const msg = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

  const onChange = (name: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (name in errors && errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {
      name: validateField("name", values.name) || undefined,
      phone: validateField("phone", values.phone) || undefined,
      message: validateField("message", values.message) || undefined,
    };
    setErrors(next);
    if (next.name || next.phone || next.message) {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      firstInvalid?.focus();
      return;
    }

    setStatus("loading");
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "send_failed");
      }
      setStatus("success");
      setValues({ name: "", phone: "", message: "", website: "" });
    } catch {
      setStatus("error");
      setServerError(t("errors.generic", { phone: SITE.phone }));
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="animate-fade-up flex flex-col items-start gap-4 rounded-sm border border-patina/40 bg-patina/10 p-8"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="var(--patina)"
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M12 20.5 18 26 28 14"
            stroke="var(--patina)"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="font-display text-2xl italic text-slate">
          {t("success")}
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="font-body text-xs uppercase tracking-widest text-patina hover:text-patina-dim"
        >
          {t("submitAnother")}
        </button>
      </div>
    );
  }

  const inputClass = (invalid?: boolean) =>
    `w-full border-b bg-transparent py-3 font-body text-slate placeholder-slate/30 outline-none transition-colors duration-300 focus:border-patina ${
      invalid ? "border-red-600/70" : "border-slate/25"
    }`;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values.website}
        onChange={(e) => onChange("website", e.target.value)}
        style={{ display: "none" }}
      />

      <div className={compact ? "grid gap-6 sm:grid-cols-2" : "space-y-6"}>
        <div>
          <label
            htmlFor={fid("name")}
            className="mb-1 block font-body text-xs uppercase tracking-widest text-slate/60"
          >
            {t("name")} *
          </label>
          <input
            id={fid("name")}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            onBlur={() => onBlur("name")}
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? fid("name-err") : undefined}
            className={inputClass(!!errors.name)}
            placeholder={t("namePlaceholder")}
          />
          {errors.name && (
            <p id={fid("name-err")} className="mt-1 text-sm text-red-700">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={fid("phone")}
            className="mb-1 block font-body text-xs uppercase tracking-widest text-slate/60"
          >
            {t("phone")} *
          </label>
          <input
            id={fid("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            onBlur={() => onBlur("phone")}
            aria-invalid={errors.phone ? "true" : undefined}
            aria-describedby={errors.phone ? fid("phone-err") : undefined}
            className={`${inputClass(!!errors.phone)} font-mono`}
            placeholder="+420 777 123 456"
          />
          {errors.phone && (
            <p id={fid("phone-err")} className="mt-1 text-sm text-red-700">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={fid("message")}
          className="mb-1 block font-body text-xs uppercase tracking-widest text-slate/60"
        >
          {t("message")} *
        </label>
        <textarea
          id={fid("message")}
          name="message"
          rows={compact ? 3 : 4}
          value={values.message}
          onChange={(e) => onChange("message", e.target.value)}
          onBlur={() => onBlur("message")}
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? fid("message-err") : undefined}
          className={`${inputClass(!!errors.message)} resize-none`}
          placeholder={t("messagePlaceholder")}
        />
        {errors.message && (
          <p id={fid("message-err")} className="mt-1 text-sm text-red-700">
            {errors.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-700">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 bg-patina px-8 py-4 font-body text-sm font-medium uppercase tracking-widest text-paper transition-all duration-300 hover:bg-patina-dim disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </button>
    </form>
  );
}
```

Validation-error red (`text-red-700`, `border-red-600/70`) is kept as-is: it's a conventional, universally-understood semantic error color, not a second brand/CTA accent, so it doesn't violate the "single accent" rule — Task 11's contrast audit re-checks it against the new `bg-paper` background.

- [ ] **Step 2: Rewrite `app/[locale]/kontakt/page.tsx` — retheme, replace the hardcoded-hex hand-drawn map with a token-based technical map, demote the second eyebrow to a plain mono label**

```tsx
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SITE } from "@/lib/constants";
import { ContactForm } from "@/components/ui/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.kontakt" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/kontakt" },
  };
}

export default async function KontaktPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tCommon = await getTranslations("common");

  return (
    <div className="bg-paper">
      <header className="container-content pb-12 pt-36 md:pt-44">
        <span className="eyebrow">{t("title")}</span>
        <h1 className="mt-3 max-w-3xl font-display text-5xl italic leading-tight text-slate md:text-7xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-slate/70">
          {t("intro")}
        </p>
      </header>

      <div className="container-content grid gap-14 pb-28 md:grid-cols-[1.2fr_1fr] md:gap-20">
        <div className="order-2 md:order-1">
          <ContactForm />
        </div>

        <aside className="order-1 space-y-10 md:order-2">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-steel">
              {t("infoHeading")}
            </h2>
            <a
              href={`tel:${SITE.phoneHref}`}
              className="mt-4 block font-mono text-4xl text-patina transition-colors hover:text-patina-dim"
            >
              {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="link-underline mt-3 inline-block font-body text-base text-slate/80 hover:text-slate"
            >
              {SITE.email}
            </a>
          </div>

          <div>
            <h3 className="font-body text-xs uppercase tracking-widest text-slate/50">
              {t("areaLabel")}
            </h3>
            <p className="mt-2 font-body text-base text-slate">
              {tCommon("region")}
            </p>
          </div>

          {/* Technická "mapa" - rastr + trasy + kótovaný bod (placeholder pro Mapbox) */}
          <div
            className="tech-grid relative aspect-[4/3] overflow-hidden rounded-sm border border-slate/10 bg-paper-dim"
            role="img"
            aria-label={t("mapAriaLabel")}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 400 300"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M-20 210 C80 180 120 120 200 150 S340 120 420 90"
                stroke="var(--steel)"
                strokeWidth="2"
                opacity="0.6"
              />
              <path
                d="M40 -20 C70 80 30 160 90 240 S140 360 120 420"
                stroke="var(--steel)"
                strokeWidth="1.5"
                opacity="0.45"
              />
              <circle cx="200" cy="150" r="6" fill="var(--patina)" />
              <circle
                cx="200"
                cy="150"
                r="16"
                stroke="var(--patina)"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>
            <span className="absolute bottom-3 left-3 font-display text-xl italic text-slate">
              {t("mapCityLabel")}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

```bash
npm run typecheck && npm run lint
```

Manual check: submit the contact form with empty fields, confirm error text is still readable (red on `paper` background) and focus moves to the first invalid field; confirm the map placeholder now uses the `.tech-grid` rastr + `patina`/`steel` strokes instead of hardcoded hex.

- [ ] **Step 4: Commit**

```bash
git add components/ui/ContactForm.tsx "app/[locale]/kontakt/page.tsx" && git commit -m "$(cat <<'EOF'
Retheme kontakt page, replace hardcoded-hex map placeholder with tokens

ContactForm and the kontakt page move to the new palette; the hand-
drawn "map" placeholder's 5 hardcoded hex values become token-based
steel/patina strokes over the shared .tech-grid pattern.
EOF
)"
```

---

### Task 11: Content sweep — em-dashes, remaining hex literals, dead code removal

**Files:**

- Modify: `messages/cs.json`, `messages/en.json` (71 em-dash occurrences → hyphen, **plus** six orphaned `home.*` keys removed — see the new Step 5 below)
- Modify: `app/not-found.tsx` (root global 404 — fix em-dash + update inline-style hex to new palette values)
- Delete: `components/house/IsometricHouse.tsx` (dead code, confirmed unused anywhere)
- Modify: `lib/constants.ts` (remove the stale comment referencing `IsometricHouse`)

**Interfaces:**

- Consumes: nothing new.
- Produces: nothing new (content/cleanup only).

**Hex-literal accounting (a raw hex in a component is a blocking defect — every site found in the audit is enumerated here so none is silently missed):**

| #       | File                                             | Fixed by                   | Final state                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------- | ------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | `components/ui/ImageFrame.tsx`                   | Task 2                     | rewritten to use tokens only                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2       | `components/ui/ServiceCard.tsx`                  | Task 6                     | rewritten to use tokens only                                                                                                                                                                                                                                                                                                                                                                                                                |
| 3       | `components/house/HeroScroll.tsx`                | Task 5                     | `bg-[#f4efe3]` literal removed, replaced with `bg-paper` token                                                                                                                                                                                                                                                                                                                                                                              |
| 4       | `app/[locale]/kontakt/page.tsx`                  | Task 10                    | rewritten to use tokens only                                                                                                                                                                                                                                                                                                                                                                                                                |
| 5       | `app/[locale]/nahled-3d/House3DPreview.tsx`      | Task 4 Step 5              | rewritten to use tokens only                                                                                                                                                                                                                                                                                                                                                                                                                |
| 6       | `components/house3d/config.ts`                   | Task 4 Step 1              | **documented exception, not removed** — `COLORS` holds the numeric/hex literals Three.js material APIs require (no CSS-custom-property bridge into WebGL); every other house3d file imports from here rather than hardcoding its own, so this is the single centralized source, consistent with "All color must go through Tailwind tokens" in spirit (one source of truth) even though the literal syntax itself can't be a Tailwind class |
| 7       | `components/house/IsometricHouse.tsx`            | Task 11 Step 4 (this task) | file deleted outright (dead code), so its hex literals are moot                                                                                                                                                                                                                                                                                                                                                                             |
| 8       | `app/not-found.tsx`                              | Task 11 Step 3 (this task) | **documented exception, not removed** — this file sits outside the localized `<html>`/`<body>` tree (no root layout above it, no Tailwind `@layer` access), so inline `style={{}}` with literal hex is the only option; values are kept in sync with the Task 1 token table by hand (see Step 3 below)                                                                                                                                      |
| stray A | `components/house3d/HouseModel.ts:317`           | Task 4 Step 2              | hardcoded window-pane color fixed to match `COLORS.face`                                                                                                                                                                                                                                                                                                                                                                                    |
| stray B | `components/house3d/SceneManager.ts:196/199/218` | Task 4 Step 3              | line 196 hemisphere ground-bounce color retuned; 199/218 already used neutral `0xffffff`, confirmed no change needed                                                                                                                                                                                                                                                                                                                        |

Net result after Task 11: the only hex literals left anywhere in `app`/`components` are inside `components/house3d/config.ts` (Three.js necessity) and `app/not-found.tsx` (no-Tailwind-access necessity) — both justified and documented above, not oversights. Step 5's repo-wide grep below re-verifies this mechanically rather than trusting this table by eye.

- [ ] **Step 1: Replace every em-dash with a spaced hyphen across both message files.** The constraint itself prescribes the fix ("Use a regular hyphen"), and every occurrence found in the audit is a parenthetical/pause separator (`—` between clauses, not a compound-word hyphenation), so a straight character substitution is correct everywhere without manual per-string rewrites:

```bash
python3 - <<'EOF'
import json
from collections import OrderedDict

for path in ['messages/cs.json', 'messages/en.json']:
    with open(path, encoding='utf-8') as f:
        raw = f.read()
    fixed = raw.replace('—', '-').replace('–', '-')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)

    # re-parse to confirm valid JSON after the substitution
    with open(path, encoding='utf-8') as f:
        json.load(f, object_pairs_hook=OrderedDict)
    print(path, 'OK')
EOF
```

- [ ] **Step 2: Verify zero em-dashes remain in the message files**

```bash
grep -c $'—\|–' messages/cs.json messages/en.json
```

Expect `0` for both files (grep with no matches exits non-zero and prints nothing per file when using `-c` across multiple files it prints `file:0` — confirm both read `:0`).

- [ ] **Step 3: Fix the root `app/not-found.tsx` — em-dash in the hardcoded "404 — Page not found" string, and update its inline-style hex literals to the new, WCAG-tuned palette (patina is `#486c5a`, not the spec's original `#5b8a72` — must match the Task 1 token table).** This file intentionally has no Tailwind classes (it's the global not-found outside the localized `<html>`/`<body>` tree, with no access to `globals.css`'s Tailwind layer per its own comment) — inline styles are the correct approach here, only the literal color values need to move to the new palette:

```tsx
import Link from "next/link";

// Globální 404 mimo lokalizovaný segment — má vlastní <html>, protože nad ním
// není žádný root layout, a proto nemá přístup k next-intl kontextu locale
// segmentu. Text je záměrně anglický jako univerzální fallback pro tento
// okrajový případ (matcher middlewaru zachytí prakticky vše ostatní).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#eef0ef",
          color: "#1c2226",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: 0 }}>404 - Page not found</h1>
        <p style={{ color: "rgba(28,34,38,0.7)", marginTop: "1rem" }}>
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            marginTop: "2rem",
            backgroundColor: "#486c5a",
            color: "#eef0ef",
            padding: "0.75rem 1.5rem",
            textDecoration: "none",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontSize: "0.85rem",
          }}
        >
          Back home
        </Link>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Delete the dead SVG house implementation and its stale reference comment**

```bash
git rm components/house/IsometricHouse.tsx
```

Then in `lib/constants.ts`, find and remove the comment line that mentions it (the block comment above `houseLabels` currently reads in part `... řeší IsometricHouse přímo přes LAYOUT, tady jen data.`) — rewrite that comment block to no longer reference the deleted file:

```ts
/* -------------------------------------------------------------------------- */
/*  Labely na domě — hlavní navigace. Text/subtext přichází z messages.        */
/*  `side` určuje, na kterou stranu od kotvy text vyrůstá.                     */
/* -------------------------------------------------------------------------- */
```

(This replaces the old 4-line comment block immediately above `export const houseLabels: HouseLabel[] = [` — keep the em-dash-free rewrite, the rest of the file below it is unchanged.)

- [ ] **Step 5: Remove translation keys with zero consumers, now that Tasks 5 and 6 deleted the markup that was their only usage**

Six `home.*` keys are orphaned. Verified by grepping every namespace's keys against their usage across `app`/`components`/`lib` after Tasks 1-10's changes:

| Key                    | Why it's orphaned                                                                                                                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home.servicesHeading` | its only consumer was the `<span className="eyebrow">{t('servicesHeading')}</span>` line in the old `ServicesScroll.tsx`, which Task 6 deletes outright (the new `ServicesGrid.tsx` has no eyebrow)                                    |
| `home.projectsHeading` | its only consumer was `ProjectsPreview.tsx`'s eyebrow span, which Task 6 Step 5 removes as part of the site-wide eyebrow-budget cut                                                                                                    |
| `home.aboutHeading`    | its only consumer was `AboutSection.tsx`'s eyebrow span (`t('aboutHeading')`, distinct from `t('aboutHeadline')` which is the actual `<h2>` text and stays in use), removed by Task 6 Step 6                                           |
| `home.contactHeading`  | its only consumer was `ContactSection.tsx`'s eyebrow span (`t('home.contactHeading')`, distinct from `t('home.contactHeadline')` which stays in use), removed by Task 6 Step 7                                                         |
| `home.hint`            | already unused **before** this plan touches anything — not consumed by any component today (confirmed by grep; do not confuse with the still-used `nahled3d.hint`, a different namespace with similar text)                            |
| `home.scrollCue`       | its only consumer was the pulsing scroll-cue arrow in the old `HeroScroll.tsx` (`t('scrollCue')`, `components/house/HeroScroll.tsx:94-108` in the audit-derived facts above), which Task 5 Step 3 removes as an explicit anti-slop fix |

This list was produced by checking every leaf key in `messages/cs.json` against a codebase-wide grep for its usage. Three namespaces (`services`, `projectsData`, `houseLabels`, `house3dMenu`, `seo`) are accessed through dynamically-constructed keys (e.g. `t(\`services.${slug}.title\`)`, `t(\`houseLabels.${label.key}\`)`) rather than literal strings, so a naive "grep for the literal key name" check would false-positive there; those namespaces were spot-checked by hand instead (confirmed live consumers for all of them) and are exempted from automated removal — do not delete keys from those namespaces based on a literal-string grep coming up empty.

```bash
python3 - <<'EOF'
import json
from collections import OrderedDict

orphaned = [
    'servicesHeading', 'projectsHeading', 'aboutHeading', 'contactHeading',
    'hint', 'scrollCue',
]
for path in ['messages/cs.json', 'messages/en.json']:
    with open(path, encoding='utf-8') as f:
        data = json.load(f, object_pairs_hook=OrderedDict)
    for key in orphaned:
        data['home'].pop(key, None)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(path, 'OK - removed keys from home')

# structural-identity check: both files must have exactly the same key set afterward
def flatten(d, prefix=''):
    keys = set()
    for k, v in d.items():
        path = f'{prefix}.{k}' if prefix else k
        keys.add(path)
        if isinstance(v, dict):
            keys |= flatten(v, path)
    return keys

with open('messages/cs.json', encoding='utf-8') as f:
    cs_keys = flatten(json.load(f, object_pairs_hook=OrderedDict))
with open('messages/en.json', encoding='utf-8') as f:
    en_keys = flatten(json.load(f, object_pairs_hook=OrderedDict))

only_cs = cs_keys - en_keys
only_en = en_keys - cs_keys
if only_cs or only_en:
    raise SystemExit(f'STRUCTURAL MISMATCH after key removal - only in cs: {only_cs} - only in en: {only_en}')
print('cs.json and en.json structurally identical:', len(cs_keys), 'keys each')
EOF
```

Verified by dry-run against the live files during plan-writing: this removes exactly the 6 keys above from `home` in both files and reports "structurally identical: 216 keys each" — 222 keys minus 6 removed. (`json.dump(..., indent=2)` also reformats a handful of single-line array/object literals elsewhere in the file onto multiple lines — this is the same `json.load`/`json.dump(indent=2)` round-trip pattern Task 5 Step 1 already uses to add `common.mobileServicesNavAria`, not something new introduced here; it's a harmless formatting-only diff, not a content change. Step 1 of this task (the em-dash fix, above) intentionally uses a raw string `.replace()` instead, specifically to avoid this reformatting side effect across the entire file — that choice does not apply here since this step is already doing a structural key removal, which requires parsing anyway.)

- [ ] **Step 6: Repo-wide em-dash and stray hex grep to confirm nothing was missed (mechanically verifies the hex-literal accounting table above)**

```bash
grep -rn $'—\|–' app components lib messages --include="*.tsx" --include="*.ts" --include="*.json"
grep -rnE "#[0-9a-fA-F]{3,6}|0x[0-9a-fA-F]{6}" app components --include="*.tsx" --include="*.ts" \
  | grep -v "app/not-found.tsx" | grep -v "components/house3d/config.ts"
```

First command: expect no output. Second command: expect no output — the only remaining hex/numeric-color literals in the whole repo should be the values inside `app/not-found.tsx` (Step 3, below) and `components/house3d/config.ts` (Task 4 Step 1), both `grep -v`-excluded here as the two documented exceptions from the accounting table above. If this command prints anything else, a hex literal was missed somewhere and must be fixed before this task's commit.

- [ ] **Step 7: Verify**

```bash
npm run typecheck && npm run lint
```

- [ ] **Step 8: Commit**

```bash
git add messages/cs.json messages/en.json app/not-found.tsx lib/constants.ts && git rm components/house/IsometricHouse.tsx 2>/dev/null; git add -A && git commit -m "$(cat <<'EOF'
Content sweep: remove all 71 em-dashes, orphaned i18n keys, dead SVG house

messages/cs.json and messages/en.json now use plain hyphens everywhere
(the constraint's own prescribed fix), and drop six home.* keys left
with zero consumers by Tasks 5-6's eyebrow/scroll-cue removals
(servicesHeading, projectsHeading, aboutHeading, contactHeading,
scrollCue) plus one that was already unused before this plan (hint).
Both message files remain structurally identical. Deletes the unused
legacy IsometricHouse.tsx (superseded by components/house3d, confirmed
imported nowhere). Root app/not-found.tsx keeps its necessary inline
styles (no Tailwind layer access outside the locale segment) but moves
its literal colors to the new palette and fixes its one em-dash.
EOF
)"
```

---

### Task 12: Final pass — contrast, reduced-motion, anti-slop, build verification

**Files:**

- No new files. This task only runs verification and fixes anything it finds; any fix should be a small, targeted edit to a file already touched in an earlier task.

**Interfaces:**

- Consumes: everything produced by Tasks 1-11.
- Produces: nothing new — this is the acceptance gate for the whole plan.

- [ ] **Step 1: Full typecheck, lint, and production build**

```bash
npm run typecheck && npm run lint && npm run build
```

All three must pass with zero errors. `npm run build` additionally catches anything `typecheck`/`lint` can't (e.g. `generateStaticParams`/`generateMetadata` runtime issues across all 4 locales × 9 routes).

- [ ] **Step 2: Repo-wide sweep for anything the old palette/anti-slop rules would still catch**

```bash
echo "--- old token classes (expect 0 matches) ---"
grep -rn "wood-\|charcoal\|text-cream\|bg-cream\|border-cream\|steel-dark\|steel-medium\|steel-light" app components lib --include="*.tsx" --include="*.ts"

echo "--- em-dash/en-dash anywhere in source or content (expect 0 matches) ---"
grep -rn $'—\|–' app components lib messages --include="*.tsx" --include="*.ts" --include="*.json"

echo "--- stray hex outside the two documented exceptions (expect 0 matches) ---"
grep -rnE "#[0-9a-fA-F]{3,6}|0x[0-9a-fA-F]{6}" app components --include="*.tsx" --include="*.ts" \
  | grep -v "app/not-found.tsx" | grep -v "components/house3d/config.ts"

echo "--- eyebrow usage count (expect <= 6 for this site's section count) ---"
grep -rn 'className="eyebrow' app components --include="*.tsx" | wc -l

echo "--- scroll-cue keyframe/class remnants (expect 0 matches) ---"
grep -rn "scroll-cue\|scrollCue" app components tailwind.config.ts --include="*.tsx" --include="*.ts"

echo "--- section-number / fake-precision patterns (manual review of any hits) ---"
grep -rn "0{i\|{i + 1}\|{i+1}" app components --include="*.tsx"
```

Every "expect 0" check must return nothing. The eyebrow count should be roughly: homepage hero (1) + service-page-template hero (1, shared across all 4 service pages) + o-nas hero (1) + kontakt hero (1, plus the demoted-to-mono second label which is not `.eyebrow`) + realizace hero (1) + project-modal (1) = 6. If it's higher, find and remove the extra ones (each earlier task documented which eyebrows it intentionally kept).

- [ ] **Step 3: Contrast re-verification (regression gate, not discovery) — tokens are already correct as of Task 1, this just confirms nothing drifted**

Unlike an earlier draft of this plan, contrast is **not** discovered or fixed here — every token value was already computed to pass WCAG AA with a safety margin and locked in during Task 1 (see "Design tokens: WCAG contrast verification" near the top of this plan, and the token table there). This step re-runs the same ratio checks against whatever hex values actually landed in `tailwind.config.ts`, as a regression gate — if this step finds a failure, something diverged from Task 1's spec somewhere in Tasks 2-11, and _that_ is the bug to fix (do not "fix" it by re-darkening tokens here; find where a task deviated from Task 1's values and correct that call site instead).

Three checks, in order:

1. **Values didn't drift.** Open `tailwind.config.ts` and confirm its `colors` block still has exactly the nine hex values from the Task 1 token table (`paper #eef0ef`/`paper-dim #e2e5e3`, `slate #1c2226`/`slate-soft #2a3136`, `steel #5f666a`/`steel-soft #b7bcbe`, `patina #486c5a`/`patina-dim #3a5648`/`patina-soft #74a48c` — the D-020-revised value) — nothing after Task 1 should ever have had a reason to touch these.
2. **Ratios still clear AA.** Re-run the WCAG relative-luminance contrast formula (sRGB, same method as Task 1's script, written fresh in a scratch script — e.g. `/tmp/<job>/contrast_recheck.py`, not committed to the repo) over every pair in the "Measured ratios" table near the top of this plan, using whichever hex values are actually in `tailwind.config.ts` right now. Every pair must still meet its threshold (4.5:1 body text / 3:1 non-text-UI or large text) with at least the same margin recorded in that table.
3. **No illegal pairing was introduced.** Per the legal color-pairing matrix in Global Constraints (D-020), `steel`/`patina` must never be paired with `slate`/`slate-soft` as text, and `steel-soft`/`patina-soft` must never be paired with `paper`/`paper-dim` as text. Grep for the two dangerous combinations:

```bash
grep -rn "bg-slate\b[^\"]*\"" app components --include="*.tsx" -A2 | grep -E "text-steel\b|text-patina\b"
grep -rln 'className="[^"]*bg-slate' app components --include="*.tsx"
```

There is no fully mechanical single-grep check for "same element has both a dark bg class and a light-only text class" across arbitrary template-string class compositions, so treat this as a manual review trigger: for every file the second command lists, open it and confirm no `text-steel`/`text-patina` (as opposed to `-soft`) appears on the same dark-background element. As of this plan's own tasks, that should be exactly the files already covered (`Header.tsx`'s `#mobile-menu`, `LanguageSwitcher.tsx`'s `light` branch, and `ProjectGallery.tsx`'s modal-close overlay backdrop, which uses no text on its `bg-slate/70` layer) — any other hit is a new regression.

If any check fails, the defect is wherever a later task's diff touched `tailwind.config.ts`/`app/globals.css` (checks 1-2) or a component's className (check 3) — find that diff and revert or correct it. Do not "fix" a failure by deriving a new hex value here; token derivation belongs in Task 1 only, this step is a gate, not a design step.

- [ ] **Step 4: `prefers-reduced-motion` audit**

Confirm every animation entry point respects it:

```bash
grep -rln "gsap\.\(from\|to\|fromTo\|timeline\)" components lib --include="*.tsx" --include="*.ts"
```

For each file in the output, confirm it either calls `prefersReducedMotion()` (from `lib/gsap.ts`) before animating, or checks `window.matchMedia('(prefers-reduced-motion: reduce)')` directly (the `components/house3d/SceneManager.ts` pattern). This should already be true for every file except the one bug fixed in Task 4 Step 4 (the house's idle float/breathing loop) — this step is the final confirmation that fix landed correctly and nothing else regressed.

- [ ] **Step 5: Visual regression pass on the StackCover/scroll-choreography-critical pages, at both viewports**

With `npm run dev` running, check at **1440x900** and **390x844**:

- `/` — Hero → Services → Realizace → O nás → Kontakt scroll all the way down with no visual gap, double-scroll, or jump at any section boundary (this exercises `StackCover`'s pin/climb math, which no task in this plan intentionally touches, but several tasks changed the _contents_ of `StackCover`-wrapped sections).
- `/` at 390x844 specifically — confirm the mobile service grid (Task 5, `MobileServiceGrid`, inside the hero) renders below a visibly shrunk house, all 6 links work, and further down the page the `ServicesGrid` bento section (Task 6) renders as a single stacked column with no visual collision or duplicate-looking content against `MobileServiceGrid` above it — the two are different things (hero fallback nav to all 6 house destinations vs. the homepage's 4-service bento showcase) and should read as visually distinct sections, not a repeat.
- `/sluzby/tesarstvi` (or any one service page) — hero, description, "Co zahrnuje" spec-rows, gallery, CTA all render with the new palette and no leftover `wood-`/`cream` styling gaps.
- `/nahled-3d` — 3D house renders in the new palette, hover/click still highlights the correct part and updates the debug label.

- [ ] **Step 6: Commit only if Step 2, 3, or 4 found and required a fix; otherwise this task has nothing to commit and Task 11's commit stands as the last content change**

Because contrast is locked in correctly at Task 1 (not discovered here), the expected outcome of Step 3 is "no defect found, nothing to commit." If Step 2's grep sweep, Step 3's regression gate, or Step 4's reduced-motion audit did turn up something (e.g. a task's diff silently reintroduced a stray hex, or a token value drifted from the Task 1 table), fix it as a small targeted edit to the file where the regression actually originated, then commit:

```bash
git add -A && git commit -m "$(cat <<'EOF'
Final pass: fix regression found during acceptance sweep

<describe the specific regression found — e.g. "a stray hex literal in
X reintroduced during Task N" or "token value in tailwind.config.ts
drifted from the Task 1 table" — and the one-line fix applied.>
EOF
)"
```
