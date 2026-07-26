import { useEffect, useState } from 'react';
import { clientsApi, programmesApi } from '../lib/api';

export function DuplicateProgrammeModal({ programme, currentClientId, onClose }) {
  const [clients, setClients] = useState([]);
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clientsApi
      .list({})
      .then((all) => setClients(all.filter((c) => c.id !== currentClientId)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentClientId]);

  async function handleConfirm() {
    if (!targetId) {
      setError('Choisir un client cible.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await programmesApi.duplicate(programme.id, targetId);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-base font-medium text-gray-900">
          Dupliquer "{programme.nom}" vers un autre client
        </h2>

        {loading && <p className="text-sm text-gray-500">Chargement des clients…</p>}

        {!loading && clients.length === 0 && (
          <p className="text-sm text-gray-500">Aucun autre client disponible.</p>
        )}

        {!loading && clients.length > 0 && (
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">— Choisir un client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || loading || clients.length === 0}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Duplication…' : 'Dupliquer'}
          </button>
        </div>
      </div>
    </div>
  );
}
