-- Seed data scraped from current site/index.html

INSERT INTO site_content (key, value) VALUES
  ('hero_headline', 'We''ve been quietly building the biggest moments in the room for 22 years.'),
  ('hero_subheadline', 'Visionary Sound Productions is a full-service event production company. Stage, lighting, sound, video, and the design sense to put them together. One call — you get the owner.'),
  ('hero_spotlight', '"Let''s Glow Crazy" — Brighton High School Homecoming · 1,500 students · full lighting, audio, rigging, FX'),
  ('hero_location_tag', 'Metro Detroit · Nationwide · Since 2004'),
  ('hero_bg_image', 'https://visionarysoundproductions.com/wp-content/uploads/2025/12/IMG_7277.jpeg'),
  ('stat_1_value', '4,247'),
  ('stat_1_label', 'Events serviced since 2004'),
  ('stat_2_value', '25'),
  ('stat_2_label', 'National publication features'),
  ('stat_3_value', '22yrs'),
  ('stat_3_label', 'Owner-operated, no middlemen'),
  ('stat_4_value', '50+'),
  ('stat_4_label', 'Clients we''ve worked with 10+ years'),
  ('footer_phone', '(248) 762-2898'),
  ('footer_email', 'Aaron@VisionarySoundProductions.com'),
  ('footer_address', 'Commerce Township, MI 48382'),
  ('footer_service_area', 'Metro Detroit · Midwest · Nationwide on request')
ON CONFLICT (key) DO NOTHING;

INSERT INTO services (letter, title, description, url, sort_order) VALUES
  ('A', 'Event Production', 'Full-stack design, stage, lighting, sound, and crew for corporate, school, and nonprofit events.', '/event-production', 1),
  ('B', 'Weddings', 'Décor lighting, dance floors, sound — the warm amber glow our clients keep writing us about.', '/weddings', 2),
  ('C', 'Mitzvahs', 'Personalized event design that brings their theme to life — from intimate to full production.', '/mitzvahs', 3),
  ('D', 'AV Installation', 'Permanent lighting, audio, and video systems for venues, theaters, schools, and houses of worship.', '/av-installation', 4),
  ('E', 'Rentals', 'Dry-hire of LED walls, line arrays, moving lights, staging, and DJ-grade gear. Delivered with options.', '/rentals', 5),
  ('F', 'Design & Advisory', 'Not sure where to start? Free consultation. We''ll scope it, sketch it, and tell you what you actually need.', '/event-production#design', 6);

INSERT INTO testimonials (quote, attribution_name, attribution_context, sort_order) VALUES
  ('Truly took our concert to a higher level. The lighting and sound design was top-notch.', 'Cantor Smolash', 'Temple Israel', 1),
  ('Thank you to you and your organization for the wonderful production. Everything was first-class.', 'Betsy DeVos', 'Private event', 2),
  ('We''ve used Visionary Sound Productions at BHS for four years. Reliable, creative, and they make every show better.', 'Bill M.', 'Brighton High School', 3),
  ('Thank you for the beautiful lighting you provided for my daughter''s wedding. Absolutely stunning.', 'Pamela', 'Farmington Hills, MI — Wedding', 4);

INSERT INTO press_logos (name, sort_order) VALUES
  ('PLSN Magazine', 1),
  ('Lighting&Sound America', 2),
  ('Mobile Beat', 3);
