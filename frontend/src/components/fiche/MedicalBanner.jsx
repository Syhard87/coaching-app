// Rappel de sécurité médicale — non bloquant, cahier des charges section 8 (T10.6).
// Affiché sur l'onglet Bilan quand suiviMedical est coché, avant de valider un objectif
// calorique (onglet Nutritionnel) ou un programme intensif (onglet Programme sportif).
export function MedicalBanner() {
  return (
    <div className="rounded border border-accent-400 bg-accent-100 p-3 text-sm text-accent-700">
      ⚠️ Suivi médical en cours — vérifier auprès du client avant de valider un objectif calorique restrictif ou un
      programme d'entraînement intensif.
    </div>
  );
}
