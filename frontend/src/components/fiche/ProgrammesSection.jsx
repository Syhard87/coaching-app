import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientsApi, programmesApi } from '../../lib/api';
import { labelTypeSplit } from '../../lib/constants';
import { DuplicateProgrammeModal } from '../DuplicateProgrammeModal';

// Programmes — fusionnés dans l'onglet Programme sportif (T10.4), anciennement page dédiée.
export function ProgrammesSection({ clientId }) {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duplicateSource, setDuplicateSource] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    clientsApi
      .listProgrammes(clientId)
      .then(setProgrammes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(load, [load]);

  async function handleDelete(programme) {
    if (!window.confirm(`Supprimer le programme "${programme.nom}" ? Cette action est irréversible.`)) return;
    await programmesApi.remove(programme.id);
    load();
  }

  if (loading) return <p className="text-sm text-graphite-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-medium text-graphite-900">Programmes</h2>
        <Link
          to={`/clients/${clientId}/programmes/new`}
          className="rounded bg-graphite-900 px-4 py-2 text-sm font-medium text-white hover:bg-graphite-800"
        >
          + Nouveau programme
        </Link>
      </div>

      {programmes.length === 0 && <p className="text-sm text-graphite-500">Aucun programme pour ce client.</p>}

      {programmes.length > 0 && (
        <ul className="divide-y divide-chalk-200 rounded border border-chalk-200 bg-white">
          {programmes.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-graphite-900">{p.nom}</p>
                <p className="text-sm text-graphite-500">
                  {labelTypeSplit(p.typeSplit)} · {p.frequence} j/semaine
                </p>
              </div>
              <div className="flex shrink-0 gap-2 text-sm">
                <Link
                  to={`/clients/${clientId}/programmes/${p.id}/calendrier`}
                  className="rounded border border-chalk-300 px-3 py-1.5 text-graphite-700 hover:bg-chalk-100"
                >
                  Calendrier
                </Link>
                <Link
                  to={`/clients/${clientId}/programmes/${p.id}`}
                  className="rounded border border-chalk-300 px-3 py-1.5 text-graphite-700 hover:bg-chalk-100"
                >
                  Modifier
                </Link>
                <button
                  type="button"
                  onClick={() => setDuplicateSource(p)}
                  className="rounded border border-chalk-300 px-3 py-1.5 text-graphite-700 hover:bg-chalk-100"
                >
                  Dupliquer vers
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="rounded border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {duplicateSource && (
        <DuplicateProgrammeModal
          programme={duplicateSource}
          currentClientId={clientId}
          onClose={() => setDuplicateSource(null)}
        />
      )}
    </div>
  );
}
