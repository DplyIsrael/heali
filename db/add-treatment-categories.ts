import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const NEW_CATEGORIES = [
  "אורתופדיה וכאב",
  "גניקולוגיה",
  "הריון ופריון",
  "גיל המעבר",
  "ילדים",
  "הגיל השלישי",
  "מחלות כרוניות",
  "ירידה במשקל",
  "מחלות מטאבוליות",
  "אונקולוגיה",
  "רגשי",
  "סטרס",
  "חרדות",
  "דכאון",
];

async function run() {
  console.log("Loading active treatment domains...");
  const { data: domains, error: domainErr } = await supabase
    .from("treatment_domains")
    .select("id, name")
    .eq("is_active", true);

  if (domainErr) {
    console.error("Failed to load domains:", domainErr);
    process.exit(1);
  }
  if (!domains || domains.length === 0) {
    console.error("No active domains found. Aborting.");
    process.exit(1);
  }
  console.log(`Found ${domains.length} domains.`);

  let inserted = 0;
  let skipped = 0;

  for (const domain of domains) {
    for (const name of NEW_CATEGORIES) {
      const { data: existing, error: checkErr } = await supabase
        .from("specialties")
        .select("id")
        .eq("name", name)
        .eq("domain_id", domain.id)
        .limit(1);

      if (checkErr) {
        console.error(`Check failed for "${name}" in "${domain.name}":`, checkErr);
        continue;
      }

      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      const { error: insertErr } = await supabase
        .from("specialties")
        .insert({ name, domain_id: domain.id, is_active: true });

      if (insertErr) {
        console.error(`Insert failed for "${name}" in "${domain.name}":`, insertErr);
        continue;
      }
      inserted++;
    }
  }

  console.log(`Done. Inserted ${inserted}, skipped ${skipped} (already existed).`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
