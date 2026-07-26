import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { clientsApi, programmesApi } from '../lib/api';
import { labelTypeSplit } from '../lib/constants';
import { DuplicateProgrammeModal } from '../components/DuplicateProgrammeModal';

export function ProgrammesListPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duplicateSource, setDuplicateSource] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([clientsApi.get(clientId), clientsApi.listProgrammes(clientId)])
      .then(([client, programmes]) => {
        setClient(client);
        setProgrammes(programmes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(load, [load]);

  async function handleDelete(programme) {
    if (!window.confirm(`Supprimer le programme "${programme.nom}" ? Cette action est irréversible.`)) return;
    await programmesApi.remove(programme.id);
    load();
  }

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div>
      <Link to="/clients" className="text-sm text-gray-500 hover:underline">
        ← Clients
      </Link>
      <div className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-900">Programmes de {client.nom}</h1>
        <Link
          to={`/clients/${clientId}/programmes/new`}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Nouveau programme
        </Link>
      </div>

      {programmes.length === 0 && (
        <p className="text-sm text-gray-500">Aucun programme pour ce client.</p>
      )}

      {programmes.length > 0 && (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
          {programmes.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-gray-900">{p.nom}</p>
                <p className="text-sm text-gray-500">
                  {labelTypeSplit(p.typeSplit)} · {p.frequence} j/semaine
                </p>
              </div>
              <div className="flex shrink-0 gap-2 text-sm">
                <Link
                  to={`/clients/${clientId}/programmes/${p.id}/calendrier`}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  Calendrier
                </Link>
                <Link
                  to={`/clients/${clientId}/programmes/${p.id}`}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  Modifier
                </Link>
                <button
                  type="button"
                  onClick={() => setDuplicateSource(p)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
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
