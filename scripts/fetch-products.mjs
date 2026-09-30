// Daily product update. Run by GitHub Actions every morning (and `npm run fetch` locally).
//  1. Pull products from every configured source (manual CSV + APIs)
//  2. Merge with yesterday's list, keep "first seen" dates, drop expired/old items
//  3. Add your affiliate IDs to links
//  4. Write data/products.json, which the website is built from
import fs from 'node:fs/promises';
import * as manual from './adapters/manual-csv.mjs';
import * as flipkart from './adapters/flipkart.mjs';
import * as cuelinks from './adapters/cuelinks.mjs';
import * as amazon from './adapters/amazon.mjs';
import { productId, buildAffiliateLink } from './lib.mjs';

const ADAPTERS = [manual, flipkart, cuelinks, amazon];
const MAX_AGE_DAYS = 30;       // feed products older than this are removed
const OUT = new URL('../data/products.json', import.meta.url);
const SAMPLE = new URL('../data/sample/sample-products.json', import.meta.url);
const CATEGORIES = JSON.parse(await fs.readFile(new URL('../data/categories.json', import.meta.url), 'utf8')).map((c) => c.slug);

const now = new Date();
const today = now.toISOString().slice(0, 10);

async function readJson(url, fallback) {
  try { return JSON.parse(await fs.readFile(url, 'utf8')); } catch { return fallback; }
}

const previous = await readJson(OUT, { products: [] });
const prevById = new Map(previous.products.filter((p) => !p.demo).map((p) => [p.id, p]));

const fresh = [];
const sourceReport = {};
for (const a of ADAPTERS) {
  try {
    const items = await a.fetchProducts(process.env);
    if (items === null) { sourceReport[a.name] = 'not configured'; continue; }
    sourceReport[a.name] = `${items.length} items`;
    for (const it of items) fresh.push({ ...it, source: a.name });
  } catch (err) {
    sourceReport[a.name] = `error: ${err.message}`;
  }
}

const merged = new Map();
// Keep previous feed items (so products don't vanish if an API has a bad day);
// manual items are re-read from the CSV each time, so drop old ones.
for (const [id, p] of prevById) if (p.source !== 'manual') merged.set(id, p);

for (const it of fresh) {
  if (!it.title || !it.url) continue;
  if (!CATEGORIES.includes(it.category)) continue;
  const id = productId(it.store, it.url, it.title);
  const old = merged.get(id) || prevById.get(id);
  merged.set(id, {
    id,
    ...it,
    link: buildAffiliateLink(it),
    discount: it.price && it.mrp && it.mrp > it.price ? Math.round((1 - it.price / it.mrp) * 100) : null,
    addedAt: old?.addedAt || today,
    updatedAt: today,
  });
}

let products = [...merged.values()].filter((p) => {
  if (p.expiresAt && p.expiresAt < today) return false;
  if (p.pinned) return true;
  const ageDays = (now - new Date(p.updatedAt || p.addedAt)) / 86400000;
  return ageDays <= MAX_AGE_DAYS;
});

// Until real sources are connected, show demo products so the site isn't empty.
let usingDemo = false;
if (products.length === 0) {
  usingDemo = true;
  const sample = await readJson(SAMPLE, []);
  products = sample.map((s, i) => {
    const addedAt = new Date(now - (i % 7) * 86400000).toISOString().slice(0, 10);
    return {
      id: productId(s.store, s.url, s.title),
      ...s,
      link: buildAffiliateLink(s),
      discount: s.price && s.mrp ? Math.round((1 - s.price / s.mrp) * 100) : null,
      addedAt,
      updatedAt: today,
      source: 'sample',
      demo: true,
    };
  });
}

products.sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || '') || (b.discount || 0) - (a.discount || 0));

await fs.writeFile(OUT, JSON.stringify({ updatedAt: now.toISOString(), usingDemo, sources: sourceReport, products }, null, 2) + '\n');

console.log(`Products updated ${today}`);
for (const [k, v] of Object.entries(sourceReport)) console.log(`  ${k}: ${v}`);
console.log(`  total: ${products.length}${usingDemo ? ' (DEMO data — connect a source to show real products)' : ''}`);
