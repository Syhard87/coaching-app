function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR');
}

// Message pré-rempli résumant l'activité récente d'un client — US-5.1.
// Fonction pure : ne fait que composer du texte à partir des données déjà chargées.
export function genererMessageRecap({ client, derniereSeance, derniereMesure, objectifDiete }) {
  const lignes = [`Bonjour ${client.nom},`, ''];

  if (derniereSeance) {
    const jour = derniereSeance.jour ? derniereSeance.jour.nom : 'séance libre';
    const ressenti = derniereSeance.ressenti != null ? `, ressenti ${derniereSeance.ressenti}/10` : '';
    lignes.push(`Dernière séance (${formatDate(derniereSeance.date)}) : ${jour}${ressenti}.`);
  } else {
    lignes.push("Pas encore de séance enregistrée.");
  }

  if (derniereMesure?.poids != null) {
    lignes.push(`Dernière mesure (${formatDate(derniereMesure.date)}) : ${derniereMesure.poids} kg.`);
  }

  if (objectifDiete?.caloriesCible) {
    lignes.push(`Objectif nutritionnel actuel : ${objectifDiete.caloriesCible} kcal/jour.`);
  }

  lignes.push('', 'Continue comme ça, on en reparle bientôt !');

  return lignes.join('\n');
}

export function lienWhatsApp(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function lienSMS(message) {
  return `sms:?body=${encodeURIComponent(message)}`;
}
