// Slug public du coach — cahier des charges section 3.10 (page de prospection /p/:slug).

const DIACRITIQUES = new RegExp('[̀-ͯ]', 'g');

export function slugify(texte) {
  return texte
    .normalize('NFD')
    .replace(DIACRITIQUES, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function estSlugValide(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
