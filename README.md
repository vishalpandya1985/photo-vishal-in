# photo.vishal.in — Graphics & Icon Update

Only the two frontend files changed — `server.js` and `admin.html` are identical to the last version (visibility feature).

## What's new

**Login page**
- A custom hero illustration above the login card — two overlapping photo/video cards with an upload arrow, in your purple brand gradient.
- The lock icon is now a crisp vector icon instead of an emoji.

**Main app page**
- Logo, "Manage Users" link, dropzone, username display, and the Files/Trash tabs now use a consistent line-icon set instead of emoji.
- Every file card shows a small badge icon (image or video) in the corner so file type is clear at a glance, not just from the thumbnail.
- **Empty states**: uploading nothing yet, or an empty Trash, now show a custom illustration instead of plain text.

Everything else — visibility controls, uploads, downloads, trash/restore — works exactly the same as before.

## How to deploy

Only two files changed this time:
1. On GitHub, open `public/login.html` → edit → replace with the new version → Commit.
2. Open `public/index.html` → edit → replace with the new version → Commit.
3. Railway auto-redeploys within a minute or two.

No database or server changes this time, so this update is lower-risk than the last one — nothing to break on the backend.
