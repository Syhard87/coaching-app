// Planning & réservation — fonctions pures, cahier des charges section 5 (T11.1/T11.2).

const HEURE_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function estHeureValide(heure) {
  return typeof heure === 'string' && HEURE_RE.test(heure);
}

// Comparaison lexicographique fiable sur des heures "HH:mm" zero-paddées.
export function estPlageValide(heureDebut, heureFin) {
  return estHeureValide(heureDebut) && estHeureValide(heureFin) && heureDebut < heureFin;
}
