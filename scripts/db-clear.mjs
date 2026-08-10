// Clears all app data, keeping ONLY the admin account (public + auth).
// Transactional: all-or-nothing. Run: node scripts/db-clear.mjs
import { readFileSync } from "node:fs";
import postgres from "postgres";

const KEEP_EMAIL = "admin@heali.co.il";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
if (!url) throw new Error("DATABASE_URL not found in .env.local");

const sql = postgres(url, { prepare: false });

// Safety: confirm the admin we intend to keep actually exists.
const [admin] = await sql`SELECT id, role FROM public.users WHERE email = ${KEEP_EMAIL}`;
if (!admin) throw new Error(`Refusing to run: keep-account ${KEEP_EMAIL} not found in public.users`);
if (admin.role !== "admin") console.warn(`⚠️  ${KEEP_EMAIL} has role '${admin.role}', not 'admin' — keeping anyway.`);

// Every public BASE TABLE except users.
const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> 'users'
  ORDER BY table_name`;
const list = tables.map((t) => `public.${t.table_name}`).join(", ");

console.log(`Keeping admin: ${KEEP_EMAIL} (${admin.id})`);
console.log(`Truncating ${tables.length} tables, then deleting all other users...\n`);

await sql.begin(async (tx) => {
  await tx.unsafe(`TRUNCATE ${list} RESTART IDENTITY CASCADE`);
  // public.users child first, then auth.users parent (avoids FK violation if one exists).
  const delPublic = await tx`DELETE FROM public.users WHERE email <> ${KEEP_EMAIL}`;
  const delAuth = await tx`DELETE FROM auth.users WHERE email <> ${KEEP_EMAIL}`;
  console.log(`Deleted ${delPublic.count} public.users, ${delAuth.count} auth.users (non-admin).`);
});

// Verify final state.
console.log("\n=== Remaining row counts ===");
const all = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`;
const rows = [];
for (const { table_name } of all) {
  const [{ count }] = await sql.unsafe(`SELECT count(*)::int AS count FROM public.${table_name}`);
  if (count > 0) rows.push({ table: table_name, rows: count });
}
console.table(rows.length ? rows : [{ table: "(all empty)", rows: 0 }]);
const [{ count: authCount }] = await sql`SELECT count(*)::int AS count FROM auth.users`;
console.log(`auth.users remaining: ${authCount}`);

await sql.end();
console.log("\n✅ Clear complete.");
