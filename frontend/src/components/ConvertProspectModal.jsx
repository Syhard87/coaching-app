import { useState } from 'react';
import { OBJECTIFS } from '../lib/constants';

export function ConvertProspectModal({ prospect, onClose, onConverted }) {
  const [objectif, setObjectif] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setError(null);
    if (!objectif) {
      setError('Choisir un objectif.');
      return;
    }
    setSubmitting(true);
    try {
      await onConverted(objectif);
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
        <h2 className="mb-1 text-base font-medium text-gray-900">
          Convertir {prospect.nom} en client
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Le nom, l'objectif exprimé et le message seront repris dans la fiche client (en note).
        </p>

        <label className="block text-sm font-medium text-gray-700">Objectif du client *</label>
        <select
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="">— Choisir —</option>
          {OBJECTIFS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

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
            disabled={submitting}
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Conversion…' : 'Convertir'}
          </button>
        </div>
      </div>
    </div>
  );
}
