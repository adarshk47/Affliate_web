// Reads data/manual/products.csv — products you add by hand.
import fs from 'node:fs/promises';
import { parseCsv, toNumber, guessStore, guessCategory } from '../lib.mjs';

export const name = 'manual';

export async function fetchProducts() {
  let text;
  try { text = await fs.readFile(new URL('../../data/manual/products.csv', import.meta.url), 'utf8'); }
  catch { return []; }
  return parseCsv(text)
    .filter((r) => r.title && r.url)
    .map((r) => ({
      title: r.title,
      store: (r.store || guessStore(r.url) || 'other').toLowerCase(),
      category: r.category || guessCategory(r.title) || 'electronics',
      price: toNumber(r.price),
      mrp: toNumber(r.mrp),
      url: r.url,
      affiliateUrl: r.affiliate_url || null,
      image: r.image || null,
      rating: toNumber(r.rating),
      expiresAt: r.expires || null,
      pinned: true,
    }));
}
