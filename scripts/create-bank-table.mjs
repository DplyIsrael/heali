// Residual A: move practitioner bank details to an admin/service-role-only table.
// Creates the table + RLS + backfill. (Old columns dropped separately AFTER the
// app is switched over — see drop-bank-columns.mjs.)
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

await sql.begin(async (tx) => {
  await tx.unsafe(`
    CREATE TABLE IF NOT EXISTS practitioner_bank_details (
      practitioner_id uuid PRIMARY KEY REFERENCES practitioner_profiles(id) ON DELETE CASCADE,
      bank_name text,
      bank_account_number text,
      bank_branch_number text,
      bank_number text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
  // Service-role only: no anon/authenticated access at all; admin via policy.
  await tx.unsafe(`ALTER TABLE practitioner_bank_details ENABLE ROW LEVEL SECURITY`);
  await tx.unsafe(`REVOKE ALL ON practitioner_bank_details FROM anon, authenticated`);
  await tx.unsafe(`GRANT ALL ON practitioner_bank_details TO service_role`);
  await tx.unsafe(`DROP POLICY IF EXISTS bank_admin_all ON practitioner_bank_details`);
  await tx.unsafe(`CREATE POLICY bank_admin_all ON practitioner_bank_details FOR ALL USING (is_admin())`);
  // Backfill any existing bank data off practitioner_profiles.
  await tx.unsafe(`
    INSERT INTO practitioner_bank_details (practitioner_id, bank_name, bank_account_number, bank_branch_number, bank_number)
    SELECT id, bank_name, bank_account_number, bank_branch_number, bank_number
    FROM practitioner_profiles
    WHERE bank_name IS NOT NULL OR bank_account_number IS NOT NULL
       OR bank_branch_number IS NOT NULL OR bank_number IS NOT NULL
    ON CONFLICT (practitioner_id) DO NOTHING`);
});

const [{ n }] = await sql`SELECT count(*)::int AS n FROM practitioner_bank_details`;
console.log(`✅ practitioner_bank_details created (RLS on, service-role only). Backfilled ${n} rows.`);
await sql.end();
