import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { clientsApi } from '../lib/api';
import { labelObjectif } from '../lib/constants';
import { DuplicateClientModal } from '../components/DuplicateClientModal';

export function ClientsListPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duplicateSource, setDuplicateSource] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    clientsApi
      .list({ search, archive: showArchived ? 'true' : undefined })
      .then(setClients)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, showArchived]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function toggleArchive(client) {
    await clientsApi.setArchive(client.id, !client.archive);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-900">Clients</h1>
        <Link
          to="/clients/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Nouveau client
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          type="search"
          placeholder="Rechercher un client…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Afficher les clients archivés
        </label>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Chargement…</p>}

      {!loading && clients.length === 0 && (
        <p className="text-sm text-gray-500">Aucun client trouvé.</p>
      )}

      {!loading && clients.length > 0 && (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
          {clients.map((client) => (
            <li key={client.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/clients/${client.id}`} className="font-medium text-gray-900 hover:underline">
                    {client.nom}
                  </Link>
                  {client.inactif && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {client.joursDepuisDerniereMesure == null
                        ? 'Jamais mesuré'
                        : `Pas de mesure depuis ${client.joursDepuisDerniereMesure} j`}
                    </span>
                  )}
                  {client.archive && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      Archivé
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{labelObjectif(client.objectif)}</p>
              </div>
              <div className="flex shrink-0 gap-2 text-sm">
                <Link
                  to={`/clients/${client.id}/programmes`}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  Programmes
                </Link>
                <Link
                  to={`/clients/${client.id}/nutrition`}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  Nutrition
                </Link>
                <Link
                  to={`/clients/${client.id}/seances`}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  Séances
                </Link>
                <Link
                  to={`/clients/${client.id}/mesures`}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  Mesures
                </Link>
                <button
                  type="button"
                  onClick={() => setDuplicateSource(client)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  Dupliquer vers
                </button>
                <button
                  type="button"
                  onClick={() => toggleArchive(client)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
                >
                  {client.archive ? 'Désarchiver' : 'Archiver'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {duplicateSource && (
        <DuplicateClientModal
          source={duplicateSource}
          clients={clients}
          onClose={() => setDuplicateSource(null)}
          onDuplicated={async (payload) => {
            await clientsApi.duplicate(duplicateSource.id, payload);
            load();
          }}
        />
      )}
    </div>
  );
}
