# photo.vishal.in — Mobile-Friendly Update

Only the three HTML files changed — `server.js` is untouched.

## What was wrong
None of the pages had a mobile "viewport" tag. Without it, phones render the page as if on a desktop screen and then zoom out to fit — everything looks tiny and you have to pinch-zoom to use it.

## What's fixed

**All pages**
- Added the viewport tag so phones render at their actual screen width.

**Login page**
- Hero illustration and card scale down nicely on narrow screens instead of overflowing.

**Main app page**
- Header stacks/wraps cleanly on small screens; username hides on very narrow phones to save space (still visible via other cues).
- Files/Trash tabs become full-width and easier to tap.
- The gallery grid uses smaller tiles on phones so more fit per row without feeling cramped.
- The upload dropzone and "Download selected" button resize/stack for one-handed use.
- The Visibility picker modal fits within a phone screen instead of overflowing.

**Manage Users page**
- The user table scrolls horizontally on narrow screens instead of squishing columns unreadably.
- The "Add user" form stacks vertically on phones.

## How to deploy
Same as before — edit each of the three files on GitHub (pencil icon → replace → commit):
1. `public/login.html`
2. `public/index.html`
3. `public/admin.html`

Railway auto-redeploys within a minute or two. No backend/database changes, so this is a safe, low-risk update.

## Testing on your phone
Once redeployed, open your Railway URL (or `photo.vishal.in` if attached) directly on your phone's browser — everything should now be properly sized and usable without zooming or horizontal scrolling (except the Manage Users table, which scrolls sideways on purpose if there are many columns).
