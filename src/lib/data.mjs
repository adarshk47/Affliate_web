import productsFile from '../../data/products.json';
import categories from '../../data/categories.json';
import { SITE } from '../site.config.mjs';

export { categories };
export const products = productsFile.products;
export const usingDemo = productsFile.usingDemo;
export const updatedAt = productsFile.updatedAt;
export const langPaths = () => SITE.languages.map((lang) => ({ params: { lang } }));

// Prefix a site path with the base path (needed on GitHub Pages project sites).
export function url(path = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
}

export const formatINR = (n) => (n == null ? '' : '₹' + Number(n).toLocaleString('en-IN'));
