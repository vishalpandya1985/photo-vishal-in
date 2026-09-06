# photo.vishal.in — Cinematic Editorial Redesign

Only the three HTML files changed — `server.js` is untouched, so this is safe to deploy.

## What changed

**Complete style pivot** — moved from bright/playful to moody, editorial, and cinematic, inspired by the reference you shared.

**Login page — full rebuild**
- Custom full-bleed dusk mountain scene as the background — layered mountain silhouettes, a warm horizon glow, pine tree silhouettes framing the edges, and a soft vignette. This is a hand-built SVG (not a stock photo), so it loads instantly and has no licensing concerns.
- Large italic serif headline ("Welcome back.") in Playfair Display, echoing the reference's editorial typography.
- A small pill badge above the headline ("Private photo & video vault").
- Minimal, transparent underline-style inputs instead of a solid card — text and inputs sit directly on the photo, like the reference.
- A solid white pill button for "Log In", matching the reference's "Talk to us" button style.
- Minimal top-left wordmark instead of a heavy header bar.

**Main app & Manage Users pages**
- New font pairing throughout: **Playfair Display** (italic) for the brand wordmark, **Inter** for all UI text.
- Header bar recolored from the bright gradient to a deep dusk gradient (navy → slate → muted mauve), matching the login scene's sky.
- Primary accent recolored from bright teal to a muted pine-slate green (`#3D5A54`) — used consistently for buttons, active tab, focus states, and badges.
- Empty-state illustrations and the Visibility button re-tinted to fit the muted palette instead of teal/coral.
- Animations toned down from bouncy/springy to smooth and confident — fits the more premium, restrained mood better than the previous playful motion.

## How to deploy
Same process as always — edit each file on GitHub (pencil icon → replace entire content → commit):
1. `public/login.html`
2. `public/index.html`
3. `public/admin.html`

Railway auto-redeploys within a minute or two.

## Notes
- The background scene is a single inline SVG with `preserveAspectRatio="xMidYMid slice"`, so it fills any screen size/ratio like a `background-size: cover` photo would, without distortion or extra image requests.
- If you'd like the mountain scene's colors adjusted (warmer/cooler, more or fewer trees, different time of day), the gradient stops and shapes are all clearly laid out near the top of `login.html` and easy to tweak.
