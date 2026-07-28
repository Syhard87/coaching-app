import { useEffect, useState } from 'react';
import { catalogueAbonnementsApi, clientsApi } from '../../lib/api';
import { labelModuleAbonnement } from '../../lib/constants';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Vente d'un abonnement à un client — cahier des charges section 5 (T10.2).
export function VendreAbonnementModal({ clientId, onClose, onVendu }) {
  const [catalogue, setCatalogue] = useState([]);
  const [catalogueAbonnementId, setCatalogueAbonnementId] = useState('');
  const [dateDebut, setDateDebut] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    catalogueAbonnementsApi
      .list()
      .then(setCatalogue)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleConfirm() {
    if (!catalogueAbonnementId) {
      setError('Choisir une formule.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await clientsApi.vendreAbonnement(clientId, { catalogueAbonnementId, dateDebut });
      onVendu();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded bg-white p-5 shadow-lg">
        <h2 className="mb-4 font-heading text-base font-medium text-graphite-900">Vendre un abonnement</h2>

        {loading && <p className="text-sm text-graphite-500">Chargement du catalogue…</p>}

        {!loading && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-graphite-600">Formule</label>
              <select
                value={catalogueAbonnementId}
                onChange={(e) => setCatalogueAbonnementId(e.target.value)}
                className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
              >
                <option value="">— Choisir une formule —</option>
                {catalogue.map((c) => (
                  <option key={c.id} value={c.id}>
                    {labelModuleAbonnement(c.module)} — {c.dureeMois} mois ({c.prixTotal}€)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-graphite-600">Date de début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="mt-1 w-full rounded border border-chalk-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-chalk-300 px-3 py-1.5 text-sm text-graphite-700 hover:bg-chalk-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || loading}
            className="rounded bg-accent-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-700 disabled:opacity-50"
          >
            {submitting ? 'Vente…' : 'Vendre'}
          </button>
        </div>
      </div>
    </div>
  );
}
