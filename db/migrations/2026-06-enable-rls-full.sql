-- 2026-06-19 — Enable RLS on the remaining core tables (the full rollout).
-- Applied to production via scripts/apply-rls-full.mjs AFTER deploying the
-- rls-prep refactor (commit 9e7708d/9ba6485) that routes cross-user reads/writes
-- through the service-role client. Rollback: scripts/disable-rls.mjs.
-- Verified by scripts/verify-rls-final.mjs (breach closed + discovery/own reads OK).
--
-- This file documents the applied DDL. The authoritative, idempotent runner with
-- the full 61-policy set is scripts/apply-rls-full.mjs.

-- Enable RLS on the 17 tables that were still unprotected:
ALTER TABLE users                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE practitioner_availability  ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_domains          ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties                ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_packages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits                    ENABLE ROW LEVEL SECURITY;

-- Policies (61 total) — owner/public/admin scoping per table. See the runner for
-- the full set. Key deviations from db/rls-policies.sql:
--  * users: NO public INSERT policy (registration/OAuth use service-role);
--    added users_select_practitioner_public so the public discovery join to
--    users.full_name works for approved+visible practitioners only.
--  * articles: added articles_delete_own (authors can delete their own).
--  * credits: SELECT own + admin only — ALL writes go through service-role.

-- Block role/blocked self-escalation: replace table-level UPDATE on users with
-- column-level UPDATE on the safe columns only.
REVOKE UPDATE ON users FROM anon, authenticated;
GRANT UPDATE (email, full_name, onboarding_completed, profile_photo_url, terms_accepted_at, updated_at)
  ON users TO anon, authenticated;

-- RESIDUAL (follow-up, not closed here):
--  * practitioner bank_* columns live on practitioner_profiles, which is
--    publicly readable for approved+visible practitioners → bank details are
--    readable by anon once a real practitioner enters them. Move bank columns to
--    a separate admin-only table (or a view that omits them). See audit F4.
--  * practitioner emails are exposed to anon via users_select_practitioner_public
--    (needed for the discovery name join; RLS can't restrict columns). Consider a
--    public-safe view.
