# GreenIQ — Logo & Brand Assets

GreenIQ is a green-reading / putting-trainer app. The logomark is a breaking
putt: one arc (the ball's path), a ring (the cup), a flag-yellow pin dot, and
a dot for the ball at the start of the arc.

## Files

| File | Use |
|---|---|
| `mark.svg` | Logomark for **dark** surfaces (transparent bg) |
| `mark-light.svg` | Logomark for **light** surfaces |
| `mark-mono.svg` | Single-color, inherits `currentColor` — tint via CSS |
| `favicon.svg` | Scalable favicon (felt-green rounded square) |
| `favicon-32.png`, `favicon-16.png` | Raster favicons, corners baked |
| `icon-512.png`, `icon-192.png` | PWA icons, `purpose: any` (full-bleed square) |
| `icon-maskable-512.png`, `icon-maskable-192.png` | PWA icons, `purpose: maskable` (mark inside 80% safe zone) |
| `apple-touch-icon.png` | 180×180, iOS applies its own rounding |
| `lockup-dark.png`, `lockup-light.png` | Mark + wordmark, 924×254 — fine up to ~300px display width |

## Brand palette

```css
--felt:         #0E2A22;  /* primary dark background, theme_color */
--felt-deep:    #0A201A;  /* deepest background, background_color */
--ivory:        #F2EBDA;  /* wordmark / text on dark */
--fairway:      #46C98A;  /* ball path, "IQ" accent — dark surfaces only */
--yellow:       #F4D03F;  /* the ONE pop color: cup/aim point, use sparingly */
--fairway-deep: #1F8F5F;  /* fairway equivalent on light surfaces */
--yellow-deep:  #D9AE1B;  /* yellow equivalent on light surfaces */
```

## Wordmark

Typeface: **Space Grotesk** (Google Fonts), `letter-spacing: -0.028em`.
"Green" at weight 500 in ivory (or felt on light bg); "IQ" at weight 700 in
fairway green. Prefer this live-HTML lockup over the PNGs in-app — it stays
crisp at any size:

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<div style="display:flex;align-items:center;gap:0.55em;font-family:'Space Grotesk',sans-serif;
            font-size:32px;letter-spacing:-0.028em;line-height:1">
  <img src="/greeniq-logo/mark.svg" alt="" style="width:1.42em;height:1.42em">
  <span><span style="font-weight:500;color:#F2EBDA">Green</span><span
    style="font-weight:700;color:#46C98A">IQ</span></span>
</div>
```

## manifest.webmanifest

```json
{
  "theme_color": "#0E2A22",
  "background_color": "#0A201A",
  "icons": [
    { "src": "/greeniq-logo/icon-192.png",          "sizes": "192x192", "type": "image/png" },
    { "src": "/greeniq-logo/icon-512.png",          "sizes": "512x512", "type": "image/png" },
    { "src": "/greeniq-logo/icon-maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/greeniq-logo/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## <head>

```html
<link rel="icon" href="/greeniq-logo/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/greeniq-logo/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/greeniq-logo/apple-touch-icon.png">
<meta name="theme-color" content="#0E2A22">
```

## Rules

- Clear space around the mark ≥ the ball's diameter (12% of mark width).
  Minimum mark size 20px; minimum lockup height 24px.
- Fairway green and flag yellow on dark felt only; on light surfaces use the
  deep shades (already baked into `mark-light.svg`).
- Yellow is reserved for the cup/aim point — never decoration.
- Don't rotate the mark, restyle the arc, add shadows/gradients, or set the
  wordmark in another typeface.
