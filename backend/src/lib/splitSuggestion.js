// Suggestion de split — cahier des charges section 3.3.
// Fonction pure : ne fait aucun accès base de données, testable isolément.

export function suggererSplit({ joursDisponibles, experienceSportive, horaireTravail }) {
  if (horaireTravail === 'IRREGULIER') return 'FULL_BODY';

  if (joursDisponibles <= 2) return 'FULL_BODY';
  if (joursDisponibles === 3) return experienceSportive === 'CONFIRME' ? 'HALF_BODY' : 'FULL_BODY';
  if (joursDisponibles === 4) return 'HALF_BODY';
  if (joursDisponibles === 5) return experienceSportive === 'CONFIRME' ? 'BRO_SPLIT' : 'PPL';
  return 'PPL';
}

// Un jour est compté comme disponible dès qu'au moins un créneau y est marqué disponible.
export function compterJoursDisponibles(disponibilites) {
  const jours = new Set(
    disponibilites.filter((d) => d.disponible).map((d) => d.jourSemaine)
  );
  return jours.size;
}
