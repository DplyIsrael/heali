// Verifies the full RLS rollout: breach closed AND public/own app reads still work.
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const g = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const anon = createClient(g("NEXT_PUBLIC_SUPABASE_URL"), g("NEXT_PUBLIC_SUPABASE_ANON_KEY"), { auth: { persistSession: false } });
const sql = postgres(g("DATABASE_URL"), { prepare: false });

const [{ totalUsers }] = await sql`SELECT count(*)::int AS "totalUsers" FROM users`;
const [{ totalProfiles }] = await sql`SELECT count(*)::int AS "totalProfiles" FROM practitioner_profiles`;
const [{ approved }] = await sql`SELECT count(*)::int AS approved FROM practitioner_profiles WHERE verification_status='approved' AND is_publicly_visible=true`;

console.log("=== BREACH CLOSED? anon reads (no login) ===");
async function readCount(t, sel = "*") {
  const { data, error, count } = await anon.from(t).select(sel, { count: "exact" }).limit(1);
  return error ? `BLOCKED (${error.code})` : `${count} rows readable`;
}
console.log(`  users:                  ${await readCount("users", "id,email,role")}   (DB has ${totalUsers}; expect only approved practitioners ≈ ${approved}, NOT patients/admin)`);
console.log(`  practitioner_profiles:  ${await readCount("practitioner_profiles", "id")}   (DB has ${totalProfiles}; expect ${approved})`);
console.log(`  patient_profiles:       ${await readCount("patient_profiles", "user_id")}   (expect BLOCKED/0)`);
console.log(`  bookings:               ${await readCount("bookings", "id")}   (expect 0)`);
console.log(`  credits:                ${await readCount("credits", "id")}   (expect 0)`);

// Is the admin/any patient leaked via the practitioner-public policy?
const { data: leak } = await anon.from("users").select("email,role").neq("role", "practitioner").limit(5);
console.log(`  non-practitioner users visible to anon: ${leak?.length ?? 0} (expect 0)`);

console.log("\n=== APP STILL WORKS? public reads ===");
const disc = await anon.from("practitioner_profiles")
  .select("id, price, users!inner(full_name)")
  .eq("verification_status", "approved").eq("is_publicly_visible", true).limit(3);
console.log(`  discovery (profiles + name join): ${disc.error ? "BROKEN: " + disc.error.message : `OK — ${disc.data.length} practitioners, sample name="${disc.data?.[0]?.users?.full_name ?? "?"}"`}`);
console.log(`  treatment_domains (public):       ${await readCount("treatment_domains", "id")}`);
console.log(`  practitioner_availability (pub):  ${await readCount("practitioner_availability", "id")}`);

console.log("\n=== SELF-ESCALATION blocked? ===");
// Safe: target a non-existent id so nothing changes even if (wrongly) permitted.
const esc = await anon.from("users").update({ role: "admin" }).eq("id", "00000000-0000-0000-0000-000000000000");
console.log(`  anon UPDATE users.role: ${esc.error ? `BLOCKED (${esc.error.code} ${esc.error.message})` : "⚠️ PERMITTED — BAD"}`);

await sql.end();
