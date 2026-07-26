import { useState } from 'react';
import { exportApi } from '../lib/api';

const ENTITES_CSV = [
  { value: 'clients', label: 'Clients' },
  { value: 'mesures', label: 'Mesures corporelles' },
  { value: 'journal-diete', label: 'Journal alimentaire' },
  { value: 'seances', label: 'Séances' },
];

export function ExportPage() {
  const [error, setError] = useState(null);
  const [enCours, setEnCours] = useState(null);

  async function telecharger(cle, action) {
    setError(null);
    setEnCours(cle);
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnCours(null);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-medium text-gray-900">Export des données</h1>
        <p className="mt-1 text-sm text-gray-500">
          Récupérez l'ensemble de vos données à tout moment, sans dépendre de cette application.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-700">Export complet</h2>
        <button
          type="button"
          onClick={() => telecharger('json', exportApi.json)}
          disabled={enCours === 'json'}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {enCours === 'json' ? 'Préparation…' : 'Télécharger tout (JSON)'}
        </button>
        <p className="mt-1 text-xs text-gray-500">
          Profil, clients, disponibilités, programmes, cycles, séances, nutrition et mesures.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-gray-700">Export par tableau (CSV)</h2>
        <div className="flex flex-wrap gap-2">
          {ENTITES_CSV.map((e) => (
            <button
              key={e.value}
              type="button"
              onClick={() => telecharger(e.value, () => exportApi.csv(e.value))}
              disabled={enCours === e.value}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {enCours === e.value ? 'Préparation…' : e.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
