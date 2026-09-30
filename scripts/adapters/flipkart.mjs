// Flipkart Affiliate API — "Deals of the Day".
// Needs FLIPKART_AFFILIATE_ID and FLIPKART_AFFILIATE_TOKEN (from affiliate.flipkart.com).
// Check the field names against Flipkart's API docs once you have access.
import { guessCategory } from '../lib.mjs';

export const name = 'flipkart';

export async function fetchProducts(env = process.env) {
  const id = env.FLIPKART_AFFILIATE_ID, token = env.FLIPKART_AFFILIATE_TOKEN;
  if (!id || !token) return null; // not configured
  const res = await fetch('https://affiliate-api.flipkart.net/affiliate/offers/v1/dotd/json', {
    headers: { 'Fk-Affiliate-Id': id, 'Fk-Affiliate-Token': token },
  });
  if (!res.ok) throw new Error(`Flipkart API ${res.status}`);
  const data = await res.json();
  return (data.dotdList || [])
    .filter((d) => (d.availability || 'LIVE').toUpperCase() === 'LIVE')
    .map((d) => ({
      title: d.title,
      subtitle: d.description || null,
      store: 'flipkart',
      category: guessCategory(`${d.title} ${d.description || ''}`) || 'electronics',
      url: d.url,
      affiliateUrl: d.url, // Flipkart API links already carry your affiliate ID
      image: (d.imageUrls || []).sort((a, b) => (b.resolutionType === 'high') - (a.resolutionType === 'high'))[0]?.url || null,
    }));
}
