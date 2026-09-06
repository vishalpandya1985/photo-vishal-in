# photo.vishal.in — Vibrant & Playful Redesign

Only the three HTML files changed — `server.js` is untouched, so this is a safe, low-risk update (nothing backend to break).

## What changed

**New color palette** — moved away from the purple gradient to a bolder duo:
- **Warm sunset gradient** (magenta → coral → gold) for headers and the login background — used for "brand moment" areas.
- **Vivid teal** as the single interactive accent — every button, active tab, focus outline, badge, and link now uses this consistently instead of scattered colors.

**New typography** — replaced Poppins with a playful pairing:
- **Baloo 2** (bold, rounded, chunky) for headings and page titles.
- **Quicksand** (rounded, friendly) for body text and buttons.

**More energy in the motion**
- Buttons now have a springy "pop" on hover and a satisfying press-down on click, instead of a flat 1px nudge.
- Gallery cards lift, tilt slightly, and scale up on hover — feels more tactile.
- The login card now bounces into place on load instead of just fading in.
- Added a few softly floating colored blobs drifting behind the login card for extra life.

**Recolored illustrations** — the hero graphic on login and the empty-state illustrations (no files / empty trash) now use the new teal + coral palette instead of purple, so everything feels part of one cohesive look.

## How to deploy
Same as always — edit each file on GitHub (pencil icon → replace all → commit):
1. `public/login.html`
2. `public/index.html`
3. `public/admin.html`

Railway auto-redeploys within a minute or two.

## If you want to tweak the palette further
The core colors are used consistently, so adjusting the vibe later is easy:
- Sunset gradient: `#FF3CAC` (magenta) → `#FF7A59`/`#FF6B6B` (coral) → `#FFAA4C` (gold)
- Teal accent: `#00D9C0` (light) → `#00A88F` (base/hover)

Swapping those hex values throughout would shift the whole theme without touching layout or functionality.
