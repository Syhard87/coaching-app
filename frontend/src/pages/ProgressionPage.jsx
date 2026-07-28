import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { clientsApi } from '../lib/api';

export function ProgressionPage() {
  const { clientId } = useParams();
  const [noms, setNoms] = useState([]);
  const [exercice, setExercice] = useState('');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    clientsApi
      .listExercicesNoms(clientId)
      .then((noms) => {
        setNoms(noms);
        if (noms.length > 0) setExercice(noms[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(() => {
    if (!exercice) return;
    clientsApi
      .getProgression(clientId, exercice)
      .then((points) =>
        setPoints(points.map((p) => ({ ...p, date: p.date.slice(0, 10) })))
      )
      .catch((err) => setError(err.message));
  }, [clientId, exercice]);

  if (loading) return <p className="text-sm text-gray-500">Chargement…</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl">
      <Link to={`/clients/${clientId}/programme`} className="text-sm text-gray-500 hover:underline">
        ← Séances
      </Link>
      <h1 className="mb-6 mt-2 text-xl font-medium text-gray-900">Progression par exercice</h1>

      {noms.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun exercice loggé pour ce client pour l'instant.</p>
      ) : (
        <>
          <select
            value={exercice}
            onChange={(e) => setExercice(e.target.value)}
            className="mb-4 rounded border border-gray-300 px-3 py-2 text-sm"
          >
            {noms.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {points.length === 0 ? (
            <p className="text-sm text-gray-500">Pas de données pour cet exercice.</p>
          ) : (
            <div className="h-80 rounded border border-gray-200 bg-white p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'chargeRealisee' ? 'Charge (kg)' : name]}
                  />
                  <Line
                    type="monotone"
                    dataKey="chargeRealisee"
                    name="Charge (kg)"
                    stroke="#111827"
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
