// AUTHORIZED security verification (owner requested audit). READ-ONLY.
// Proves whether the PUBLIC anon key can read protected tables (RLS off => breach).
// PII values are REDACTED — only readability + row counts + column names are shown.
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const getEnv = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const URL_ = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const ANON = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const DB = getEnv("DATABASE_URL");

// 1) Anon-key read test (simulates anyone with the public browser key)
const anon = createClient(URL_, ANON, { auth: { persistSession: false } });
const targets = [
  ["users", "id,email,role"],
  ["patient_profiles", "user_id,phone,date_of_birth,gender"],
  ["bookings", "id,patient_id,price_at_booking,payment_status"],
  ["credits", "id,patient_id,amount"],
  ["practitioner_profiles", "id,bank_account_number,bank_number"],
  ["practitioner_client_invoices", "client_name,client_phone"],
  ["practitioner_client_references", "client_name,client_phone"],
];
console.log("=== ANON-KEY READ TEST (public key, no login) — can it read protected tables? ===");
for (const [t, cols] of targets) {
  const { data, error, count } = await anon.from(t).select(cols, { count: "exact" }).limit(1);
  if (error) console.log(`  ${t.padEnd(32)} BLOCKED  (${error.code ?? ""} ${error.message})`);
  else console.log(`  ${t.padEnd(32)} ⚠️ READABLE — ${count} rows exposed; columns: [${Object.keys(data?.[0] ?? {}).join(", ")}]`);
}

// 2) Grants to anon/authenticated on sensitive tables (write exposure, no mutation performed)
const sql = postgres(DB, { prepare: false });
console.log("\n=== GRANTS to anon/authenticated (does config permit writes?) ===");
console.table(await sql`
  SELECT table_name, grantee,
         string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
  FROM information_schema.role_table_grants
  WHERE table_schema='public' AND grantee IN ('anon','authenticated')
    AND table_name IN ('users','bookings','patient_profiles','credits','practitioner_profiles')
  GROUP BY table_name, grantee ORDER BY table_name, grantee`);

await sql.end();
