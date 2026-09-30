// Buying guides live in src/guides/<lang>/<slug>.md
const files = import.meta.glob('../guides/*/*.md', { eager: true });

export function getGuides(lang) {
  return Object.entries(files)
    .map(([path, mod]) => {
      const [, fileLang, slug] = path.match(/guides\/([^/]+)\/([^/]+)\.md$/);
      return { lang: fileLang, slug, ...mod.frontmatter, Content: mod.Content };
    })
    .filter((g) => g.lang === lang && !g.draft)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}
