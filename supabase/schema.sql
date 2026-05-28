-- VSP Website Database Schema
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  letter TEXT,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  category TEXT NOT NULL,
  event_tags TEXT[] NOT NULL DEFAULT '{}',
  title TEXT,
  caption TEXT,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote TEXT NOT NULL,
  attribution_name TEXT,
  attribution_context TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  date DATE,
  category_tag TEXT,
  cover_image_url TEXT,
  cover_storage_path TEXT,
  body_html TEXT,
  excerpt TEXT,
  read_time_minutes INT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT,
  services_needed TEXT[],
  event_date DATE,
  date_flexible BOOLEAN DEFAULT FALSE,
  headcount TEXT,
  venue_city TEXT,
  budget_range TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_contact TEXT,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS press_logos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  storage_path TEXT,
  link_url TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_logos ENABLE ROW LEVEL SECURITY;

-- Public read policies (anon role)
CREATE POLICY "public_read" ON site_content FOR SELECT USING (true);
CREATE POLICY "public_read" ON services FOR SELECT USING (active = true);
CREATE POLICY "public_read" ON gallery_photos FOR SELECT USING (active = true);
CREATE POLICY "public_read" ON testimonials FOR SELECT USING (active = true);
CREATE POLICY "public_read" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "public_read" ON press_logos FOR SELECT USING (active = true);

-- contact_submissions: anon can INSERT (for the form), not SELECT
CREATE POLICY "anon_insert" ON contact_submissions FOR INSERT WITH CHECK (true);
