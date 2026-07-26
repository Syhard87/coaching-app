// Fonctions pures pour le tableau de bord (T6.1) — aucun accès base de données.

export function calculerInactivite(derniereMesureDate, seuilJours, maintenant = new Date()) {
  if (!derniereMesureDate) {
    return { joursDepuisDerniereMesure: null, inactif: true };
  }
  const joursDepuisDerniereMesure = Math.floor(
    (maintenant.getTime() - new Date(derniereMesureDate).getTime()) / 86_400_000
  );
  return { joursDepuisDerniereMesure, inactif: joursDepuisDerniereMesure > seuilJours };
}

// Numéro (1-indexé) de la semaine planifiée d'un cycle qui couvre "maintenant",
// ou null si le cycle n'a pas de date de départ, n'a pas encore commencé, ou est terminé.
export function semaineActuelleIndex(dateDebut, dureeSemaines, maintenant = new Date()) {
  if (!dateDebut) return null;
  const joursEcoules = Math.floor((maintenant.getTime() - new Date(dateDebut).getTime()) / 86_400_000);
  if (joursEcoules < 0) return null;
  const numero = Math.floor(joursEcoules / 7) + 1;
  if (numero > dureeSemaines) return null;
  return numero;
}

// Lundi 00:00 UTC de la semaine calendaire contenant "maintenant".
// Calculé en UTC (et non en heure locale du serveur) pour rester cohérent avec les dates
// stockées en base : un `new Date("2026-07-27")` envoyé par le frontend est toujours
// interprété comme minuit UTC, quel que soit le fuseau du serveur qui exécute ce code.
export function debutSemaineCourante(maintenant = new Date()) {
  const jour = maintenant.getUTCDay(); // 0 = dimanche
  const decalage = jour === 0 ? 6 : jour - 1;
  return new Date(
    Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate() - decalage)
  );
}
