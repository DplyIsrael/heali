// Residuals A & B finalization — run ONLY after the app deploy that switched
// bank reads to practitioner_bank_details and public reads to display_name is LIVE.
//   A: drop the bank_* columns off the public-readable practitioner_profiles.
//   B: drop the policy that exposed approved-practitioner user rows (incl email).
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

await sql.begin(async (tx) => {
  // A: remove bank columns from the public table (data already moved).
  for (const c of ["bank_name", "bank_account_number", "bank_branch_number", "bank_number"]) {
    await tx.unsafe(`ALTER TABLE practitioner_profiles DROP COLUMN IF EXISTS ${c}`);
  }
  // B: anon no longer needs to read practitioner user rows (uses display_name).
  await tx.unsafe(`DROP POLICY IF EXISTS users_select_practitioner_public ON users`);
});

console.log("✅ Dropped bank_* columns from practitioner_profiles and the users_select_practitioner_public policy.");
await sql.end();
