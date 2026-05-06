-- Pending schema changes that need to be applied to Supabase before the
-- corresponding code paths will work in production.
--
-- How to run:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this entire file and click Run
--
-- Both statements are idempotent — safe to re-run.

-- 1. New table: stores the 5 client invoices uploaded during onboarding
--    step 5 (חשבוניות טיפול של לקוחות). One row per slot (slot_index 0-4).
CREATE TABLE IF NOT EXISTS practitioner_client_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES practitioner_profiles(id) ON DELETE CASCADE,
  slot_index integer NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- 2. New column on practitioner_profiles for the bio step's
--    "תיאור הסמכה" textarea, which is now mandatory in onboarding.
ALTER TABLE practitioner_profiles
  ADD COLUMN IF NOT EXISTS certification_description text;
