# GreenIQ — Green Reading & Putting Trainer

A free, offline, install-to-home-screen web app that reads any putt and trains your eye to do it without the app. Built as an open alternative to subscription green-reading tools.

**Live app → [ifunner.github.io/greeniq](https://ifunner.github.io/greeniq/)**

---

## What it does

Lay your phone flat on the green and GreenIQ measures the slope from the motion sensors, combines it with your putt length and the green speed, and returns two things every putt comes down to: **how much to aim** (break) and **how hard to hit it** (pace) — plus a top-down view of the curving ball path.

Then it helps you stop needing it. Two trainers build the underlying skill so you can read greens on feel during a round, where measuring devices aren't allowed.

## Features

- **Live slope reader** — slope % and direction from the phone's accelerometer, with zero-calibrate and lock.
- **Physics-based reads** — rolls a virtual ball for every putt, so long putts break more than short ones and downhill breaks more than uphill.
- **Trajectory view** — ball path, apex, aim point, fall line, and hole.
- **Break Trainer** — commit your own read before the answer reveals; scored and tracked over time.
- **Feel Trainer** — hide the sensor number while you read slope through your feet, then reveal what it measured.
- **Finger calibration** — converts reads into fingers held at arm's length, tuned to your hand.
- **Putt logging & miss-pattern diagnosis** — make rates by distance and personal bias detection (e.g. low-side under-read).
- **The Feel & Fingers method** — built-in guide: feel it, number it, finger it, verify it.
- **Course notebook** — save courses with speed and grain; load with one tap.
- **Grain, metric units, green-speed finder, pace-off helper** — all offline.

## How it works

Reads use a small ball-roll simulation rather than a static chart:

- Rolling friction from green speed (Stimpmeter).
- Slope gravity term `(5/7)·g·sinθ` for a rolling sphere.
- "Smart" pace finishes ~1.5 ft past the cup.
- The engine solves for the start line that curls the ball into the hole.

Validated against known tour reads (10 ft · 2% · stimp 10 ≈ 8.6 in of aim).

## GolfIQ suite

GreenIQ is the **putting-read side** of GolfIQ — train your eyes on the practice green.

- **[StrokesIQ](https://ifunner.github.io/strokesiq/)** — strokes gained round tracking; shows where putting (and every category) costs you strokes.
- **[PracticeIQ](https://ifunner.github.io/practiceiq/)** — practice planner and session logger; turns your leak into daily routines.

## Install on your phone

1. Open **[ifunner.github.io/greeniq](https://ifunner.github.io/greeniq/)** in Safari (iOS) or Chrome (Android).
2. Share → **Add to Home Screen**.
3. Launch, tap **Start sensor**, and allow motion access.

Runs fully offline after the first load. All stats and saved courses stay on your device.

## Note

GreenIQ is a **practice tool**. Measuring slope during a competitive round is against the Rules of Golf — the point is to train your reads on the practice green until you can trust your own eyes.

---

## For developers

Installable PWA — vanilla JavaScript, no framework, no build step, no backend, no tracking. Device Motion API requires HTTPS (GitHub Pages).

| File / folder | Role |
|---|---|
| `index.html` | App shell |
| `golfiq.css` | Vendored shared design system (sync from [`golfiq-design`](https://github.com/ifunner/golfiq-design)) |
| `styles.css` | GreenIQ-specific components (slope reader, clock, schematic) |
| `app.js` | Physics engine, trainers, logging |
| `sw.js` | Offline cache + updates |
| `manifest.webmanifest` | Install metadata |
| `greeniq-logo/` | Brand assets & PWA icons |

Design tokens and cross-suite UI rules: [`golfiq-design`](https://github.com/ifunner/golfiq-design) · [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md).
