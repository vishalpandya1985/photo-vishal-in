# photo.vishal.in — Sound Effects on Login, Logout, and Upload

Only `server.js` and `public/index.html` changed. `login.html` and `admin.html` are untouched.

## What's new

Three short tones play automatically:
- **On login** — a rising 3-note chime, right after you land on the Files page.
- **On logout** — a gentler descending 2-note tone, played just before you're sent back to the login page.
- **When an upload finishes** — a quick 2-note "ding".

## How it works
These aren't audio files — they're generated on the fly using the browser's built-in Web Audio API (a few lines of JavaScript create the tones directly). This means:
- No files to upload, host, or worry about licensing for.
- Tiny code footprint, loads instantly.
- Easy to tweak — the notes are just frequency numbers in `index.html`, so changing the tune is a one-line edit.

## A note on browser autoplay rules
Browsers restrict sounds that play without the user having interacted with the page first. The logout and upload sounds are triggered directly by a click/upload action, so they play reliably. The **login sound** plays right after the page loads following your login redirect — most browsers allow this since it follows directly from your login click, but a small number of strict browser/privacy configurations may silently block it. If that happens, everything else on the site still works normally — it just won't make a sound in that one case.

## How to deploy
1. On GitHub, open `server.js` → edit (pencil icon) → replace all content with the new version → Commit.
2. Open `public/index.html` → same → Commit.
3. Railway auto-redeploys within a minute or two.

## If you want different sounds
Look for these three lines near the top of `index.html`'s script:
```js
function playLoginSound() { playTones([[523.25, 0.15], [659.25, 0.15], [783.99, 0.28]]); }
function playLogoutSound() { playTones([[659.25, 0.18], [440.00, 0.3]]); }
function playUploadSound() { playTones([[880, 0.1], [1318.51, 0.22]]); }
```
Each pair is `[frequency in Hz, duration in seconds]`. Higher numbers = higher pitch. Add more pairs to a list for a longer tune.
