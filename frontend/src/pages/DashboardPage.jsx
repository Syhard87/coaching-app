import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../lib/api';
import { labelStatutSemaine } from '../lib/constants';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-medium text-gray-900">Tableau de bord</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Clients actifs</p>
          <p className="text-3xl font-medium text-gray-900">{data.clientsActifs}</p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Séances loguées cette semaine</p>
          <p className="text-3xl font-medium text-gray-900">{data.seancesCetteSemaine}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium text-gray-900">Clients à relancer</h2>
        {data.clientsARelancer.length === 0 ? (
          <p className="text-sm text-gray-500">Tous les clients ont une mesure récente.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white text-sm">
            {data.clientsARelancer.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2">
                <Link to={`/clients/${c.id}`} className="text-gray-900 hover:underline">
                  {c.nom}
                </Link>
                <span className="text-amber-700">
                  {c.joursDepuisDerniereMesure == null
                    ? 'Jamais mesuré'
                    : `Pas de mesure depuis ${c.joursDepuisDerniereMesure} j`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-gray-900">Deload / test cette semaine</h2>
        {data.clientsDeloadTest.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun client en semaine de deload ou de test cette semaine.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white text-sm">
            {data.clientsDeloadTest.map((c, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2">
                <Link to={`/clients/${c.clientId}/programmes`} className="text-gray-900 hover:underline">
                  {c.clientNom}
                </Link>
                <span className="text-blue-700">
                  {c.programmeNom} — {c.cycleNom}, semaine {c.numeroSemaine} ({labelStatutSemaine(c.statut)})
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
