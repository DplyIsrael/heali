-- Multi-clinic addresses + home-visit flag on practitioner_profiles.
-- These columns exist in the Drizzle schema (db/schema/practitioners.ts, added
-- with the multi-clinic feature) but were never pushed to the database, so the
-- practitioner signup INSERT failed with:
--   "Could not find the 'clinic_addresses' column ... in the schema cache"
-- which (with no rollback) orphaned the auth user and surfaced downstream as
-- "email already registered". Idempotent + additive.
ALTER TABLE public.practitioner_profiles
  ADD COLUMN IF NOT EXISTS clinic_addresses text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS home_visits boolean NOT NULL DEFAULT false;
