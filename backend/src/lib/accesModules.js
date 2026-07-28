// Logique d'accès aux modules — fonction pure, cahier des charges section 5 (T10.3).
// Un module est actif tant qu'un abonnement non expiré le couvre ; PACK_COMPLET couvre les deux.
export function calculerModulesActifs(abonnements, maintenant = new Date()) {
  let sportActif = false;
  let dieteActif = false;

  for (const { module, dateFin } of abonnements) {
    if (new Date(dateFin) <= maintenant) continue;
    if (module === 'SPORT' || module === 'PACK_COMPLET') sportActif = true;
    if (module === 'DIETE' || module === 'PACK_COMPLET') dieteActif = true;
  }

  return { sportActif, dieteActif };
}
