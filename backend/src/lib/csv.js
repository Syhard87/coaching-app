// Conversion JSON -> CSV — cahier des charges section 3.9 / T7.2.
// Fonction pure : ne fait aucun accès base de données, testable isolément.

function echapperChamp(valeur) {
  if (valeur === null || valeur === undefined) return '';
  const texte = valeur instanceof Date ? valeur.toISOString() : String(valeur);
  if (/[",\n\r]/.test(texte)) {
    return `"${texte.replace(/"/g, '""')}"`;
  }
  return texte;
}

// `colonnes` fixe l'ordre et le sous-ensemble de clés à exporter. Si omis, les clés
// du premier objet sont utilisées (utile seulement quand la forme des lignes est fiable).
export function versCSV(lignes, colonnes) {
  if (lignes.length === 0) return '';
  const cles = colonnes || Object.keys(lignes[0]);
  const entete = cles.map(echapperChamp).join(',');
  const corps = lignes.map((ligne) => cles.map((cle) => echapperChamp(ligne[cle])).join(','));
  return [entete, ...corps].join('\r\n');
}
