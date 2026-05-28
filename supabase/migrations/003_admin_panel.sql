-- supabase/migrations/003_admin_panel.sql

-- ─── New tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS seo_settings (
  route             TEXT PRIMARY KEY,
  meta_title        TEXT,
  meta_description  TEXT,
  og_image_url      TEXT,
  og_storage_path   TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nav_items (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label      TEXT NOT NULL,
  href       TEXT NOT NULL,
  sort_order INT  DEFAULT 0,
  visible    BOOLEAN DEFAULT TRUE,
  is_custom  BOOLEAN DEFAULT FALSE,
  UNIQUE (label, href)
);

CREATE TABLE IF NOT EXISTS faqs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page       TEXT NOT NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INT  DEFAULT 0,
  active     BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS featured_work (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug               TEXT UNIQUE NOT NULL,
  headline           TEXT NOT NULL,
  event_type         TEXT,
  client_name        TEXT,
  venue              TEXT,
  event_date         DATE,
  guest_count        INT,
  cover_image_url    TEXT,
  cover_storage_path TEXT,
  body_html          TEXT,
  gallery_photo_ids  UUID[] DEFAULT '{}',
  sort_order         INT DEFAULT 0,
  published          BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Additions to existing tables ────────────────────────────

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at          TIMESTAMPTZ;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS email_subscribers     BOOLEAN DEFAULT TRUE;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS subscribers_emailed_at TIMESTAMPTZ;

-- ─── RLS ─────────────────────────────────────────────────────

ALTER TABLE seo_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_work ENABLE ROW LEVEL SECURITY;

-- Public read (anon key)
CREATE POLICY IF NOT EXISTS "public_read" ON seo_settings  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read" ON nav_items     FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_read" ON faqs          FOR SELECT USING (active = true);
CREATE POLICY IF NOT EXISTS "public_read" ON featured_work FOR SELECT USING (published = true);

-- ─── Seed: default nav (so site never shows a blank nav) ─────

INSERT INTO nav_items (label, href, sort_order, visible, is_custom) VALUES
  ('Home',     '/',         0, TRUE, FALSE),
  ('Services', 'dropdown',  1, TRUE, FALSE),
  ('Gallery',  '/gallery',  2, TRUE, FALSE),
  ('Journal',  '/blog',     3, TRUE, FALSE),
  ('About',    '/about',    4, TRUE, FALSE),
  ('Contact',  '/contact',  5, TRUE, FALSE)
ON CONFLICT (label, href) DO NOTHING;

-- ─── Seed: site_content keys for banner + newsletter ─────────

INSERT INTO site_content (key, value) VALUES
  ('banner_active',              'false'),
  ('banner_message',             ''),
  ('banner_color',               '#ef4444'),
  ('banner_hide_after',          ''),
  ('social_instagram',           ''),
  ('social_facebook',            ''),
  ('social_youtube',             ''),
  ('social_tiktok',              ''),
  ('newsletter_headline',        'Stay in the loop'),
  ('newsletter_subtext',         'Event tips & VSP updates, no spam.'),
  ('newsletter_show_homepage',   'true'),
  ('newsletter_show_blog',       'false')
ON CONFLICT (key) DO NOTHING;
