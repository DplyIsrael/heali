// Applies the SAFE subset of RLS hardening that does NOT break the app:
//  - Enable RLS + owner/admin policies on the two client-PII tables (writes are
//    service-role; reads are owner/admin only) — closes a confirmed PII leak.
//  - Add refund_requests policies (table is already RLS-on with 0 policies, so the
//    feature is currently broken; this scopes + un-breaks it).
//  - Pin is_admin() search_path.
//  - Revoke TRUNCATE/TRIGGER/REFERENCES from anon/authenticated.
// Does NOT enable RLS on users/bookings/profiles/etc. (that needs the app refactor).
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

const stmts = [
  // is_admin with pinned search_path (F5)
  `CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
     LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
       SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
     $$`,

  // practitioner_client_invoices (F2)
  `ALTER TABLE practitioner_client_invoices ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS pci_select_own ON practitioner_client_invoices`,
  `CREATE POLICY pci_select_own ON practitioner_client_invoices FOR SELECT
     USING (practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid()))`,
  `DROP POLICY IF EXISTS pci_admin_all ON practitioner_client_invoices`,
  `CREATE POLICY pci_admin_all ON practitioner_client_invoices FOR ALL USING (is_admin())`,

  // practitioner_client_references (F2)
  `ALTER TABLE practitioner_client_references ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS pcr_select_own ON practitioner_client_references`,
  `CREATE POLICY pcr_select_own ON practitioner_client_references FOR SELECT
     USING (practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid()))`,
  `DROP POLICY IF EXISTS pcr_admin_all ON practitioner_client_references`,
  `CREATE POLICY pcr_admin_all ON practitioner_client_references FOR ALL USING (is_admin())`,

  // refund_requests (F1 / H9) — already RLS-on, 0 policies => add scoped policies
  `ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS refund_select_own ON refund_requests`,
  `CREATE POLICY refund_select_own ON refund_requests FOR SELECT USING (patient_id = auth.uid())`,
  `DROP POLICY IF EXISTS refund_insert_own ON refund_requests`,
  `CREATE POLICY refund_insert_own ON refund_requests FOR INSERT
     WITH CHECK (patient_id = auth.uid() AND status = 'pending')`,
  `DROP POLICY IF EXISTS refund_admin_all ON refund_requests`,
  `CREATE POLICY refund_admin_all ON refund_requests FOR ALL USING (is_admin())`,

  // Kill the TRUNCATE-wipe vector (RLS-bypassing). App never uses these privileges.
  `REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon, authenticated`,
];

await sql.begin(async (tx) => {
  for (const s of stmts) await tx.unsafe(s);
});
console.log(`✅ Applied ${stmts.length} statements.`);
await sql.end();
