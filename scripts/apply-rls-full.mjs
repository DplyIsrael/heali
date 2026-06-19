// Enables RLS + policies on the remaining core tables. Idempotent.
// Run ONLY after the rls-prep refactor is deployed live.
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

const ENABLE = [
  "users", "patient_profiles", "practitioner_profiles", "practitioner_documents",
  "practitioner_availability", "availability_blocks", "areas", "cities",
  "treatment_domains", "specialties", "categories", "bookings", "reviews",
  "articles", "treatment_packages", "favorites", "credits",
];

const own = (col) => `${col} = auth.uid()`;
const ownPrac = "practitioner_id IN (SELECT id FROM practitioner_profiles WHERE user_id = auth.uid())";

const POLICIES = [
  // users — NOTE: no public INSERT policy (registration/OAuth use service-role)
  ["users", "users_select_own", "FOR SELECT USING (id = auth.uid())"],
  ["users", "users_update_own", "FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid())"],
  ["users", "users_select_admin", "FOR SELECT USING (is_admin())"],
  ["users", "users_update_admin", "FOR UPDATE USING (is_admin())"],
  ["users", "users_select_practitioner_public",
    "FOR SELECT USING (id IN (SELECT user_id FROM practitioner_profiles WHERE is_publicly_visible = true AND verification_status = 'approved'))"],

  ["patient_profiles", "patient_profiles_select_own", `FOR SELECT USING (${own("user_id")})`],
  ["patient_profiles", "patient_profiles_update_own", `FOR UPDATE USING (${own("user_id")}) WITH CHECK (${own("user_id")})`],
  ["patient_profiles", "patient_profiles_insert_own", `FOR INSERT WITH CHECK (${own("user_id")})`],
  ["patient_profiles", "patient_profiles_select_admin", "FOR SELECT USING (is_admin())"],
  ["patient_profiles", "patient_profiles_update_admin", "FOR UPDATE USING (is_admin())"],

  ["practitioner_profiles", "practitioner_profiles_select_public",
    "FOR SELECT USING (is_publicly_visible = true AND verification_status = 'approved')"],
  ["practitioner_profiles", "practitioner_profiles_select_own", `FOR SELECT USING (${own("user_id")})`],
  ["practitioner_profiles", "practitioner_profiles_update_own", `FOR UPDATE USING (${own("user_id")}) WITH CHECK (${own("user_id")})`],
  ["practitioner_profiles", "practitioner_profiles_insert_own", `FOR INSERT WITH CHECK (${own("user_id")})`],
  ["practitioner_profiles", "practitioner_profiles_select_admin", "FOR SELECT USING (is_admin())"],
  ["practitioner_profiles", "practitioner_profiles_update_admin", "FOR UPDATE USING (is_admin())"],

  ["practitioner_documents", "practitioner_docs_select_own", `FOR SELECT USING (${ownPrac})`],
  ["practitioner_documents", "practitioner_docs_insert_own", `FOR INSERT WITH CHECK (${ownPrac})`],
  ["practitioner_documents", "practitioner_docs_delete_own", `FOR DELETE USING (${ownPrac})`],
  ["practitioner_documents", "practitioner_docs_select_admin", "FOR SELECT USING (is_admin())"],
  ["practitioner_documents", "practitioner_docs_update_admin", "FOR UPDATE USING (is_admin())"],

  ["practitioner_availability", "availability_select_public", "FOR SELECT USING (true)"],
  ["practitioner_availability", "availability_insert_own", `FOR INSERT WITH CHECK (${ownPrac})`],
  ["practitioner_availability", "availability_update_own", `FOR UPDATE USING (${ownPrac})`],
  ["practitioner_availability", "availability_delete_own", `FOR DELETE USING (${ownPrac})`],

  ["availability_blocks", "blocks_select_public", "FOR SELECT USING (true)"],
  ["availability_blocks", "blocks_insert_own", `FOR INSERT WITH CHECK (${ownPrac})`],
  ["availability_blocks", "blocks_delete_own", `FOR DELETE USING (${ownPrac})`],

  // public-read taxonomy/geography + admin manage
  ...["areas", "cities", "treatment_domains", "specialties", "categories", "treatment_packages"].flatMap((t) => [
    [t, `${t}_select_all`, "FOR SELECT USING (true)"],
    [t, `${t}_admin_all`, "FOR ALL USING (is_admin())"],
  ]),

  ["bookings", "bookings_select_patient", `FOR SELECT USING (${own("patient_id")})`],
  ["bookings", "bookings_insert_patient", `FOR INSERT WITH CHECK (${own("patient_id")})`],
  ["bookings", "bookings_update_patient", `FOR UPDATE USING (${own("patient_id")})`],
  ["bookings", "bookings_select_practitioner", `FOR SELECT USING (${ownPrac})`],
  ["bookings", "bookings_update_practitioner", `FOR UPDATE USING (${ownPrac})`],
  ["bookings", "bookings_admin_all", "FOR ALL USING (is_admin())"],

  ["reviews", "reviews_select_approved", "FOR SELECT USING (status = 'approved')"],
  ["reviews", "reviews_insert_own", "FOR INSERT WITH CHECK (booking_id IN (SELECT id FROM bookings WHERE patient_id = auth.uid()))"],
  ["reviews", "reviews_admin_all", "FOR ALL USING (is_admin())"],

  ["articles", "articles_select_approved", "FOR SELECT USING (status = 'approved')"],
  ["articles", "articles_select_own", `FOR SELECT USING (${own("author_id")})`],
  ["articles", "articles_insert_own", `FOR INSERT WITH CHECK (${own("author_id")})`],
  ["articles", "articles_update_own", "FOR UPDATE USING (author_id = auth.uid() AND status IN ('draft','submitted'))"],
  ["articles", "articles_delete_own", `FOR DELETE USING (${own("author_id")})`],
  ["articles", "articles_admin_all", "FOR ALL USING (is_admin())"],

  ["favorites", "favorites_select_own", `FOR SELECT USING (${own("patient_id")})`],
  ["favorites", "favorites_insert_own", `FOR INSERT WITH CHECK (${own("patient_id")})`],
  ["favorites", "favorites_delete_own", `FOR DELETE USING (${own("patient_id")})`],
  ["favorites", "favorites_admin_all", "FOR ALL USING (is_admin())"],

  // credits: patient reads own; ALL writes go through service-role.
  ["credits", "credits_select_own", `FOR SELECT USING (${own("patient_id")})`],
  ["credits", "credits_admin_all", "FOR ALL USING (is_admin())"],
];

await sql.begin(async (tx) => {
  for (const t of ENABLE) await tx.unsafe(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY`);
  for (const [t, name, def] of POLICIES) {
    await tx.unsafe(`DROP POLICY IF EXISTS "${name}" ON ${t}`);
    await tx.unsafe(`CREATE POLICY "${name}" ON ${t} ${def}`);
  }
  // Prevent role/blocked self-escalation: replace table-level UPDATE on users with
  // column-level UPDATE on the safe columns only (role & is_blocked excluded).
  await tx.unsafe(`REVOKE UPDATE ON users FROM anon, authenticated`);
  await tx.unsafe(`GRANT UPDATE (email, full_name, onboarding_completed, profile_photo_url, terms_accepted_at, updated_at) ON users TO anon, authenticated`);
});

console.log(`✅ RLS enabled on ${ENABLE.length} tables; ${POLICIES.length} policies applied.`);
await sql.end();
