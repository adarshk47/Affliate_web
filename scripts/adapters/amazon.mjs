// Amazon Product Advertising API (PA-API 5).
// Amazon only gives API access after your Associates account has qualifying
// sales. Until then, add Amazon products in data/manual/products.csv —
// your AMAZON_ASSOCIATE_TAG is added to those links automatically.
export const name = 'amazon';

export async function fetchProducts(env = process.env) {
  if (!env.AMAZON_PAAPI_ACCESS_KEY) return null;
  console.warn('  amazon: PA-API keys found, but the PA-API adapter is not implemented yet.');
  return [];
}
