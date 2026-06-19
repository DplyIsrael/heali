// EMERGENCY ROLLBACK: disable RLS on the core tables to instantly restore the
// app's behavior if a flow breaks after apply-rls-full.mjs. (Policies remain
// defined but inert; re-running apply-rls-full.mjs re-enables.)
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

const TABLES = [
  "users", "patient_profiles", "practitioner_profiles", "practitioner_documents",
  "practitioner_availability", "availability_blocks", "areas", "cities",
  "treatment_domains", "specialties", "categories", "bookings", "reviews",
  "articles", "treatment_packages", "favorites", "credits",
];

await sql.begin(async (tx) => {
  for (const t of TABLES) await tx.unsafe(`ALTER TABLE ${t} DISABLE ROW LEVEL SECURITY`);
});
console.log(`⚠️  RLS DISABLED on ${TABLES.length} tables (rollback). Re-run apply-rls-full.mjs to restore.`);
await sql.end();
