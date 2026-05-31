# Admin email-code (OTP) login + domain redirect fix

Date: 2026-05-31
Status: Approved for implementation

## Problem

1. **Admin redirects to the old domain.** Visiting `/admin` on the live site
   bounces to `https://vsp-site-ruddy.vercel.app/login`. NextAuth v5 anchors its
   sign-in flow to `NEXTAUTH_URL`/`AUTH_URL`; that production env var still points
   at the old Vercel URL. The canonical domain is now
   `https://visionarysoundproductions.com`.
2. **No way to recover access.** The admin password is a bcrypt hash in the
   `ADMIN_PASSWORD_HASH` env var, which cannot be rewritten at runtime, so there
   is no self-service "forgot password."

## Decision

Replace the password with **passwordless email one-time codes (OTP)**, plus a
"stay signed in for 14 days" option. There is no password to forget, so the
recovery problem disappears: as long as Aaron can read the
`Aaron@VisionarySoundProductions.com` inbox, he can always sign in.

## Login flow

1. `/login`: Aaron enters his email, clicks "Email me a code."
2. A 6-digit code is emailed to the admin address (valid 10 minutes, single-use).
3. He enters the code; an optional "Stay signed in for 14 days" checkbox controls
   session length. Default (unchecked) session is ~12 hours.
4. On success he lands on `/admin` (or the `callbackUrl` the middleware set).

### Guardrails
- The code is stored only as a SHA-256 hash in Supabase, never in plaintext.
- Single-use: marked consumed on first successful verification.
- Max 5 failed attempts per code, then the code is dead.
- A fresh code cannot be requested more than once per 60s (anti-spam).
- Sign-in only ever emails the known `ADMIN_EMAIL`; other addresses get the same
  "if that's the admin email, a code was sent" response (no enumeration).

## Components

### Supabase table `admin_login_codes`
| column      | type        | notes                                  |
|-------------|-------------|----------------------------------------|
| id          | uuid pk     | `gen_random_uuid()`                    |
| code_hash   | text        | SHA-256 of the 6-digit code            |
| expires_at  | timestamptz | now + 10 min                           |
| used_at     | timestamptz | null until consumed                    |
| attempts    | int         | failed verifications, default 0        |
| created_at  | timestamptz | default now()                          |

RLS enabled, no public policy — only the service role (server) touches it.

### `lib/auth.ts`
- Credentials provider `authorize` accepts `{ email, code, remember }`.
  - Primary path: look up the newest unused, unexpired code; compare SHA-256;
    on match mark `used_at` and return the admin user carrying `remember`.
    On mismatch increment `attempts`.
  - Break-glass path (no UI): if `password` is supplied and `ADMIN_PASSWORD_HASH`
    is set, fall back to the existing bcrypt check. Lets us regain access if the
    mailbox is ever unavailable.
- Session length: `session.maxAge` set to 14 days (cookie ceiling). The real
  expiry is enforced by an absolute `absExp` claim set at sign-in
  (`remember ? 14d : 12h`) and checked in middleware.

### `lib/actions/auth.ts` — `requestLoginCode(email)`
Server action: validate email is the admin's, rate-limit, generate a 6-digit
code, store its hash + expiry, email it via Resend. Always returns a neutral ok.

### `lib/email/login-code.ts`
Resend email containing the 6-digit code, 10-minute expiry note, branded to match
the existing broadcast email style. Uses the corrected `SITE_URL`.

### `components/auth/LoginForm.tsx`
Two-step client form: (1) email → "Email me a code"; (2) code input + "Stay
signed in for 14 days" checkbox → `signIn('credentials', { email, code, remember })`.
Handles invalid/expired-code errors and a "resend code" affordance.

### `middleware.ts`
In addition to the existing `!req.auth` check, treat a session whose `absExp`
has passed as logged out for `/admin` routes.

## Domain fix (deployment, not code)
- Set `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to
  `https://visionarysoundproductions.com` in the `vsp-site` Vercel project
  (Production), then redeploy. Requires VSP Vercel auth (the local CLI is logged
  in as `teeaheadllc`).
- Fix the hardcoded `https://vsp-site-ruddy.vercel.app` fallback in
  `lib/email/post-broadcast.ts:5`.

## Out of scope
- Multi-admin / role management (single admin only).
- True two-factor (password + code) — rejected in favor of passwordless.
- TOTP authenticator apps.

## Break-glass (documented)
If the `Aaron@` mailbox is unavailable: set `ADMIN_PASSWORD_HASH` in Vercel to a
fresh bcrypt hash and sign in via the hidden password path (see README/SETUP).
</content>
</invoke>
