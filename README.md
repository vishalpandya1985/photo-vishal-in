# photo.vishal.in — Tropical Botanical Redesign

`server.js` is unchanged from the previous update (self-visibility feature) — only the three HTML files changed.

## What changed

**New scene** — replaced the dusk mountain background with a teal-to-deep-blue gradient and stylized palm frond silhouettes in the corners, inspired by the reference image. Like the mountain scene, this is a hand-built SVG (not a stock photo), so there's nothing to license and it loads instantly.

**New typography** — replaced Playfair Display with **Josefin Sans** (thin, wide-letter-spaced, lowercase), matching the reference's minimal boxed logo style.

**Login page — rebuilt to match the reference's structure**
- A thin-bordered box around the site name, echoing the reference's boxed "botanme" logo.
- Minimal underline-style inputs and an all-caps, letter-spaced, **outlined** button (transparent background, white border) — filling in solid white on hover — matching the reference's "BUY A BUNCH" style buttons.
- A light cream info band below the hero photo, and a warm gray footer band with the developer credit, mirroring the reference's tagline + footer sections.

**Main app & Manage Users pages**
- Same tropical scene now sits behind these pages too, with the frosted glass content panel unchanged in behavior.
- Accent color shifted from the previous muted pine-green to a teal-blue (`#0E5C6E`) to match the new scene.
- Wordmark restyled in lowercase Josefin Sans.

Nothing about functionality changed — uploads, downloads, trash/restore, visibility controls (including the "Only me" toggle), and user management all work exactly as before.

## How to deploy
Edit each file on GitHub (pencil icon → replace entire content → commit):
1. `public/login.html`
2. `public/index.html`
3. `public/admin.html`

Railway auto-redeploys within a minute or two.

## Notes
- The palm leaf shapes and gradient colors are defined near the top of each file's SVG block, so adjusting the exact hues or leaf density later is a simple, contained edit.
