# photo.vishal.in — Monochrome Architectural Redesign

`server.js` is unchanged — only the three HTML files changed. I carried this through login, the app, and Manage Users the same way as the last two redesigns, since that's been the pattern each time.

## What changed

**New scene** — a stark black-and-white geometric lattice, inspired by the reference: a curved diagonal band of light-catching diamond facets sweeping across a near-black background, with a soft white glow. Built as a custom SVG pattern (not a photo), so nothing to license and it renders instantly.

**Fully monochrome palette** — no color anywhere on the site now. Every accent, button, active tab, and badge that used to be teal-blue is now pure black/charcoal/white/gray. This is a deliberate, total commitment to the reference's black-and-white photography look rather than a tinted version of it.

**New typography** — replaced Josefin Sans with **Space Grotesk** (a technical, architectural-feeling geometric grotesk) for headings, wordmarks, and buttons, paired with **Inter** for body text — fitting the stark, structural mood of the reference.

**Login page**
- Minimal uppercase wordmark, top-left.
- Bold uppercase headline ("WELCOME BACK") with a small horizontal rule accent above it, echoing architectural title treatments.
- Solid white button that inverts to outlined-on-transparent on hover, instead of any colored button.

**App & Manage Users pages**
- Same lattice scene behind everything, frosted glass content panel unchanged in behavior.
- All buttons, active states, and badges are now black/charcoal instead of colored.

Nothing about functionality changed — uploads, downloads, trash/restore, visibility controls (including "Only me"), and user management all work exactly as before.

## How to deploy
Edit each file on GitHub (pencil icon → replace entire content → commit):
1. `public/login.html`
2. `public/index.html`
3. `public/admin.html`

Railway auto-redeploys within a minute or two.

## Notes
- The lattice pattern's angle, density, and the curved band's shape are all defined near the top of each file's SVG — straightforward to adjust if you want the facets denser/sparser or the curve positioned differently.
