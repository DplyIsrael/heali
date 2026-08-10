// Imports practitioners from the CSV into Heali (raw postgres + Supabase Auth).
//  - Builds treatment_domains + specialties catalog (load-or-create)
//  - Creates a Supabase Auth login per practitioner (shared password)
//  - Inserts users + practitioner_profiles + default availability (in a tx)
// Idempotent: safe to re-run (reuses auth users by email; ON CONFLICT DO NOTHING).
// Run: node scripts/import-practitioners.mjs
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

const CSV_PATH = "/Users/umerkhan/Downloads/heali_practitioners_seed - מטפלים.csv";
const SHARED_PASSWORD = "Heali2026!";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const getEnv = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
const sql = postgres(getEnv("DATABASE_URL"), { prepare: false });
const admin = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── CSV parse ──
function parseCSV(text) {
  const rows = []; let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; } else field += c; }
    else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}
const raw = readFileSync(CSV_PATH, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
const all = parseCSV(raw).filter((r) => r.some((c) => c.trim() !== ""));
const header = all[0].map((h) => h.trim());
const data = all.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
console.log(`Parsed ${data.length} practitioners.`);

const splitList = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
const parseDate = (d) => { const [dd, mm, yyyy] = d.split("/"); return new Date(`${yyyy}-${mm}-${dd}T09:00:00Z`); };
const STATUS = {
  "פעיל":         { vs: "approved",         visible: true,  blocked: false },
  "ממתין לאישור": { vs: "pending_approval", visible: false, blocked: false },
  "לא פעיל":      { vs: "approved",         visible: false, blocked: true },
};
function makeBio(d, domain) {
  const spec = splitList(d.Specialties).join(", ");
  const f = d.Gender === "נקבה";
  return `${f ? "מטפלת מוסמכת" : "מטפל מוסמך"} ב${domain} מאזור ${d.Region}. מתמחה ב${spec}. ${f ? "בעלת" : "בעל"} ${d["Number of Reviews"]} ביקורות ודירוג ${d.Rating} מתוך 5.`;
}

// ── 1+2. Catalog (load-or-create) ──
const domainNames = [...new Set(data.map((d) => d["Treatment type"]))];
if ((await sql`SELECT count(*)::int AS c FROM treatment_domains`)[0].c === 0) {
  await sql`INSERT INTO treatment_domains ${sql(domainNames.map((name) => ({ name })), "name")}`;
}
const domainId = Object.fromEntries((await sql`SELECT id, name FROM treatment_domains`).map((r) => [r.name, r.id]));

const specPairs = new Map();
for (const d of data) for (const s of splitList(d.Specialties)) specPairs.set(`${d["Treatment type"]}||${s}`, { name: s, domain: d["Treatment type"] });
if ((await sql`SELECT count(*)::int AS c FROM specialties`)[0].c === 0) {
  await sql`INSERT INTO specialties ${sql([...specPairs.values()].map((s) => ({ name: s.name, domain_id: domainId[s.domain] })), "name", "domain_id")}`;
}
const specialtyId = Object.fromEntries(
  (await sql`SELECT s.id, s.name, d.name AS domain FROM specialties s JOIN treatment_domains d ON d.id = s.domain_id`)
    .map((r) => [`${r.domain}||${r.name}`, r.id])
);
console.log(`Catalog ready: ${Object.keys(domainId).length} domains, ${Object.keys(specialtyId).length} specialties.`);

// ── 3. Auth logins (idempotent) ──
console.log("Creating Supabase Auth logins...");
const enriched = [], errors = [];
for (let i = 0; i < data.length; i++) {
  const d = data[i];
  const { data: created, error } = await admin.auth.admin.createUser({
    email: d.Email, password: SHARED_PASSWORD, email_confirm: true,
    user_metadata: { full_name: d["Practitioner Name"] },
  });
  let id = created?.user?.id;
  if (error) {
    const [row] = await sql`SELECT id FROM auth.users WHERE email = ${d.Email}`;
    if (row) id = row.id; else { errors.push({ email: d.Email, error: error.message }); continue; }
  }
  enriched.push({ d, id });
  if ((i + 1) % 25 === 0) console.log(`  ...${i + 1}/${data.length}`);
}
console.log(`Auth users ready: ${enriched.length} (${errors.length} errors).`);

// ── 4-6. DB writes in one transaction ──
await sql.begin(async (tx) => {
  // users
  await tx`INSERT INTO users ${tx(enriched.map(({ d, id }) => ({
    id, email: d.Email, full_name: d["Practitioner Name"], role: "practitioner",
    onboarding_completed: true, is_blocked: STATUS[d.Status].blocked,
    created_at: parseDate(d["Join Date"]), updated_at: parseDate(d["Join Date"]),
  })), "id", "email", "full_name", "role", "onboarding_completed", "is_blocked", "created_at", "updated_at")}
  ON CONFLICT (email) DO NOTHING`;

  // profiles (per-row for array casts)
  for (const { d, id } of enriched) {
    const dom = d["Treatment type"], st = STATUS[d.Status];
    const domIds = [domainId[dom]];
    const specIds = splitList(d.Specialties).map((s) => specialtyId[`${dom}||${s}`]).filter(Boolean);
    const created = parseDate(d["Join Date"]);
    await tx`INSERT INTO practitioner_profiles
      (user_id, domain_ids, specialty_ids, pricing_model, price, languages, bio, phone, city, area,
       verification_status, is_publicly_visible, average_rating, total_reviews, onboarding_step, created_at, updated_at)
      VALUES (${id}, ${domIds}::uuid[], ${specIds}::uuid[], ${"per_treatment"}, ${Number(d["Treatment Cost"].replace(/[^\d.]/g, "")).toFixed(2)},
       ${splitList(d.Languages)}::text[], ${makeBio(d, dom)}, ${d.Phone}, ${d.City}, ${d.Region},
       ${st.vs}, ${st.visible}, ${Number(d.Rating).toFixed(2)}, ${Number(d["Number of Reviews"])}, ${10}, ${created}, ${created})
      ON CONFLICT (user_id) DO NOTHING`;
  }

  // availability (Sun–Thu 09:00–17:00)
  const profs = await tx`SELECT id FROM practitioner_profiles`;
  const avail = profs.flatMap((p) => [0, 1, 2, 3, 4].map((wd) => ({ practitioner_id: p.id, weekday: wd, start_time: "09:00", end_time: "17:00" })));
  await tx`INSERT INTO practitioner_availability ${tx(avail, "practitioner_id", "weekday", "start_time", "end_time")}
           ON CONFLICT (practitioner_id, weekday, start_time) DO NOTHING`;
  console.log(`Inserted users + profiles + ${avail.length} availability slots.`);
});

// ── Summary ──
const cnt = (s) => data.filter((d) => d.Status === s).length;
const [{ visible }] = await sql`SELECT count(*)::int AS visible FROM practitioner_profiles WHERE verification_status='approved' AND is_publicly_visible=true`;
console.log("\n✅ Import complete.");
console.log(`   Practitioners imported: ${enriched.length}`);
console.log(`     פעיל (discovery-visible):   ${cnt("פעיל")}  | live in discovery now: ${visible}`);
console.log(`     ממתין לאישור (pending):      ${cnt("ממתין לאישור")}`);
console.log(`     לא פעיל (blocked):           ${cnt("לא פעיל")}`);
console.log(`   Auth logins: ${enriched.length}  |  shared password: ${SHARED_PASSWORD}`);
if (errors.length) console.log(`   ⚠️ Errors:\n${JSON.stringify(errors, null, 2)}`);

await sql.end();
process.exit(0);
