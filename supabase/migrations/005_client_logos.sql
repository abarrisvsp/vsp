-- 005_client_logos.sql
-- A "trusted by" client logo wall for the homepage, separate from press_logos
-- ("featured in"). Same shape and access model as press_logos: admin writes via
-- the service role, the public reads only active rows. Renders nothing until
-- cleared client logos are added through /admin.

CREATE TABLE IF NOT EXISTS client_logos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  storage_path TEXT,
  link_url TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

ALTER TABLE client_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON client_logos FOR SELECT USING (active = true);
