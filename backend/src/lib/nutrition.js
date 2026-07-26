// Calcul nutritionnel automatique — cahier des charges section 3.2.
// Fonctions pures : aucun accès base de données, testables isolément.
// L'algorithme est assistif : le résultat pré-remplit les objectifs, le coach peut
// toujours ajuster manuellement (voir contrainte non-fonctionnelle section 6).

const FACTEURS_ACTIVITE = {
  SEDENTAIRE: 1.2,
  LEGEREMENT_ACTIF: 1.375,
  MODEREMENT_ACTIF: 1.55,
  TRES_ACTIF: 1.725,
  EXTREMEMENT_ACTIF: 1.9,
};

const AJUSTEMENTS_CALORIQUES = {
  DEFICIT_LEGER: -250,
  DEFICIT_MODERE: -500,
  SURPLUS_LEGER: 250,
  SURPLUS_MODERE: 500,
  MAINTIEN: 0,
};

// Grammes par kg de poids de corps — haut de fourchette conseillé pour les protéines
// (préservation de la masse musculaire), milieu de fourchette pour les lipides.
const G_PROTEINES_PAR_KG = 2.2;
const G_LIPIDES_PAR_KG = 1;

// Mifflin-St Jeor
export function calculerBMR({ sexe, poidsKg, tailleCm, age }) {
  const base = 10 * poidsKg + 6.25 * tailleCm - 5 * age;
  return sexe === 'HOMME' ? base + 5 : base - 161;
}

export function calculerTDEE(bmr, niveauActivite) {
  return bmr * FACTEURS_ACTIVITE[niveauActivite];
}

export function calculerCaloriesCible(tdee, typeObjectifCalorique) {
  return tdee + AJUSTEMENTS_CALORIQUES[typeObjectifCalorique];
}

export function calculerMacros({ caloriesCible, poidsKg }) {
  const proteinesCible = Math.round(G_PROTEINES_PAR_KG * poidsKg);
  const lipidesCible = Math.round(G_LIPIDES_PAR_KG * poidsKg);
  const caloriesRestantes = caloriesCible - (proteinesCible * 4 + lipidesCible * 9);
  const glucidesCible = Math.max(0, Math.round(caloriesRestantes / 4));
  return { proteinesCible, lipidesCible, glucidesCible };
}

export function calculerObjectifsAuto({ sexe, poidsKg, tailleCm, age, niveauActivite, typeObjectifCalorique }) {
  const bmr = calculerBMR({ sexe, poidsKg, tailleCm, age });
  const tdee = calculerTDEE(bmr, niveauActivite);
  const caloriesCible = Math.round(calculerCaloriesCible(tdee, typeObjectifCalorique));
  const macros = calculerMacros({ caloriesCible, poidsKg });

  return { tdeeCalcule: Math.round(tdee), caloriesCible, ...macros };
}
