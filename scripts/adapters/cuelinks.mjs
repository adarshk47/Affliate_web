// Cuelinks offers feed — covers Myntra, Meesho, AJIO, Nykaa, Tata CLiQ and many more.
// Needs CUELINKS_API_KEY (from cuelinks.com → API). Check field names against
// the Cuelinks API docs once you have access.
import { guessCategory, guessStore, toNumber } from '../lib.mjs';

export const name = 'cuelinks';

export async function fetchProducts(env = process.env) {
  const key = env.CUELINKS_API_KEY;
  if (!key) return null;
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://www.cuelinks.com/api/v2/offers.json?page=${page}&per_page=100`, {
      headers: { Authorization: `Token token="${key}"` },
    });
    if (!res.ok) throw new Error(`Cuelinks API ${res.status}`);
    const data = await res.json();
    const offers = data.offers || [];
    for (const o of offers) {
      const url = o.url || o.landing_url;
      const store = guessStore(url) || (o.store?.name || o.campaign_name || '').toLowerCase().replace(/[^a-z]/g, '');
      out.push({
        title: o.title,
        subtitle: o.description || null,
        store,
        category: guessCategory(`${o.title} ${(o.categories || []).join(' ')}`) || 'fashion',
        price: toNumber(o.price),
        mrp: toNumber(o.mrp),
        url,
        affiliateUrl: o.affiliate_url || null,
        image: o.image_url || null,
        expiresAt: o.end_date ? String(o.end_date).slice(0, 10) : null,
      });
    }
    if (offers.length < 100) break;
  }
  return out;
}
