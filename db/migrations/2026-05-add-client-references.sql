-- Pending schema change for the new onboarding step "המלצות של לקוחות"
-- (client testimonials / references). 5 rows per practitioner, slot_index 0-4.
--
-- How to run:
--   1. Open Supabase Dashboard → SQL Editor
--   2. Paste this entire file and click Run
--
-- Idempotent — safe to re-run.

CREATE TABLE IF NOT EXISTS practitioner_client_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES practitioner_profiles(id) ON DELETE CASCADE,
  slot_index integer NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
