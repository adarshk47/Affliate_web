import crypto from 'node:crypto';

export const CATEGORY_KEYWORDS = {
  electronics: ['phone', 'mobile', 'smartphone', 'laptop', 'tablet', 'earbuds', 'earphone', 'headphone', 'speaker', 'watch', 'tv', 'television', 'charger', 'power bank', 'camera', 'monitor', 'keyboard', 'mouse', 'router', 'electronics'],
  fashion: ['shirt', 't-shirt', 'tshirt', 'kurta', 'kurti', 'saree', 'jeans', 'dress', 'shoe', 'sneaker', 'sandal', 'jacket', 'top', 'trouser', 'lehenga', 'bag', 'wallet', 'sunglass', 'fashion', 'clothing', 'apparel', 'footwear'],
  'home-kitchen': ['kitchen', 'cookware', 'mixer', 'grinder', 'cooker', 'kettle', 'bedsheet', 'curtain', 'furniture', 'mattress', 'pillow', 'bottle', 'lamp', 'fan', 'iron', 'vacuum', 'purifier', 'home', 'appliance'],
  beauty: ['beauty', 'makeup', 'lipstick', 'serum', 'cream', 'shampoo', 'perfume', 'deodorant', 'trimmer', 'face wash', 'sunscreen', 'skincare', 'hair', 'grooming', 'personal care'],
  'baby-kids': ['baby', 'kids', 'kid', 'toy', 'diaper', 'infant', 'toddler', 'school', 'stroller', 'child', 'children'],
};

export function guessCategory(text = '') {
  const t = text.toLowerCase();
  for (const [slug, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => t.includes(w))) return slug;
  }
  return null;
}

export function guessStore(url = '') {
  const host = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
  const map = { amazon: 'amazon', amzn: 'amazon', flipkart: 'flipkart', myntra: 'myntra', meesho: 'meesho', ajio: 'ajio', nykaa: 'nykaa', tatacliq: 'tatacliq', jiomart: 'jiomart', croma: 'croma', firstcry: 'firstcry' };
  for (const [key, store] of Object.entries(map)) if (host.includes(key)) return store;
  return null;
}

export function productId(store, url, title) {
  const key = `${store}|${(url || '').split('?')[0]}|${(title || '').toLowerCase().trim()}`;
  return crypto.createHash('sha1').update(key).digest('hex').slice(0, 12);
}

export function toNumber(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(String(v).replace(/[₹,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

// Adds your affiliate ID to plain store links. Links that already came
// from an affiliate network (affiliateUrl) are used unchanged.
export function buildAffiliateLink(p, env = process.env) {
  if (p.affiliateUrl) return p.affiliateUrl;
  let u;
  try { u = new URL(p.url); } catch { return p.url; }
  if (p.store === 'amazon' && env.AMAZON_ASSOCIATE_TAG) u.searchParams.set('tag', env.AMAZON_ASSOCIATE_TAG);
  if (p.store === 'flipkart' && env.FLIPKART_AFFILIATE_ID) u.searchParams.set('affid', env.FLIPKART_AFFILIATE_ID);
  return u.toString();
}

// Minimal CSV parser (handles quotes, commas and newlines inside quotes).
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== '')) rows.push(row);
  if (!rows.length) return [];
  const header = rows.shift().map((h) => h.trim().toLowerCase());
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}
