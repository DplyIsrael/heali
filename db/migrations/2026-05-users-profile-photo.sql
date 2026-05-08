-- Add profile_photo_url to users so all roles (incl. admins, who don't
-- have a dedicated *_profiles row) can have an avatar.
-- Idempotent.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_photo_url text;
