// Residual B prep: denormalize the practitioner's display name onto
// practitioner_profiles so public reads don't need to join users (which would
// expose practitioner emails). Adds column + backfill + sync triggers.
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(url, { prepare: false });

await sql.begin(async (tx) => {
  await tx.unsafe(`ALTER TABLE practitioner_profiles ADD COLUMN IF NOT EXISTS display_name text`);
  // Backfill from users.full_name
  await tx.unsafe(`
    UPDATE practitioner_profiles p SET display_name = u.full_name
    FROM users u WHERE u.id = p.user_id
      AND (p.display_name IS DISTINCT FROM u.full_name)`);

  // Keep it in sync: on profile insert, pull the name from users…
  await tx.unsafe(`
    CREATE OR REPLACE FUNCTION set_practitioner_display_name() RETURNS trigger
      LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
      BEGIN
        SELECT full_name INTO NEW.display_name FROM users WHERE id = NEW.user_id;
        RETURN NEW;
      END $$`);
  await tx.unsafe(`DROP TRIGGER IF EXISTS trg_set_display_name ON practitioner_profiles`);
  await tx.unsafe(`
    CREATE TRIGGER trg_set_display_name BEFORE INSERT ON practitioner_profiles
      FOR EACH ROW EXECUTE FUNCTION set_practitioner_display_name()`);

  // …and on users.full_name change, propagate to the profile.
  await tx.unsafe(`
    CREATE OR REPLACE FUNCTION sync_practitioner_display_name() RETURNS trigger
      LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog AS $$
      BEGIN
        UPDATE practitioner_profiles SET display_name = NEW.full_name WHERE user_id = NEW.id;
        RETURN NEW;
      END $$`);
  await tx.unsafe(`DROP TRIGGER IF EXISTS trg_sync_display_name ON users`);
  await tx.unsafe(`
    CREATE TRIGGER trg_sync_display_name AFTER UPDATE OF full_name ON users
      FOR EACH ROW WHEN (OLD.full_name IS DISTINCT FROM NEW.full_name)
      EXECUTE FUNCTION sync_practitioner_display_name()`);
});

const [{ n, filled }] = await sql`
  SELECT count(*)::int AS n, count(display_name)::int AS filled FROM practitioner_profiles`;
console.log(`✅ display_name added + triggers installed. ${filled}/${n} profiles have a name.`);
await sql.end();
