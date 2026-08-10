// Read-only: verify schema-vs-live-DB drift items the audit flagged.
import { readFileSync } from "node:fs";
import postgres from "postgres";
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

console.log("=== practitioner_profiles columns present in LIVE DB (drift check) ===");
const cols = (await sql`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema='public' AND table_name='practitioner_profiles' ORDER BY column_name`).map(r => r.column_name);
const expect = ["clinic_cities","clinic_addresses","home_visits","qr_code_url","agreement_signed_at",
  "onboarding_step","is_publicly_visible","average_rating","total_reviews","rejection_reason",
  "bank_account_number","certification_description"];
console.table(expect.map(c => ({ column: c, exists_in_prod: cols.includes(c) })));

console.log("\n=== payment_status enum values in LIVE DB ===");
const vals = (await sql`
  SELECT e.enumlabel AS v FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid
  WHERE t.typname='payment_status' ORDER BY e.enumsortorder`).map(r => r.v);
console.log("present:", vals.join(", "));
for (const need of ["tokenized","charged","failed","refunded","credited"])
  console.log(`  ${need}: ${vals.includes(need) ? "OK" : "*** MISSING ***"}`);

console.log("\n=== is_admin() function present + search_path pinned? ===");
const fn = await sql`
  SELECT p.proname, p.prosecdef AS security_definer, p.proconfig AS config
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname IN ('is_admin')`;
console.table(fn.length ? fn : [{ proname: "(is_admin MISSING)", security_definer: null, config: null }]);

await sql.end();
