// Read-only: check for triggers on auth.users and the shape of public.users insert path.
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

console.log("=== triggers on auth.users ===");
console.table(await sql`
  SELECT t.tgname, p.proname AS function, n.nspname AS fn_schema
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace cn ON cn.oid = c.relnamespace
  JOIN pg_proc p ON p.oid = t.tgfoid
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE cn.nspname = 'auth' AND c.relname = 'users' AND NOT t.tgisinternal`);

console.log("=== functions that INSERT INTO public.users (handle_new_user etc.) ===");
const fns = await sql`
  SELECT n.nspname AS schema, p.proname AS name, pg_get_functiondef(p.oid) AS def
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE p.prokind = 'f' AND pg_get_functiondef(p.oid) ILIKE '%insert into public.users%'`;
for (const f of fns) {
  console.log(`\n--- ${f.schema}.${f.name} ---`);
  console.log(f.def);
}
if (!fns.length) console.log("(none found — no auto-insert into public.users)");

console.log("\n=== FK from public.users.id -> auth.users? ===");
console.table(await sql`
  SELECT conname, confrelid::regclass AS references, confdeltype AS on_delete
  FROM pg_constraint
  WHERE conrelid = 'public.users'::regclass AND contype = 'f'`);

await sql.end();
