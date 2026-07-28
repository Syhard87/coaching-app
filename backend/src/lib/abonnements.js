// Abonnements par module — cahier des charges section 5 (Phase 10, T10.1/T10.2).

// Grille par défaut créée à l'inscription d'un coach.
export const CATALOGUE_DEFAUT = [
  { module: 'SPORT', dureeMois: 1, prixTotal: 50 },
  { module: 'SPORT', dureeMois: 3, prixTotal: 120 },
  { module: 'SPORT', dureeMois: 6, prixTotal: 180 },
  { module: 'DIETE', dureeMois: 1, prixTotal: 50 },
  { module: 'DIETE', dureeMois: 3, prixTotal: 120 },
  { module: 'DIETE', dureeMois: 6, prixTotal: 180 },
  { module: 'PACK_COMPLET', dureeMois: 1, prixTotal: 85 },
  { module: 'PACK_COMPLET', dureeMois: 3, prixTotal: 200 },
  { module: 'PACK_COMPLET', dureeMois: 6, prixTotal: 300 },
];

// Date de fin = date de début + durée du catalogue (en mois), calculée automatiquement à la vente.
// Calculé en UTC (voir lib/dashboard.js) pour rester cohérent avec les dates stockées en base,
// quel que soit le fuseau du serveur qui exécute ce code.
export function calculerDateFin(dateDebut, dureeMois) {
  const d = new Date(dateDebut);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + dureeMois, d.getUTCDate()));
}
