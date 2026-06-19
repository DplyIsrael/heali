-- 2026-06-19 — Close the two RLS residuals from the full rollout.
-- Applied to production via scripts/ (create-bank-table, add-display-name,
-- finalize-rls-residuals) AFTER the app was switched to the new sources.
--
-- Residual A: practitioner bank_* lived on the public-readable practitioner_profiles
--   → anon could read bank details once a real practitioner entered them.
-- Residual B: the users_select_practitioner_public policy exposed approved-practitioner
--   user rows (incl. email) to the anon key for the discovery name join.

-- ── A: bank details to an admin/service-role-only table ──
CREATE TABLE IF NOT EXISTS practitioner_bank_details (
  practitioner_id uuid PRIMARY KEY REFERENCES practitioner_profiles(id) ON DELETE CASCADE,
  bank_name text, bank_account_number text, bank_branch_number text, bank_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE practitioner_bank_details ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON practitioner_bank_details FROM anon, authenticated;
GRANT ALL ON practitioner_bank_details TO service_role;
CREATE POLICY bank_admin_all ON practitioner_bank_details FOR ALL USING (is_admin());
-- (backfill from practitioner_profiles, then:)
ALTER TABLE practitioner_profiles
  DROP COLUMN bank_name, DROP COLUMN bank_account_number,
  DROP COLUMN bank_branch_number, DROP COLUMN bank_number;

-- ── B: denormalize the practitioner name, drop the users-exposing policy ──
ALTER TABLE practitioner_profiles ADD COLUMN display_name text;  -- backfilled from users.full_name
-- BEFORE INSERT on practitioner_profiles: pull display_name from users.
-- AFTER UPDATE OF full_name on users: propagate to practitioner_profiles.display_name.
--   (see set_practitioner_display_name() / sync_practitioner_display_name() + triggers)
DROP POLICY users_select_practitioner_public ON users;  -- anon no longer reads users at all

-- Result (verified): anon reads 0 users; practitioner_bank_details blocked to anon;
-- discovery still works via practitioner_profiles.display_name.
