import { SITE } from '../site.config.mjs';
import { categories } from '../lib/data.mjs';
import { getGuides } from '../lib/guides.mjs';
import { INFO_PAGES } from '../i18n/pages.mjs';

export function GET({ site }) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const paths = SITE.languages.flatMap((l) => [
    `/${l}/`, `/${l}/deals/`, `/${l}/guides/`,
    ...categories.map((c) => `/${l}/category/${c.slug}/`),
    ...getGuides(l).map((g) => `/${l}/guides/${g.slug}/`),
    ...Object.keys(INFO_PAGES).map((p) => `/${l}/${p}/`),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => `  <url><loc>${new URL(base + p, site).href}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
