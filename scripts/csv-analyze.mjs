// Read-only analysis of the practitioner CSV. Inserts nothing.
import { readFileSync } from "node:fs";

const PATH = "/Users/umerkhan/Downloads/heali_practitioners_seed - מטפלים.csv";
const raw = readFileSync(PATH, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

// Minimal RFC-4180 CSV parser (handles quoted fields with commas).
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCSV(raw).filter((r) => r.some((c) => c.trim() !== ""));
const header = rows[0].map((h) => h.trim());
const data = rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));

console.log(`Rows: ${data.length}, Columns: ${header.length}`);
console.log("Header:", header.join(" | "));

const uniq = (arr) => [...new Set(arr)];
const counts = (arr) => {
  const m = {};
  for (const v of arr) m[v] = (m[v] || 0) + 1;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};

// Data-quality checks
const emails = data.map((d) => d.Email);
const dupEmails = counts(emails).filter(([, n]) => n > 1);
const missing = data.filter((d) => !d.Email || !d["Practitioner Name"]);
console.log(`\n[QUALITY] duplicate emails: ${dupEmails.length ? JSON.stringify(dupEmails) : "none"}`);
console.log(`[QUALITY] rows missing email/name: ${missing.length}`);

console.log("\n=== Gender ===", counts(data.map((d) => d.Gender)));
console.log("\n=== Status ===", counts(data.map((d) => d.Status)));
console.log("\n=== Region (→ area) ===", counts(data.map((d) => d.Region)));
console.log("\n=== Treatment type (→ domains) ===");
console.table(counts(data.map((d) => d["Treatment type"])).map(([name, n]) => ({ domain: name, practitioners: n })));

// Specialties per domain
const specByDomain = {};
for (const d of data) {
  const dom = d["Treatment type"];
  specByDomain[dom] ??= new Set();
  for (const s of d.Specialties.split(",").map((x) => x.trim()).filter(Boolean)) specByDomain[dom].add(s);
}
console.log("\n=== Specialties per domain ===");
for (const [dom, set] of Object.entries(specByDomain)) console.log(`  ${dom} (${set.size}): ${[...set].join(", ")}`);

const langTokens = uniq(data.flatMap((d) => d.Languages.split(",").map((x) => x.trim()).filter(Boolean)));
console.log("\n=== Languages (distinct tokens) ===", langTokens);

const prices = data.map((d) => Number(d["Treatment Cost"].replace(/[^\d.]/g, "")));
const ratings = data.map((d) => Number(d.Rating));
const reviews = data.map((d) => Number(d["Number of Reviews"]));
const range = (a) => `${Math.min(...a)} – ${Math.max(...a)}`;
console.log(`\n=== Numeric ranges ===\n  price: ${range(prices)} | rating: ${range(ratings)} | reviews: ${range(reviews)}`);
console.log(`  distinct prices: ${uniq(prices).sort((a,b)=>a-b).join(", ")}`);

// Cities per region (to optionally populate geography tables)
const cityByRegion = {};
for (const d of data) { cityByRegion[d.Region] ??= new Set(); cityByRegion[d.Region].add(d.City); }
console.log("\n=== Cities per region ===");
for (const [r, set] of Object.entries(cityByRegion)) console.log(`  ${r}: ${[...set].join(", ")}`);
