# photo.vishal.in — Users Can Make Their Own Files Private

Only `server.js` and `public/index.html` changed. `login.html` and `admin.html` are unchanged from the previous update.

## What's new

Any logged-in user (not just admins) can now mark a file **"Only me"** — hiding it from every other regular user. They can toggle it back to public just as easily.

- On each file card, non-admin users now see a button that says either **"Only me"** (file is currently public) or **"Make public"** (file is currently private to just them).
- Admins keep their existing full **"Visibility"** button, which still opens the detailed picker for choosing exactly which users can see a file.
- **Safety guard:** if an admin has specifically shared a file with a particular set of people, regular users see a disabled **"Shared"** button instead of being able to toggle it — this prevents someone from accidentally undoing an admin's deliberate sharing setup. Only an admin can change that file's sharing from that point.
- This works the same way in both the **Files** and **Trash** tabs.

## How to deploy
1. On GitHub, open `server.js` → edit (pencil icon) → replace all content with the new version → Commit.
2. Open `public/index.html` → same → Commit.
3. Railway auto-redeploys within a minute or two.

No new database table needed — this reuses the same `file_permissions` table from the admin visibility feature, just with simpler rules for non-admins.

## Trying it out
1. Log in as a regular (non-admin) user, upload a file — it'll show "Only me" as an option even though it's public by default.
2. Click **"Only me"** — the button changes to **"Make public"**, and this file now only shows up in that user's own gallery.
3. Log in as a different regular user — confirm the file is no longer visible to them.
4. Click **"Make public"** as the original user to share it again with everyone.
5. As admin, use the full **Visibility** button to share a file with a specific second user — then log in as a third regular user and confirm they see a disabled **"Shared"** button on that file instead of being able to toggle it.
