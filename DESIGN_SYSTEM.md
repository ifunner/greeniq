# GolfIQ Design System

The GolfIQ design language is built for golf tools that feel like premium course-side instruments: dark felt greens, warm ivory type, and a single flag-yellow accent for the moments that matter (aim point, cup, primary action). **GreenIQ** is the reference implementation; **StrokesIQ** and **PracticeIQ** follow the same tokens, hierarchy, and component rules documented here.

> **Source of truth.** This document and the shared `golfiq.css` live in the `golfiq-design/` package. Each app vendors a synced copy — never hand-edit a vendored `golfiq.css` or a per-repo `DESIGN_SYSTEM.md`. Edit them in `golfiq-design/` and run `npm run sync`. See that package's README for the workflow. Where GreenIQ's shipped CSS and this spec ever disagree, **GreenIQ wins** for look-and-feel; this doc is kept in sync to match.

---

## Design principles

1. **Instrument, not decoration** — UI reads like a caddie’s yardage book: dense data, clear hierarchy, no visual noise.
2. **One pop color** — Flag yellow (`--flag`) is reserved for aim, cup, and primary CTAs. Never use it as ambient decoration (this is why toasts are neutral chrome, not yellow).
3. **Mobile-first, thumb-zone aware** — Single-column layout, fixed tab bar, safe-area insets, max width 520px.
4. **Data is monospace** — Measurements, percentages, and scores use tabular mono numerals; labels and navigation use Space Grotesk. The whole suite uses the system monospace stack.
5. **Offline-ready calm** — Dark surfaces, subtle depth, minimal motion. Respects `prefers-reduced-motion`.

---

## Colors

### CSS custom properties

All tokens live on `:root` in `golfiq.css`.

| Token | Hex | Role |
|---|---|---|
| `--felt` | `#0E2A22` | Primary surface, PWA manifest `theme_color` |
| `--felt-deep` | `#0A201A` | Deepest background, HTML `theme-color` meta, stepper wells, bar tracks |
| `--panel` | `#10322A` | Card and sheet backgrounds |
| `--panel-hi` | `#143a30` | Default button fill, elevated panel, toast |
| `--ink` | `#F2EBDA` | Primary text (ivory) |
| `--ink-dim` | `#9DB3A6` | Secondary text, hints, inactive tabs |
| `--sage` | `#6E8F7E` | Labels, eyebrows, tertiary UI |
| `--line` | `#26483D` | Borders, dividers, dial ticks |
| `--flag` | `#F4D03F` | **Accent** — aim, cup, primary buttons, active tab |
| `--path` | `#46C98A` | Ball path, success/live states, “IQ” wordmark |
| `--red` | `#E06A5C` | Warnings, miss states, pattern badge |
| `--uphill` | `#7FC8FF` | Supplementary accent (finger read hint) |

### Brand aliases (logo / light surfaces)

| Alias | Hex | Notes |
|---|---|---|
| `--ivory` | `#F2EBDA` | Same as `--ink` |
| `--fairway` | `#46C98A` | Same as `--path`; dark surfaces only |
| `--yellow` | `#F4D03F` | Same as `--flag` |
| `--fairway-deep` | `#1F8F5F` | Fairway on light backgrounds |
| `--yellow-deep` | `#D9AE1B` | Yellow on light backgrounds |

### Semantic usage

| Meaning | Color |
|---|---|
| Primary action | `--flag` on `#1a1500` text |
| Live / success / made putt | `--path` on `#04140c` text |
| Warning / over-read / miss | `--red` |
| Locked sensor reading | `--flag` (bubble) |
| Live sensor | `--path` (bubble) |
| Idle sensor | `--sage` (bubble) |
| Aim values & hero metrics | `--flag` |
| Ball trajectory | `--path` |
| Fall line / downhill arrow | `--sage` |

### Background treatment

The page background is a **single, gradual radial gradient** over `--felt-deep`. The effect reads as a soft top-light that deepens toward the tab-bar zone — never as a visible band or horizontal cut-off behind the header or first card.

**Canonical recipe (GreenIQ):**

```css
html { background: var(--felt-deep); }

body {
  min-height: 100vh;
  background-color: var(--felt-deep);
  background-image: radial-gradient(
    120% 60% at 50% -10%,
    #16382d 0%,
    var(--felt) 42%,
    var(--felt-deep) 100%
  );
  background-attachment: fixed;
}
```

| Property | Value | Why |
|---|---|---|
| Ellipse width | `120%` | Wide, even wash across the column |
| Ellipse height | `60%` | Light pools near the top and settles to base by mid-page |
| Origin | `50% -10%` | Light source above the viewport top |
| Highlight | `#16382d` | Slightly lifted green; do not go brighter |
| Mid stop | `var(--felt)` at `42%` | Holds the mid-tone through the first cards |
| Base | `var(--felt-deep)` at `100%` | Anchors bottom and tab-bar zone |
| Attachment | `fixed` | Pins gradient to the viewport on scroll |

**Do not:**

- Stack multiple gradients (radial + linear) — causes banding and hard edges
- Use more than three color stops on the page background
- Paint the header with a solid `--felt-deep` scrim — it creates a prominent dark line over the gradient

The header background must stay **transparent** so the page gradient shows through, whether the header scrolls with content (GreenIQ) or is `position: sticky` (suite apps).

Special card variant `.read` / `.card.read` (and PracticeIQ `.metric.hero`) uses a darker inset gradient:

```css
background: linear-gradient(180deg, #0c2820, #0a221b);
border-color: #2c5446;
```

### Overlays

| Element | Value |
|---|---|
| Modal scrim | `rgba(5, 16, 12, 0.74)` + `backdrop-filter: blur(3px)` |
| Tab bar | `rgba(9, 26, 21, 0.92)` + `backdrop-filter: blur(14px)` |
| Card inset highlight | `0 1px 0 rgba(255,255,255,.025) inset` |
| Card shadow | `0 8px 24px -18px #000` |

### On-color text pairings

| Background | Text |
|---|---|
| `--flag` | `#1a1500` |
| `--path` | `#04140c` |
| `--panel` / `--felt-deep` | `--ink` or `--ink-dim` |

---

## Typography

### Font stacks

| Role | Family | Weights loaded |
|---|---|---|
| **Display / UI** | `'Space Grotesk', ui-sans-serif, system-ui, sans-serif` | 500, 700 |
| **Data / metrics (whole suite)** | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | — |
| **Fallback body** | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | — |

> The suite uses the **system monospace stack** for all data/metrics. (PracticeIQ formerly shipped JetBrains Mono; it was unified to system mono so the apps read identically.)

Space Grotesk applies to: `.brand h1` / `.brand .wm`, `.card h2`, `summary`, `.tabbar button`, `.sect` / `.seclabel`, `.eyebrow`, `label.f` / `.field label`, nav labels.

Monospace applies to: `.mono`, stepper inputs, `.readout-slope`, `.bigval`, chips’ numeric values, insight stats, timers, counters, dates, scores. **Do not** set structural labels, section titles, or nav text in mono.

### Type scale

| Class / element | Size | Weight | Tracking | Transform | Color |
|---|---|---|---|---|---|
| `.brand h1` / `.brand .wm` | 21px | 500 / 700 split | −0.028em | — | `--ink` / `--path` |
| `.pill` | 10px | 800 | 0.16em | uppercase | `--felt-deep` on `--flag` |
| `.eyebrow` / `.seclabel` | 11px | 600 | 0.22em | uppercase | `--sage` |
| `.card h2` | 13px | 700 | 0.04em | — | `--ink` |
| `.card h2 .num` | 12px | mono | — | — | `--flag` |
| `.readout-slope` | 40px (+ 18px unit) | 600 | −0.02em | — | `--ink` / `--ink-dim` |
| `.bigval` | 34px (+ 15px unit) | 600 | −0.02em | — | `--ink` or `--flag` in `.aimcol` |
| Body / `.acc-body` | 13px | 400 | — | — | `--ink-dim` |
| `.hint` | 11.5px | 400 | — | — | `--ink-dim` |
| `.callout` | 13–15px | 600 | — | — | `--ink` |
| `.subline` | 12px | 400 | — | — | `--ink-dim` |
| `.field label` | 11px | 600 | 0.04em | uppercase | `--sage` |
| `button` | 13px | 600 | — | — | `--ink` |
| `.tabbar button` | 10.5px | 700 | 0.04em | — | `--ink-dim` / `--flag` when `.on` |
| `.sheet h3` | 16px | default | — | — | `--ink` |
| `footer` | 11px | 400 | — | — | `--sage` |

### Wordmark

```
<Prefix>  →  Space Grotesk 500, color: --ink     (Green / Strokes / Practice)
IQ        →  Space Grotesk 700, color: --path
```

Letter-spacing: `−0.028em`. "IQ" is always `--path` green. Prefer live HTML/SVG lockup over raster logos.

### Numeric conventions

- Use `font-variant-numeric: tabular-nums` on `.mono`.
- Slope: one decimal + `%`. Strokes gained: one decimal with explicit sign.
- Aim/pace: one decimal in imperial; metric rounds to whole cm where shown.
- Percentages in insights: whole numbers.

---

## Spacing

### Base rhythm

The layout uses a **4px implicit grid** with common steps at 6, 8, 9, 10, 11, 12, 13, 14, 15, 18px.

| Token / pattern | Value | Usage |
|---|---|---|
| `--r` | `16px` | Default border radius (cards, accordions) |
| Body horizontal padding | `14px` | Page gutters |
| Body top padding | `max(14px, safe-area-inset-top)` | Notch-aware |
| Body bottom padding | `86px + safe-area-inset-bottom` | Clears fixed tab bar |
| Card padding | `15px` | Standard card interior |
| Card margin-bottom | `13px` | Stack gap between cards |
| `.btnrow` gap | `8px` | Button groups |
| `.grid2` gap | `10px` | Two-column form fields |
| Header margin-bottom | `14px` | Below brand row |
| Section internal gaps | `11–14px` | Reader, clock, schematic blocks |

### Component-specific spacing

| Component | Padding / gap |
|---|---|
| Button default | `9px 12px` |
| Button small (`.sm`) | `5px 10px` |
| Tab bar | `6px 8px` + bottom safe area |
| Tab item | `7px 0`, icon gap `3px` |
| Stepper side buttons | `38px` wide |
| Stepper input | `10px 0` vertical |
| Chip | `6px 11px`, gap `7px` |
| Modal sheet | `18px` |
| Accordion summary | `14px 15px` |
| Accordion body | `0 15px 15px` |
| Verdict callout | `11px 13px` |
| Toast | `10px 16px` |

### Layout width

```css
max-width: 520px;
margin: 0 auto;
```

Portrait-only PWA (`manifest`: `"orientation": "portrait"`).

---

## Buttons

### Base

```css
font: inherit;
cursor: pointer;
border-radius: 11px;
border: 1px solid var(--line);
background: var(--panel-hi);
color: var(--ink);
padding: 9px 12px;
font-size: 13px;
font-weight: 600;
transition: transform 0.04s ease, background 0.15s, border-color 0.15s;
```

**Active press:** `transform: scale(0.96)`.

### Variants

| Class | Background | Border | Text | Use |
|---|---|---|---|---|
| *(default)* | `--panel-hi` | `--line` | `--ink` | Secondary actions |
| `.primary` | `--flag` | `--flag` | `#1a1500` | Main CTA per section |
| `.live` (alias `.path`) | `--path` | `--path` | `#04140c` | Sensor active / success state |
| `.ghost` | `transparent` | `--line` | `--ink` | Tertiary, cancel, toggle off |
| `.danger` | `transparent` | `--red` | `--red` | Destructive (delete) |
| `.sm` | — | — | — | Compact padding: `5px 10px`; use with any variant |
| `.block` | — | — | — | Full-width CTA: `width:100%`, `13px` padding, `14px`/700 |
| `.made` (log row) | default | `#2c5446` | `--path` | Successful putt log |

### Button groups (`.btnrow`)

```css
display: flex;
gap: 8px;
flex-wrap: wrap;
margin-top: 11px;
```

### Segmented control (`.seg`)

Inline toggle for mutually exclusive options:

```css
display: inline-flex;
border: 1px solid var(--line);
border-radius: 9px;
overflow: hidden;
```

Segment buttons: no border radius, `padding: 6px 11px`, `font-size: 12px`. Active (`.on`): `--flag` background, `#1a1500` text.

### Stepper buttons

Nested inside `.stepper` — borderless, `38px` wide, `font-size: 19px`, color `--sage`, no border-radius.

---

## Cards

### Standard card (`.card`)

```css
background: var(--panel);
border: 1px solid var(--line);
border-radius: var(--r); /* 16px */
padding: 15px;
margin-bottom: 13px;
box-shadow:
  0 1px 0 rgba(255,255,255,.025) inset,
  0 8px 24px -18px #000;
```

**Section header (`.card h2`):**

- Flex row, `gap: 8px`, `margin-bottom: 12px`
- Optional numbered badge (`.num`): mono, `--flag` text, `1px` border `--line`, `border-radius: 6px`, `padding: 2px 6px`
- Alternate badges use semantic colors (`.num.red` patterns, `.num.path` trainer)

### Hero read card (`.card.read` / `.read`)

Darker treatment to elevate the primary output above setup cards. Aim column (`.aimcol`) tints `.bigval` with `--flag`.

### Accordion (native `<details>`)

- Same border/radius as cards
- Summary: `font-size: 13px`, `font-weight: 700`, `padding: 14px 15px`
- Expand indicator: `+` / `–` in `--sage`, monospace, `18px`
- Body: `line-height: 1.62`, `--ink-dim` with `<b>` in `--ink`

### Modal sheet (`.sheet`)

- `border-radius: 18px`, `padding: 18px`, `max-width: 380px`

---

## Forms

### Field structure (`.field`)

```html
<div class="field">
  <label>Label <span class="u">(unit)</span></label>
  <!-- control -->
</div>
```

- Label: uppercase sage, `11px`, `letter-spacing: 0.04em`
- `.u` / `.u-inline`: normal case, `--ink-dim`, weight 500 — for units in parentheses

### Stepper (numeric input)

```
[ − ] [ centered mono value ] [ + ]
```

```css
.stepper {
  display: flex;
  border: 1px solid var(--line);
  border-radius: 11px;
  overflow: hidden;
  background: var(--felt-deep);
}
```

Input: centered mono, `17px`, weight 600, no focus outline. `.stepper.big` enlarges to `24px` input / `52px` buttons for modal capture.

### Range slider

```css
input[type=range] { width: 100%; accent-color: var(--flag); margin: 6px 0 0; }
```

### Text input (`.txtinput`)

Full-width on `--felt-deep`, `border-radius: 11px`, `--flag` focus border.

### Chip selectors (`.chips` / `.chip`)

```css
.chip {
  font-size: 12px;
  font-weight: 600;
  background: var(--felt-deep);
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 6px 11px;
}
```

Numeric value in chip: mono, `--flag`. Active (`.on`): `--flag` fill. Dismiss `×`: `--ink-dim`.

### Form layout

- Two-up fields: `.grid2` (`1fr 1fr`, gap `10px`, `min-width: 0` on children)
- Full-width fields below grid with `margin-top: 11px`

---

## Navigation

### Fixed tab bar (`.tabbar`)

| Property | Value |
|---|---|
| Position | `fixed`, bottom, full width, `z-index: 40` |
| Max width | `520px`, centered |
| Background | `rgba(9,26,21,.92)` + 14px blur |
| Border | `1px solid var(--line)` top |
| Safe area | `padding-bottom: calc(8px + env(safe-area-inset-bottom))` |

**Tab button:** column layout, icon (`21×21` SVG, stroke `1.9`, round caps) + label. Default `--ink-dim`; active (`.on`) `--flag`; no background fill; `border-radius: 12px`.

### Page switching (`.page`)

- Only one `.page.on` visible at a time; switching scrolls to top.
- Entry animation: `pgin` 0.18s ease.

### Header

- Brand lockup left (mark + wordmark); utility cluster right.
- Background stays **transparent** (scrolls with content or sticky) — never a solid `--felt-deep` overlay.

---

## Animations

### Page enter

```css
@keyframes pgin {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}
.page { animation: pgin 0.18s ease; }
```

### Button press

`transform: scale(0.96)` on `:active` — 40ms ease.

### Toast

```css
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(86px + env(safe-area-inset-bottom));
  transform: translateX(-50%) translateY(20px);
  background: var(--panel-hi);
  border: 1px solid var(--line);
  color: var(--ink);
  font-weight: 600;
  font-size: 13px;
  padding: 10px 16px;
  border-radius: 99px;
  opacity: 0;
  transition: 0.25s;
}
.toast.on { opacity: 1; transform: translateX(-50%) translateY(0); }
```

Auto-dismiss ~1.6–1.8s. **Toasts are neutral chrome** (`--panel-hi`) — never `--flag` or `--path` fills, per "one pop color."

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .page { animation: none; }
  * { transition: none !important; }
}
```

### What not to animate

- Chart redraws (instant SVG replace)
- Tab bar (instant color swap)
- No looping or decorative motion

---

## Charts & data visualization

Charts render as **inline SVG** (no chart library). Max 3 hues per diagram plus neutrals.

### Chart color rules

1. **One trajectory color** — `--path` for actual/simulated paths.
2. **Yellow = intent** — `--flag` for where to aim or start the ball.
3. **Sage = gravity** — fall lines, downhill indicators, chart annotations.
4. **Never rainbow** — max 3 hues per diagram plus neutrals.

### Insight bar charts (`.bar`)

```css
.bar { height: 8px; background: var(--felt-deep); border: 1px solid var(--line); border-radius: 99px; overflow: hidden; }
.bar i { display: block; height: 100%; background: var(--path); }
```

### Verdict panel (`.verdict`)

```css
border: 1px solid var(--line);
border-left: 3px solid var(--flag);   /* --red for .leak */
border-radius: 8px;
font-size: 13px;
line-height: 1.5;
```

---

## Border radius reference

| Element | Radius |
|---|---|
| Cards, accordions | `16px` (`--r`) |
| Buttons, stepper, text input | `11px` |
| Tab bar items | `12px` |
| Modal sheet | `18px` |
| Pills, toast, chips, bars | `99px` (full) |
| Number badge | `6px` |
| Segmented control | `9px` |
| Legend swatch | `2px` |
| Verdict | `8px` |

---

## Icons

- **Tab bar:** 24×24 viewBox, stroke-only, no fill, `stroke-width: 1.9`, round caps/joins, rendered at `21×21`.
- **Brand mark:** suite-specific glyph using palette rules — pin/flag dot `--flag`, ball/path `--path`, dimmed elements ivory at reduced opacity. Do not rotate, shadow, or recolor outside brand rules.
- **Minimum mark size:** 20px.

---

## Accessibility & platform

| Concern | Implementation |
|---|---|
| Safe areas | `env(safe-area-inset-*)` on body and tab bar |
| Theme color | `#0A201A` (HTML `theme-color` meta) / `#0E2A22` (manifest `theme_color`) |
| Tap highlight | `-webkit-tap-highlight-color: transparent` |
| Font smoothing | `-webkit-font-smoothing: antialiased` |
| Overscroll | `overscroll-behavior-y: none` on `html, body` |
| Motion | Respects `prefers-reduced-motion` |
| PWA | Standalone, portrait, offline via service worker |

---

## File reference

| File | Design responsibility |
|---|---|
| `golfiq-design/golfiq.css` | **Canonical** tokens, page treatment, shared primitives |
| `golfiq-design/DESIGN_SYSTEM.md` | **Canonical** cross-suite spec (this file) |
| `golfiq-design/sync.mjs` | Propagates `golfiq.css` + this doc into each app |
| `greeniq/golfiq.css` · `styles.css` | Vendored shared layer (linked) + GreenIQ-specific components |
| `strokesiq/src/styles/golfiq.css` · `components.css` | Vendored shared layer (imported) + StrokesIQ components |
| `practiceiq/golfiq.css` · inline `<style>` | Vendored shared layer (linked) + a small reconciliation override block + PracticeIQ components |

---

## Suite app notes

App-specific structures are intentional product choices, not spec exceptions. All apps share the tokens, background, fonts, and primitives above.

### GreenIQ (reference)

Putt-read instrument: slope reader, direction clock, schematic, feel trainer. Header scrolls with content.

### StrokesIQ

Strokes-gained tracker: scoring-potential hero, leak diagnosis, diverging SG bars, miss heat grid, per-hole entry. 3-tab bar (Home · Rounds · More).

### PracticeIQ

| Area | PracticeIQ |
|---|---|
| Tabs | 5 items (Today · Practice · Rounds · Plan · More) |
| Header | Sticky, transparent — gradient must show through |
| Data font | System mono (unified with the suite) |
| Hero metric | `.metric.hero` uses the `.read` card gradient |
| Accent rail | `.cue` banner — flag-yellow left border (swing thought) |
| Category pills | Semantic tinted `.pill` variants (speed / putt / score), token-derived |
| Primary CTA | `.btn.primary` on save, start, and done actions |

---

## Quick start for new GolfIQ surfaces

1. Link/import the shared layer: `golfiq.css` (vendor a copy via `golfiq-design` sync, or `import '@golfiq/design/css'` in a build app).
2. Load Space Grotesk (500, 700).
3. The shared layer already applies tokens, the canonical page background, `.mono`, and all primitives.
4. Stack content in `.card` sections inside a 520px column.
5. Put primary actions in `.primary`; keep yellow scarce. Toasts stay neutral.
6. Render measurements in mono; labels in uppercase sage eyebrows (Space Grotesk).
7. Anchor navigation in a blurred `.tabbar` with safe-area padding; active tab uses `--flag`.
8. Draw data as SVG using `--path`, `--flag`, and `--sage` semantics.
