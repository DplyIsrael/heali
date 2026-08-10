// Read-only verification of the practitioner import. Mirrors the discovery read path.
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

console.log("=== counts ===");
console.table(await sql`
  SELECT 'users (total)' AS k, count(*)::int AS n FROM users
  UNION ALL SELECT 'users practitioners', count(*)::int FROM users WHERE role='practitioner'
  UNION ALL SELECT 'users blocked', count(*)::int FROM users WHERE is_blocked
  UNION ALL SELECT 'auth.users', count(*)::int FROM auth.users
  UNION ALL SELECT 'practitioner_profiles', count(*)::int FROM practitioner_profiles
  UNION ALL SELECT 'treatment_domains', count(*)::int FROM treatment_domains
  UNION ALL SELECT 'specialties', count(*)::int FROM specialties
  UNION ALL SELECT 'availability slots', count(*)::int FROM practitioner_availability
  UNION ALL SELECT 'discovery-visible', count(*)::int FROM practitioner_profiles WHERE verification_status='approved' AND is_publicly_visible=true`);

console.log("\n=== integrity checks ===");
const [chk] = await sql`
  SELECT
    (SELECT count(*)::int FROM practitioner_profiles WHERE array_length(domain_ids,1) IS NULL) AS profiles_without_domain,
    (SELECT count(*)::int FROM practitioner_profiles p WHERE EXISTS (
        SELECT 1 FROM unnest(p.domain_ids) did WHERE did NOT IN (SELECT id FROM treatment_domains))) AS dangling_domain_ref,
    (SELECT count(*)::int FROM practitioner_profiles p WHERE EXISTS (
        SELECT 1 FROM unnest(p.specialty_ids) sid WHERE sid NOT IN (SELECT id FROM specialties))) AS dangling_specialty_ref,
    (SELECT count(*)::int FROM practitioner_profiles WHERE bio IS NULL OR bio='') AS empty_bio,
    (SELECT count(*)::int FROM practitioner_profiles WHERE price='0' OR price IS NULL) AS zero_price`;
console.table([chk]);

console.log("\n=== top 5 by rating (discovery read path, domain IDs → names) ===");
console.table(await sql`
  SELECT u.full_name, p.area, p.city,
         (SELECT string_agg(d.name, ', ') FROM treatment_domains d WHERE d.id = ANY(p.domain_ids)) AS domains,
         array_length(p.specialty_ids,1) AS n_spec,
         p.price, p.average_rating AS rating, p.total_reviews AS reviews,
         array_to_string(p.languages, ', ') AS languages
  FROM practitioner_profiles p JOIN users u ON u.id = p.user_id
  WHERE p.verification_status='approved' AND p.is_publicly_visible=true
  ORDER BY p.average_rating DESC LIMIT 5`);

console.log("\n=== spot-check: anat.levi (ענת לוי) ===");
console.table(await sql`
  SELECT u.full_name, u.email, u.is_blocked, p.verification_status, p.is_publicly_visible,
         (SELECT string_agg(d.name, ', ') FROM treatment_domains d WHERE d.id = ANY(p.domain_ids)) AS domains,
         (SELECT string_agg(s.name, ', ') FROM specialties s WHERE s.id = ANY(p.specialty_ids)) AS specialties,
         p.city, p.area, p.price, array_to_string(p.languages,', ') AS languages, p.created_at::date AS joined, p.bio
  FROM practitioner_profiles p JOIN users u ON u.id = p.user_id WHERE u.email='anat.levi@hotmail.com'`);

console.log("\n=== distinct cities available in the discovery filter ===");
const cities = (await sql`SELECT DISTINCT city FROM practitioner_profiles WHERE verification_status='approved' AND is_publicly_visible=true AND city IS NOT NULL ORDER BY city`).map((r) => r.city);
console.log(`${cities.length} cities: ${cities.join(", ")}`);

await sql.end();
