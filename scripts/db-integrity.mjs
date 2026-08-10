// Read-only DB integrity audit: RLS coverage, FK orphans, array-ref integrity,
// auth sync, duplicates. Deletes/changes nothing.
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

console.log("=== RLS status per public table (relrowsecurity + policy count) ===");
console.table(await sql`
  SELECT c.relname AS "table",
         c.relrowsecurity AS rls_on,
         (SELECT count(*)::int FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname) AS policies,
         (SELECT count(*)::int FROM pg_class cc WHERE cc.oid=c.oid)  -- noop keep
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r'
  ORDER BY c.relrowsecurity ASC, c.relname`);

console.log("\n=== Tables with RLS OFF or ZERO policies (high-risk) ===");
console.table(await sql`
  SELECT c.relname AS "table", c.relrowsecurity AS rls_on,
         (SELECT count(*)::int FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname) AS policies
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r'
    AND (c.relrowsecurity=false OR (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname)=0)
  ORDER BY c.relname`);

// FK orphan check (auto-enumerate every FK)
const fks = await sql`
  SELECT tc.table_name, kcu.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_col
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name=tc.constraint_name AND kcu.table_schema=tc.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name=tc.constraint_name AND ccu.table_schema=tc.table_schema
  WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public'
  ORDER BY tc.table_name`;
console.log(`\n=== FK orphan scan (${fks.length} foreign keys) ===`);
const orphans = [];
for (const fk of fks) {
  const [{ n }] = await sql.unsafe(
    `SELECT count(*)::int AS n FROM public.${fk.table_name} c
     WHERE c.${fk.column_name} IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM public.${fk.ref_table} p WHERE p.${fk.ref_col}=c.${fk.column_name})`
  );
  if (n > 0) orphans.push({ fk: `${fk.table_name}.${fk.column_name} → ${fk.ref_table}.${fk.ref_col}`, orphans: n });
}
console.table(orphans.length ? orphans : [{ fk: "(none)", orphans: 0 }]);

console.log("\n=== Array-ref integrity (domain_ids / specialty_ids) ===");
console.table(await sql`
  SELECT
    (SELECT count(*)::int FROM practitioner_profiles p WHERE EXISTS (
        SELECT 1 FROM unnest(p.domain_ids) x WHERE x NOT IN (SELECT id FROM treatment_domains))) AS bad_domain_refs,
    (SELECT count(*)::int FROM practitioner_profiles p WHERE EXISTS (
        SELECT 1 FROM unnest(p.specialty_ids) x WHERE x NOT IN (SELECT id FROM specialties))) AS bad_specialty_refs`);

console.log("\n=== public.users <-> auth.users sync ===");
console.table(await sql`
  SELECT
    (SELECT count(*)::int FROM public.users u WHERE NOT EXISTS (SELECT 1 FROM auth.users a WHERE a.id=u.id)) AS public_without_auth,
    (SELECT count(*)::int FROM auth.users a WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id=a.id)) AS auth_without_public`);

console.log("\n=== Duplicate checks ===");
console.table(await sql`
  SELECT 'dup user emails (ci)' AS check, count(*)::int AS groups FROM (SELECT lower(email) e FROM users GROUP BY 1 HAVING count(*)>1) z
  UNION ALL SELECT 'dup favorites', count(*)::int FROM (SELECT patient_id,practitioner_id FROM favorites GROUP BY 1,2 HAVING count(*)>1) z
  UNION ALL SELECT 'dup availability', count(*)::int FROM (SELECT practitioner_id,weekday,start_time FROM practitioner_availability GROUP BY 1,2,3 HAVING count(*)>1) z
  UNION ALL SELECT 'practitioner_profiles per user >1', count(*)::int FROM (SELECT user_id FROM practitioner_profiles GROUP BY 1 HAVING count(*)>1) z`);

await sql.end();
