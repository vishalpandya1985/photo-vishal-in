# photo.vishal.in — Installable Mobile App (PWA)

This turns your existing website into an installable app, without any app store, developer account, or fees. It's called a "PWA" (Progressive Web App) — it uses your same Railway deployment, just with a few extra files added.

## New files added
- `public/manifest.json` — tells the browser the app's name, icon, and colors
- `public/sw.js` — a minimal service worker (required by Android/Chrome to allow installing; it does not cache anything, so your data always stays fresh)
- `public/icons/` — 5 icon files (a simple camera mark matching your current black-and-white design), used for the home screen icon, browser tab, and iOS

## Files changed
- `server.js` — small change so the manifest/icons/service worker can load even before someone logs in
- `login.html`, `index.html`, `admin.html` — added the manifest link and icon tags to each page's `<head>`, and registered the service worker

## How to deploy

Since this adds new files (not just edits), do it via GitHub's **"Add file → Upload files"** screen this time, rather than editing existing files one by one:

1. Go to your repo on GitHub.
2. Click **"Add file" → "Upload files"**.
3. Drag in:
   - `server.js` (overwrites the existing one)
   - `public/login.html`, `public/index.html`, `public/admin.html` (overwrite existing — rename them with the `public/` prefix the same way you did before if GitHub doesn't auto-detect the folder)
   - `public/manifest.json`
   - `public/sw.js`
   - `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable-512.png`, `public/icons/apple-touch-icon.png`, `public/icons/favicon-64.png`
4. Commit changes.
5. Railway auto-redeploys within a minute or two.

## How to install it on a phone

**On Android (Chrome):**
1. Open your site's URL in Chrome.
2. Tap the **⋮** menu → **"Install app"** (or you may see a banner suggesting this automatically).
3. The app icon appears on the home screen, opens full-screen with no browser bar, just like a regular app.

**On iPhone (Safari):**
1. Open your site's URL in Safari.
2. Tap the **Share** icon (square with an arrow) → **"Add to Home Screen"**.
3. Confirm — the icon appears on the home screen.

## Notes
- This is not published in the Google Play Store or Apple App Store — it installs directly from the browser, which is completely free and works immediately (no review process, no waiting).
- If you ever want a real Play Store / App Store listing later, this same manifest/icon setup is actually a head start — a tool like Bubblewrap (Android) or Capacitor (both platforms) can wrap this PWA into a store-ready app, but that's a separate, bigger project involving developer accounts and platform-specific build tools.
