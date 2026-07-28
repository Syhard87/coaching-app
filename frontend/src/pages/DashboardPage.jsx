import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dashboardApi } from '../lib/api';
import { labelStatutSemaine, labelModuleAbonnement } from '../lib/constants';

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

  if (loading) return <p className="text-sm text-graphite-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-xl font-medium text-graphite-900">Tableau de bord</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded border border-chalk-200 bg-white p-5">
          <p className="text-sm text-graphite-500">Clients actifs</p>
          <p className="font-mono text-3xl font-medium text-graphite-900">{data.clientsActifs}</p>
        </div>
        <div className="rounded border border-chalk-200 bg-white p-5">
          <p className="text-sm text-graphite-500">Séances loguées cette semaine</p>
          <p className="font-mono text-3xl font-medium text-graphite-900">{data.seancesCetteSemaine}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-lg font-medium text-graphite-900">Abonnements à renouveler bientôt</h2>
        {data.abonnementsARenouveler.length === 0 ? (
          <p className="text-sm text-graphite-500">Aucun abonnement n'expire dans les 7 prochains jours.</p>
        ) : (
          <ul className="divide-y divide-chalk-200 rounded border border-chalk-200 bg-white">
            {data.abonnementsARenouveler.map((a, i) => (
              <li key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <Link to={`/clients/${a.clientId}`} className="font-medium text-graphite-900 hover:underline">
                    {a.clientNom}
                  </Link>
                  <p className="text-xs text-graphite-500">
                    {labelModuleAbonnement(a.module)} — expire le {new Date(a.dateFin).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-chalk-200">
                  <motion.div
                    className="h-full rounded-full bg-accent-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${a.pourcentageEcoule}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-medium text-graphite-900">Clients à relancer</h2>
        {data.clientsARelancer.length === 0 ? (
          <p className="text-sm text-graphite-500">Tous les clients ont une mesure récente.</p>
        ) : (
          <ul className="divide-y divide-chalk-200 rounded border border-chalk-200 bg-white text-sm">
            {data.clientsARelancer.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2">
                <Link to={`/clients/${c.id}`} className="text-graphite-900 hover:underline">
                  {c.nom}
                </Link>
                <span className="text-accent-700">
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
        <h2 className="mb-3 font-heading text-lg font-medium text-graphite-900">Deload / test cette semaine</h2>
        {data.clientsDeloadTest.length === 0 ? (
          <p className="text-sm text-graphite-500">Aucun client en semaine de deload ou de test cette semaine.</p>
        ) : (
          <ul className="divide-y divide-chalk-200 rounded border border-chalk-200 bg-white text-sm">
            {data.clientsDeloadTest.map((c, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2">
                <Link to={`/clients/${c.clientId}/programme`} className="text-graphite-900 hover:underline">
                  {c.clientNom}
                </Link>
                <span className="text-steel-600">
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
