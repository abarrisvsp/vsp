# Your VSP Website — Quick Guide

## Logging in

Go to **https://visionarysoundproductions.com/login**

There's no password to remember. Instead:

1. Enter your email: **Aaron@VisionarySoundProductions.com**
2. Click **Email me a code**.
3. Open your email — you'll get a **6-digit code** (it arrives within a minute and expires in 10 minutes).
4. Type the code in, and — if you don't want to log in again for a while — check **"Stay signed in for 14 days."**
5. Click **Sign in**.

If the code doesn't arrive, check spam, then click **Resend code**. The code can only be used once.

---

## Turning on edit mode

After logging in, you'll see a thin dark bar at the top of every page.
Click the **"Edit mode: OFF"** toggle — it turns green and says "ON".

---

## Editing text

1. With edit mode ON, every editable headline / paragraph glows with a soft gold dashed outline.
2. Click one. The text becomes editable in place.
3. Type your changes.
4. Click **Save**.

**Keyboard shortcuts while editing:**
- `Cmd/Ctrl + Enter` — Save
- `Escape` — Cancel
- `Enter` (single-line fields) — Save

If you try to leave the page with unsaved edits, your browser will warn you.

---

## Replacing a photo

1. With edit mode ON, hover any photo.
2. A camera icon appears with "Click to replace".
3. Click it — a box opens.
4. Drag a new photo in, or click to browse.
5. Click **Use this image**.

Photos accepted: JPG, PNG, WebP. Max 10 MB each.

---

## Adding gallery photos

1. Go to **Gallery** with edit mode ON.
2. A red **+** button appears bottom-right.
3. Click it. Drop in one or many photos at once.
4. They appear in the grid immediately.
5. Hover any photo to edit its title/caption or delete it.
6. **Drag photos to reorder** — the new order saves automatically.

---

## Writing a blog post

1. Go to **Journal** (the blog page) with edit mode ON.
2. Click **Write new post** in the top-right.
3. Fill in title, date, category, excerpt, read time.
4. Upload a cover image (drag-and-drop).
5. Write the body using the toolbar (bold, italic, headings, lists, quotes, links, inline images).
6. Click **Save draft** to save without publishing.
7. Click **Publish** to make it live immediately.

**To edit a published post:** click the post, then click **Edit full post** at the top.
**To unpublish:** open the post, click the green **Published** badge — it flips to **Draft**.

---

## Checking contact form messages

1. Click **Inbox** in the top bar (it shows a red badge with the unread count).
2. New (unread) messages appear in **bold with a blue stripe on the left**.
3. Click any row to expand and read it. Reading marks it as read.
4. Add **private notes** in the notes box — they save automatically when you click away.
5. Click **Archive** to move it out of the active list.
6. The **Archived** tab shows old/archived inquiries.

**You also get an email** at Aaron@VisionarySoundProductions.com every time someone submits the form — so you don't need to check the inbox to know something came in.

---

## If something looks wrong

- **Refresh the page** (Cmd/Ctrl + R)
- Check the top bar — if **Edit mode: ON** is green, toggle it OFF and look again
- If a save fails, you'll see a small red toast in the bottom-right — try again
- Still wrong? Text Nick.

---

## Signing out

Click **Sign out** on the right side of the top bar.

You can also just close the browser tab. If you checked **"Stay signed in for 14 days"** when you logged in, you'll stay signed in for two weeks; otherwise your session lasts about 12 hours.

---

## For the developer — break-glass access

Sign-in normally requires a code emailed to Aaron@VisionarySoundProductions.com. If that mailbox is ever unavailable, there is a hidden password fallback:

1. Generate a bcrypt hash of a temporary password (e.g. `npx bcryptjs <password>` or any bcrypt tool).
2. Set `ADMIN_PASSWORD_HASH` to that hash in the Vercel project's environment variables and redeploy.
3. On `/login`, open the browser console and submit the credentials callback with a `password` field (the password path is intentionally not shown in the UI), or temporarily add a password input.
4. Remove/rotate the hash afterward.

This is deliberately inconvenient so it isn't the everyday path — the email code is.

---

## Quick reference

| Page                  | URL                                        |
| --------------------- | ------------------------------------------ |
| Public homepage       | `/`                                        |
| Gallery               | `/gallery`                                 |
| Blog (journal)        | `/blog`                                    |
| Contact form          | `/contact`                                 |
| Login                 | `/login`                                   |
| Inbox                 | `/admin/inbox` *(login required)*          |
| Write new post        | `/admin/blog/new` *(login required)*       |
