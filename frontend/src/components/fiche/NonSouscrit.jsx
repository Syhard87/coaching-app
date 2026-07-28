// État "non souscrit" — jamais masqué ni vide sans explication, invite à vendre (T10.5).
export function NonSouscrit({ module, onVendre }) {
  return (
    <div className="rounded border border-dashed border-chalk-300 bg-chalk-50 p-8 text-center">
      <p className="mb-3 text-sm text-graphite-600">
        Ce client n'a pas d'abonnement actif pour le module <strong>{module}</strong>.
      </p>
      <button
        type="button"
        onClick={onVendre}
        className="rounded bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
      >
        Vendre un abonnement
      </button>
    </div>
  );
}
