import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { clientsApi, seancesApi } from '../lib/api';

export function SeancesListPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([clientsApi.get(clientId), clientsApi.listSeances(clientId)])
      .then(([client, seances]) => {
        setClient(client);
        setSeances(seances);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(load, [load]);

  async function handleDelete(seance) {
    if (!window.confirm(`Supprimer la séance du ${new Date(seance.date).toLocaleDateString('fr-FR')} ?`)) return;
    await seancesApi.remove(seance.id);
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
        <h1 className="text-xl font-medium text-gray-900">Séances de {client.nom}</h1>
        <div className="flex gap-2">
          <Link
            to={`/clients/${clientId}/progression`}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Progression
          </Link>
          <Link
            to={`/clients/${clientId}/seances/new`}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Nouvelle séance
          </Link>
        </div>
      </div>

      {seances.length === 0 && <p className="text-sm text-gray-500">Aucune séance loguée pour ce client.</p>}

      {seances.length > 0 && (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
          {seances.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-gray-900">
                  {new Date(s.date).toLocaleDateString('fr-FR')} —{' '}
                  {s.jour ? `${s.jour.nom} (${s.jour.programme?.nom})` : 'Séance libre'}
                </p>
                <p className="text-sm text-gray-500">
                  {s.exercicesRealises.length} exercice(s)
                  {s.ressenti != null && ` · RPE ${s.ressenti}/10`}
                  {s.notes && ` · ${s.notes}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2 text-sm">
                <Link
                  to={`/clients/${clientId}/seances/${s.id}`}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  Modifier
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(s)}
                  className="rounded border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
