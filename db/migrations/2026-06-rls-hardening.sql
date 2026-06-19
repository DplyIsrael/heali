-- 2026-06-19 — RLS hardening (PARTIAL, safe subset).
-- Applied to production via scripts/apply-rls-safe.mjs on 2026-06-19.
--
-- Context: a security audit found RLS DISABLED on 19/23 public tables and the
-- anon/authenticated roles holding full DML (incl. TRUNCATE) — i.e. the public
-- anon key could read all data and INSERT/UPDATE/DELETE/TRUNCATE every table.
--
-- This file is the SAFE subset that closes real holes WITHOUT breaking the app
-- (the app relies on RLS-off for cross-user `users` joins, availability reads,
-- credit writes, etc. — those require a code refactor before full RLS can be
-- enabled; see scripts/ and the audit report).
--
-- STILL OPEN after this migration: RLS on users, bookings, patient_profiles,
-- practitioner_profiles, practitioner_documents, credits, reviews, favorites,
-- articles, availability, taxonomy/geography tables. Tracked separately.

-- is_admin(): pin search_path (was unset — search_path-hijack surface).
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
  LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
    SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  $$;

-- Client-invoice PII (real third-party patient names/phones): owner + admin only.
ALTER TABLE practitioner_client_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pci_select_own ON practitioner_client_invoices;
CREATE POLICY pci_select_own ON practitioner_client_invoices FOR SELECT
  USING (practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS pci_admin_all ON practitioner_client_invoices;
CREATE POLICY pci_admin_all ON practitioner_client_invoices FOR ALL USING (is_admin());

ALTER TABLE practitioner_client_references ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pcr_select_own ON practitioner_client_references;
CREATE POLICY pcr_select_own ON practitioner_client_references FOR SELECT
  USING (practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS pcr_admin_all ON practitioner_client_references;
CREATE POLICY pcr_admin_all ON practitioner_client_references FOR ALL USING (is_admin());

-- refund_requests: was RLS-on with 0 policies (feature broken). Scope it.
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS refund_select_own ON refund_requests;
CREATE POLICY refund_select_own ON refund_requests FOR SELECT USING (patient_id = auth.uid());
DROP POLICY IF EXISTS refund_insert_own ON refund_requests;
CREATE POLICY refund_insert_own ON refund_requests FOR INSERT
  WITH CHECK (patient_id = auth.uid() AND status = 'pending');
DROP POLICY IF EXISTS refund_admin_all ON refund_requests;
CREATE POLICY refund_admin_all ON refund_requests FOR ALL USING (is_admin());

-- Remove RLS-bypassing privileges the app never uses.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
