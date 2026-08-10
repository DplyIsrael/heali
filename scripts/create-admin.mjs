// scripts/create-admin.mjs (DEV/OPS — creates or resets the admin account)
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomBytes } from "node:crypto";
const __dirname = dirname(fileURLToPath(import.meta.url));
const dotenv = (await import("dotenv")).default;
dotenv.config({ path: resolve(__dirname, "..", ".env.local") });
const { createClient } = await import("@supabase/supabase-js");

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const EMAIL = "admin@heali.co.il";
const FULL_NAME = "Heali Admin";
// Strong, typeable temporary password.
const PASSWORD = "Heali-" + randomBytes(5).toString("hex") + "-A1!";

async function findByEmail(email) {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  return data?.users?.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
}

let userId;
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true, // confirmed -> can log in immediately, no email step
  user_metadata: { full_name: FULL_NAME, role: "admin" },
});

if (createErr) {
  const existing = await findByEmail(EMAIL);
  if (!existing) {
    console.error("create failed and user not found:", createErr.message);
    process.exit(1);
  }
  userId = existing.id;
  await admin.auth.admin.updateUserById(userId, { password: PASSWORD, email_confirm: true });
  console.log("Existing auth user found -> password reset.");
} else {
  userId = created.user.id;
  console.log("Auth user created.");
}

// Upsert the public.users mirror row with the admin role.
const { error: upsertErr } = await admin
  .from("users")
  .upsert(
    { id: userId, email: EMAIL, full_name: FULL_NAME, role: "admin", onboarding_completed: true },
    { onConflict: "id" }
  );
if (upsertErr) {
  console.error("users upsert error:", upsertErr.message);
  process.exit(1);
}

console.log("\n================ ADMIN CREDENTIALS ================");
console.log("  URL:      /login  (then you'll land on /admin)");
console.log("  Email:    " + EMAIL);
console.log("  Password: " + PASSWORD);
console.log("  User ID:  " + userId);
console.log("===================================================");
console.log("Change this password after first login.");
