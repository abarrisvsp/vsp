-- 006_admin_login_codes.sql
-- Passwordless admin sign-in. Each "email me a code" request stores only the
-- SHA-256 hash of a 6-digit code with a short expiry. The server (service role)
-- creates and verifies rows; there is no public access. Codes are single-use
-- and capped at 5 failed attempts.

CREATE TABLE IF NOT EXISTS admin_login_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Verification looks up the newest unused, unexpired row.
CREATE INDEX IF NOT EXISTS admin_login_codes_active_idx
  ON admin_login_codes (created_at DESC)
  WHERE used_at IS NULL;

ALTER TABLE admin_login_codes ENABLE ROW LEVEL SECURITY;
-- No policies: the anon/auth roles get nothing. Only the service role, which
-- bypasses RLS, may read or write.
