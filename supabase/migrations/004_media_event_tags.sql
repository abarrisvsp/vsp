-- 004_media_event_tags.sql
-- Adds multi-value event-type tagging to gallery photos.
-- The admin Media Library writes these; the public /gallery filters by them.
-- A photo can carry several tags (e.g. a gala that is also corporate).

ALTER TABLE gallery_photos
  ADD COLUMN IF NOT EXISTS event_tags TEXT[] NOT NULL DEFAULT '{}';

-- Backfill: seed each existing photo's single free-text category as its first tag
-- so nothing currently on the public gallery loses its filter.
UPDATE gallery_photos
SET event_tags = ARRAY[category]
WHERE (event_tags IS NULL OR array_length(event_tags, 1) IS NULL)
  AND category IS NOT NULL
  AND category <> '';

-- Speeds up the Media Library's lookup of "is this file published, and how is it tagged?"
CREATE INDEX IF NOT EXISTS gallery_photos_storage_path_idx
  ON gallery_photos (storage_path);
